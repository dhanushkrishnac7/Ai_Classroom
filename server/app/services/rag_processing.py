import logging
import fitz  # PyMuPDF
import asyncio
import base64
import io
import time
import os
import tempfile
import docx
import cv2
import numpy as np
import openai
import yt_dlp
from PIL import Image
from typing import List, Tuple, Dict, Optional
from fastapi import HTTPException, UploadFile
from moviepy.editor import VideoFileClip

from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_core.messages import SystemMessage, HumanMessage

from app.core.config import get_settings
from app.core.clients import client_manager
from app.services.rate_limiter import rate_limiter

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logging.getLogger("azure.core.pipeline.policies.http_logging_policy").setLevel(logging.WARNING)
logging.getLogger("httpx").setLevel(logging.WARNING)

settings = get_settings()
logger = logging.getLogger(__name__)

# --- Constants ---
DEEPSEEK_SUMMARY_PROMPT = "Compress the following text into key points only. Remove redundant information, filler words, and repetitive content. Focus on essential technical information and main concepts. Maximum 50% of original length:"
DIAGRAM_DESCRIPTION_SYSTEM_PROMPT = "You are a specialist in technical and systems analysis. Analyze the provided image, which is a technical diagram. Your description should be detailed and structured. Use markdown lists to break down the components. Identify all visible elements, including shapes, icons, labels, and text. Describe the connections, arrows, and flows between components to explain their relationships and interactions. Infer the overall purpose or function of the system depicted in the diagram based on its structure."

# --- Helper Functions ---
async def upload_file_to_blob(file_data: bytes, container_name: str, blob_name: str) -> str:
    """Uploads a file to the specified Azure Blob Storage container."""
    try:
        blob_client = client_manager.blob_service_client.get_blob_client(container=container_name, blob=blob_name)
        await blob_client.upload_blob(file_data, overwrite=True)
        logger.info(f"Successfully uploaded {blob_name} to {container_name}")
        return blob_client.url
    except Exception as e:
        logger.error(f"Failed to upload {blob_name} to {container_name}: {e}")
        raise HTTPException(status_code=500, detail="Failed to upload file to cloud storage.")

def clean_text(text: str) -> str:
    return ' '.join(text.replace('\x00', '').strip().split()) if text else ""

def chunk_text(text: str) -> List[str]:
    splitter = RecursiveCharacterTextSplitter(
        chunk_size=settings.MAX_CHUNK_SIZE,
        chunk_overlap=settings.CHUNK_OVERLAP,
        length_function=len
    )
    chunks = splitter.split_text(clean_text(text))
    return [c for c in chunks if len(clean_text(c)) >= 10]

async def _invoke_deepseek_summarizer(text: str) -> str:
    if not client_manager.deepseek_llm:
        return text
    messages = [SystemMessage(content=DEEPSEEK_SUMMARY_PROMPT), HumanMessage(content=text)]
    response = await client_manager.deepseek_llm.ainvoke(messages)
    summary = response.content.split('</think>')[-1].strip()
    return summary if summary else text

async def generate_embeddings_safely(chunks: List[str]) -> List[List[float]]:
    if not chunks: return []
    return await client_manager.embeddings.aembed_documents(chunks)

# --- Video Processing ---

def compress_frame(frame: np.ndarray, max_width: int = 512, max_height: int = 512, quality: int = 60) -> bytes:
    """Compress frame to reduce token usage for GPT-4o vision."""
    height, width = frame.shape[:2]
    
    if width > max_width or height > max_height:
        scale = min(max_width / width, max_height / height)
        new_width = int(width * scale)
        new_height = int(height * scale)
        frame = cv2.resize(frame, (new_width, new_height), interpolation=cv2.INTER_AREA)
    
    encode_params = [cv2.IMWRITE_JPEG_QUALITY, quality]
    _, buffer = cv2.imencode('.jpg', frame, encode_params)
    
    return buffer.tobytes()

async def transcribe_audio(video_path: str) -> List[Dict]:
    logger.info("Extracting audio and transcribing...")
    start_time = time.time()
    
    try:
        if not all([settings.AZURE_WHISPER_ENDPOINT, settings.AZURE_WHISPER_API_KEY, settings.AZURE_WHISPER_API_VERSION, settings.AZURE_WHISPER_DEPLOYMENT_NAME]):
            logger.error("Azure Whisper credentials not found or incomplete in .env file.")
            return []
        
        audio = VideoFileClip(video_path).audio
        with tempfile.NamedTemporaryFile(delete=False, suffix=".mp3") as temp_audio_file:
            audio.write_audiofile(
                temp_audio_file.name, 
                codec="mp3", 
                bitrate="64k",
                verbose=False, 
                logger=None
            )
            temp_audio_path = temp_audio_file.name
        
        azure_client = openai.AzureOpenAI(
            azure_endpoint=settings.AZURE_WHISPER_ENDPOINT,
            api_key=settings.AZURE_WHISPER_API_KEY,
            api_version=settings.AZURE_WHISPER_API_VERSION
        )

        with open(temp_audio_path, "rb") as audio_file:
            transcript = await asyncio.to_thread(
                azure_client.audio.transcriptions.create,
                model=settings.AZURE_WHISPER_DEPLOYMENT_NAME,
                file=audio_file
            )
        os.remove(temp_audio_path)
        
        full_text = clean_text(transcript.text)
        summarized_text = await _invoke_deepseek_summarizer(full_text)
        chunks = chunk_text(summarized_text)
        
        duration = audio.duration
        result = [{"type": "transcript", "timestamp": int((i / len(chunks)) * duration * 1000), "content": chunk} for i, chunk in enumerate(chunks)]
        
        return result
    except Exception as e:
        logger.error(f"Error during audio transcription: {e}")
        return []

async def extract_key_frames(video_path: str) -> List[Tuple[int, bytes]]:
    logger.info("Extracting key-frames...")
    key_frames = []
    cap = cv2.VideoCapture(video_path)
    
    fps = cap.get(cv2.CAP_PROP_FPS)
    total_frames = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
    
    interval_seconds = 20
    frame_interval = int(fps * interval_seconds) if fps > 0 else 300
    
    frame_positions = list(range(0, total_frames, frame_interval))
    if 0 not in frame_positions:
        frame_positions.insert(0, 0)
    if total_frames - 1 not in frame_positions:
        frame_positions.append(total_frames - 1)
    
    prev_gray = None
    difference_threshold = 30.0
    
    for frame_pos in frame_positions:
        cap.set(cv2.CAP_PROP_POS_FRAMES, frame_pos)
        ret, frame = cap.read()
        
        if ret:
            timestamp = cap.get(cv2.CAP_PROP_POS_MSEC)
            gray_frame = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
            
            if prev_gray is None:
                compressed_frame = compress_frame(frame)
                key_frames.append((int(timestamp), compressed_frame))
                prev_gray = gray_frame
                continue
            
            diff = cv2.absdiff(gray_frame, prev_gray)
            diff_percentage = (np.mean(diff) / 255.0) * 100
            
            if diff_percentage >= difference_threshold:
                compressed_frame = compress_frame(frame)
                key_frames.append((int(timestamp), compressed_frame))
            
            prev_gray = gray_frame

    cap.release()
    return key_frames

async def ocr_key_frame(image_data: bytes) -> str:
    try:
        poller = await client_manager.ocr.begin_analyze_document("prebuilt-read", image_data)
        result = await poller.result()
        return "\n".join([line.content for page in result.pages for line in page.lines])
    except Exception as e:
        logger.error(f"Error during OCR: {e}")
        return ""

async def _invoke_gpt4o_diagram(image_data: bytes, prompt: str) -> str:
    if not client_manager.gpt4o_chat_llm:
        return ""
    
    image_base64 = base64.b64encode(image_data).decode('utf-8')
    message = HumanMessage(
        content=[
            {"type": "text", "text": prompt},
            {"type": "image_url", "image_url": {"url": f"data:image/png;base64,{image_base64}"}}
        ]
    )
    response = await client_manager.gpt4o_chat_llm.ainvoke([message])
    return response.content.strip() if response.content else ""

async def describe_diagram(image_data: bytes) -> str:
    return await _invoke_gpt4o_diagram(image_data, "Describe the technical content of this diagram, including shapes, labels, and relationships.")

async def embed_and_store_video_chunks(chunks: List[Dict], video_id: str, user_id: str, classroom_id: int, filename: str):
    if not chunks:
        return

    contents = [chunk['content'] for chunk in chunks]
    embeddings = await generate_embeddings_safely(contents)
    
    supabase = client_manager.get_supabase_client()

    # Create a corresponding document record for the video
    doc_record = {
        'document_id': video_id, 'uploaded_by': user_id, 'document_name': filename,
        'document_url': f"video://{video_id}", 'classroom_id': classroom_id,
        'is_class_context': True, 'status': 'completed', 'total_chunks_in_doc': len(chunks)
    }
    await asyncio.to_thread(supabase.table('documents_uploaded').insert(doc_record).execute)

    rows = []
    for i, chunk in enumerate(chunks):
        metadata = {
            "chunk_type": chunk['type'],
            "start_time_ms": chunk['timestamp'],
            "source": filename
        }
        rows.append({
            'document_id': video_id,
            'user_id': user_id,
            'chunk_index': i,
            'content': chunk['content'],
            'embedding': embeddings[i],
            'metadata': metadata,
            'classroom_id': classroom_id
        })
        
    try:
        supabase.table('document_chunks').insert(rows).execute()
    except Exception as e:
        logger.error(f"Failed to store video chunks: {e}")

async def process_video(video_id: str, user_id: str, classroom_id: int, file_data: bytes, filename: str):
    with tempfile.NamedTemporaryFile(delete=False, suffix=".mp4") as temp_video_file:
        temp_video_file.write(file_data)
        temp_video_path = temp_video_file.name

    try:
        transcript_task = asyncio.create_task(transcribe_audio(temp_video_path))
        frames_task = asyncio.create_task(extract_key_frames(temp_video_path))
        
        transcript_chunks, key_frames = await asyncio.gather(transcript_task, frames_task)
        
        frame_chunks = []
        if key_frames:
            frame_tasks = []
            for timestamp, frame_image in key_frames:
                ocr_task = asyncio.create_task(ocr_key_frame(frame_image))
                diagram_task = asyncio.create_task(describe_diagram(frame_image))
                frame_tasks.append((timestamp, ocr_task, diagram_task))
            
            for timestamp, ocr_task, diagram_task in frame_tasks:
                ocr_text, diagram_desc = await asyncio.gather(ocr_task, diagram_task)
                if ocr_text:
                    frame_chunks.append({"type": "ocr_frame", "timestamp": timestamp, "content": ocr_text})
                if diagram_desc:
                    frame_chunks.append({"type": "diagram", "timestamp": timestamp, "content": diagram_desc})
        
        all_content = transcript_chunks + frame_chunks
        all_content.sort(key=lambda x: x['timestamp'])
        
        await embed_and_store_video_chunks(all_content, video_id, user_id, classroom_id, filename)
        
        supabase = client_manager.get_supabase_client()
        await asyncio.to_thread(
            supabase.table('videos_uploaded').update({'status': 'completed'}).eq('video_id', video_id).execute
        )
        logger.info(f"Successfully processed and stored video {video_id}")

    except Exception as e:
        supabase = client_manager.get_supabase_client()
        await asyncio.to_thread(
            supabase.table('videos_uploaded').update({'status': 'failed'}).eq('video_id', video_id).execute
        )
        logger.error(f"Failed to process video {video_id}: {e}")
    finally:
        os.remove(temp_video_path)
        
async def process_youtube_video(youtube_url: str, video_id: str, user_id: str, classroom_id: int):
    temp_video_path = None
    try:
        temp_dir = tempfile.mkdtemp()
        ydl_opts = {
            'format': 'best[ext=mp4][height<=720]/best[ext=mp4]/mp4/best',
            'outtmpl': os.path.join(temp_dir, '%(title)s.%(ext)s'),
            'quiet': True,
            'no_warnings': True,
        }

        with yt_dlp.YoutubeDL(ydl_opts) as ydl:
            info = ydl.extract_info(youtube_url, download=True)
            video_title = info.get('title', 'Unknown Video')

        downloaded_files = [f for f in os.listdir(temp_dir) if f.endswith(('.mp4', '.webm', '.mkv'))]
        if not downloaded_files:
            return
            
        temp_video_path = os.path.join(temp_dir, downloaded_files[0])
        with open(temp_video_path, "rb") as f:
            file_data = f.read()
        
        await process_video(video_id, user_id, classroom_id, file_data, video_title)
    
    finally:
        if temp_video_path and os.path.exists(temp_video_path):
            os.remove(temp_video_path)
        if 'temp_dir' in locals() and os.path.exists(temp_dir):
            import shutil
            shutil.rmtree(temp_dir)


# --- Core RAG Processing Functions ---
async def process_document_background(
    doc_id: str,
    user_id: str,
    classroom_id: int,
    file_data: bytes = None,
    filename: str = None,
    content_type: str = None,
    youtube_url: str = None,
    task_type: str = "document",
    **kwargs
):
    """This function runs in the background to process the document."""
    supabase = client_manager.get_supabase_client()
    try:
        if task_type == "video":
             await process_video(doc_id, user_id, classroom_id, file_data, filename)
        
        elif task_type == "youtube":
            await process_youtube_video(youtube_url, doc_id, user_id, classroom_id)

        elif content_type == "application/pdf":
            pages_content, total_pages = await extract_text_from_pdf(file_data)
            diagram_page_indices = await identify_diagram_pages(file_data)
            diagram_data = await process_diagrams(file_data, diagram_page_indices, doc_id)
        elif content_type == "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
            pages_content, total_pages = await extract_text_from_docx(file_data)
            diagram_data = {}
        elif content_type.startswith("image/"):
            description = await _invoke_gpt4o_diagram(file_data, "Describe this image in detail.")
            pages_content = [description]
            total_pages = 1
            diagram_data = {}
        else:
            raise ValueError(f"Unsupported content type for processing: {content_type}")

        if task_type == "document":
            if not any(pages_content) and not diagram_data:
                raise ValueError("No text or diagrams could be extracted from the document.")
            
            _, chunks_added = await process_and_store_chunks(
                pages_content, diagram_data, filename, total_pages, doc_id, user_id, classroom_id
            )
            update_record = {
                'total_chunks_in_doc': chunks_added,
                'total_pages': total_pages,
                'status': 'completed'
            }
            await asyncio.to_thread(
                supabase.table('documents_uploaded').update(update_record).eq('document_id', doc_id).execute
            )
        logger.info(f"Doc '{doc_id}': Successfully completed background processing.")
    except Exception as e:
        logger.error(f"Doc '{doc_id}': Background processing failed: {e}", exc_info=True)
        if task_type == "document":
            await asyncio.to_thread(
                supabase.table('documents_uploaded').update({'status': 'failed'}).eq('document_id', doc_id).execute
            )
        elif task_type in ["video", "youtube"]:
            await asyncio.to_thread(
                supabase.table('videos_uploaded').update({'status': 'failed'}).eq('video_id', doc_id).execute
            )

async def extract_text_from_docx(file_data: bytes) -> Tuple[List[str], int]:
    """Extracts text from a .docx file."""
    document = docx.Document(io.BytesIO(file_data))
    text = "\n".join([para.text for para in document.paragraphs])
    return [text], 1


async def extract_text_from_pdf(file_data: bytes) -> Tuple[List[str], int]:
    with fitz.open(stream=file_data, filetype='pdf') as doc:
        total_pages = doc.page_count
        batch_size = 2
        page_batches = [(i, min(i + batch_size - 1, total_pages - 1)) for i in range(0, total_pages, batch_size)]
        
        all_page_texts = [""] * total_pages
        
        async def process_batch(start_page, end_page):
            await rate_limiter.check_and_wait('ocr')
            try:
                with fitz.open() as temp_doc:
                    temp_doc.insert_pdf(doc, from_page=start_page, to_page=end_page)
                    poller = await client_manager.ocr.begin_analyze_document("prebuilt-read", temp_doc.tobytes())
                    result = await poller.result()
                
                for page in result.pages:
                    page_idx = start_page + page.page_number - 1
                    if page_idx < total_pages:
                        extracted_text = clean_text("\n".join(line.content for line in page.lines))
                        all_page_texts[page_idx] = extracted_text

            except Exception as e:
                logger.error(f"OCR: Failed to process pages {start_page+1}-{end_page+1}: {e}")

        tasks = [process_batch(start, end) for start, end in page_batches]
        await asyncio.gather(*tasks, return_exceptions=True)

    return all_page_texts, total_pages

async def process_diagrams(file_data: bytes, diagram_pages: List[int], document_id: str) -> Dict[int, Tuple[str, str]]:
    if not diagram_pages:
        return {}
    
    async def _process_single_diagram(page_idx: int):
        try:
            compressed_image_data = await extract_and_compress_page_image(file_data, page_idx)
            if not compressed_image_data:
                return page_idx, None

            image_url = await upload_image_to_blob(compressed_image_data, settings.AZURE_STORAGE_CONTAINER_NAME, f"{document_id}/diagram_page_{page_idx+1}.jpeg")
            prompt = f"This diagram is from page {page_idx+1}. Provide a detailed description."
            description = await _invoke_gpt4o_diagram(compressed_image_data, prompt)
            return page_idx, (description, image_url)
        except Exception as e:
            logger.error(f"Failed to process diagram on page {page_idx+1}: {e}")
            return page_idx, None

    tasks = [_process_single_diagram(page_idx) for page_idx in diagram_pages]
    results = await asyncio.gather(*tasks)
    
    return {page_idx: result_tuple for page_idx, result_tuple in results if result_tuple is not None}

async def process_and_store_chunks(pages_content, diagram_data, filename, total_pages, doc_id, user_id, classroom_id):
    all_chunks_to_process = []
    base_meta = {'filename': filename, 'total_pages': total_pages, 'document_id': doc_id}
    for i, page_text in enumerate(pages_content):
        meta = {'page_number': i + 1, **base_meta}
        content = page_text
        if i in diagram_data:
            desc, url = diagram_data[i]
            content += f"\n\n--- DIAGRAM DESCRIPTION ---\n{desc}"
            meta.update({'content_type': 'text_and_diagram', 'image_url': url})
        else:
            meta['content_type'] = 'text'

        if clean_text(content):
            for chunk in chunk_text(content):
                all_chunks_to_process.append({'content': chunk, 'metadata': meta})
    
    if not all_chunks_to_process:
        raise HTTPException(status_code=400, detail="Document content is too sparse to be processed.")
    
    summarized_contents = await asyncio.gather(*[_invoke_deepseek_summarizer(item['content']) for item in all_chunks_to_process])
    for i, item in enumerate(all_chunks_to_process):
        item['content'] = summarized_contents[i]

    embeddings = await generate_embeddings_safely([item['content'] for item in all_chunks_to_process])
    for i, item in enumerate(all_chunks_to_process):
        item['embedding'] = embeddings[i]

    chunks_added = await store_chunks_in_supabase(all_chunks_to_process, doc_id, user_id, classroom_id)

    return all_chunks_to_process, chunks_added

async def store_chunks_in_supabase(chunk_data: List[Dict], doc_id: str, user_id: str, classroom_id: int) -> int:
    if not chunk_data: return 0
    rows = [{
        'document_id': doc_id, 'user_id': user_id, 'chunk_index': i,
        'content': d['content'], 'embedding': d['embedding'], 'metadata': d['metadata'],
        'classroom_id': classroom_id
    } for i, d in enumerate(chunk_data)]
    try:
        supabase = client_manager.get_supabase_client()
        res = await asyncio.to_thread(supabase.table('document_chunks').insert(rows).execute)
        return len(res.data)
    except Exception as e:
        logger.error(f"Supabase chunk insert failed: {e}")
        raise HTTPException(status_code=500, detail="Failed to store document chunks in the database.")

def validate_file(file: UploadFile, data: bytes):
    allowed_types = [
        "application/pdf",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "image/jpeg",
        "image/png",
        "video/mp4",
    ]
    if file.content_type not in allowed_types:
        raise HTTPException(status_code=400, detail=f"Unsupported file type. Allowed types are: {', '.join(allowed_types)}")
    if len(data) > settings.MAX_FILE_SIZE:
        raise HTTPException(status_code=400, detail=f"File size exceeds limit of {settings.MAX_FILE_SIZE / 1_000_000} MB.")
    if not data:
        raise HTTPException(status_code=400, detail="Uploaded file is empty.")
    if file.content_type == "application/pdf":
        try:
            with fitz.open(stream=data, filetype='pdf') as doc:
                if doc.page_count == 0:
                    raise HTTPException(status_code=400, detail="PDF has no pages.")
                if doc.page_count > settings.MAX_PAGES:
                    raise HTTPException(status_code=400, detail=f"PDF exceeds max pages ({settings.MAX_PAGES}).")
        except Exception:
            raise HTTPException(status_code=400, detail="Invalid or corrupted PDF file.")


def compress_image(image_data: bytes, max_width: int, max_height: int, quality: int) -> bytes:
    with Image.open(io.BytesIO(image_data)) as img:
        if img.mode in ('RGBA', 'LA', 'P'):
            img = img.convert('RGB')
        img.thumbnail((max_width, max_height), Image.Resampling.LANCZOS)
        output = io.BytesIO()
        img.save(output, format='JPEG', quality=quality, optimize=True)
        return output.getvalue()

async def upload_image_to_blob(image_data: bytes, document_id: str, page_num: int) -> str:
    blob_name = f"{document_id}/diagram_page_{page_num}.jpeg"
    try:
        blob_client = client_manager.blob_service_client.get_blob_client(container=settings.AZURE_STORAGE_CONTAINER_NAME, blob=blob_name)
        await blob_client.upload_blob(image_data, overwrite=True, content_type="image/jpeg")
        return blob_client.url
    except Exception as e:
        logger.error(f"Failed to upload image for doc {document_id}, page {page_num}: {e}")
        raise HTTPException(status_code=500, detail="Failed to upload image")

async def identify_diagram_pages(file_data: bytes) -> List[int]:
    pages = []
    with fitz.open(stream=file_data, filetype='pdf') as doc:
        for num, page in enumerate(doc):
            area, img_area, txt_area = float(abs(page.rect)), 0.0, 0.0
            if area <= 0: continue
            for b in page.get_text('blocks'):
                if '<image:' in str(b[4]):
                    img_area += abs(fitz.Rect(b[:4]))
                else:
                    txt_area += abs(fitz.Rect(b[:4]))
            for i in page.get_images(full=True):
                img_area += abs(page.get_image_bbox(i))
            if (img_area / area > 0.4) and (txt_area / area < 0.2):
                pages.append(num)
    return pages

async def extract_and_compress_page_image(file_data: bytes, page_num: int) -> Optional[bytes]:
    try:
        with fitz.open(stream=file_data, filetype='pdf') as doc:
            pix = await asyncio.to_thread(doc[page_num].get_pixmap, matrix=fitz.Matrix(2.0, 2.0))
            raw_image_data = await asyncio.to_thread(pix.tobytes, output="png")
            return await asyncio.to_thread(
                compress_image,
                raw_image_data,
                settings.DIAGRAM_MAX_WIDTH,
                settings.DIAGRAM_MAX_HEIGHT,
                settings.DIAGRAM_JPEG_QUALITY
            )
    except Exception as e:
        logger.error(f"Could not extract/compress image from page {page_num}: {e}")
        return None