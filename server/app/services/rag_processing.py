import logging
import fitz  # PyMuPDF
import asyncio
import base64
import io
import time
from PIL import Image
from typing import List, Tuple, Dict, Optional
from fastapi import HTTPException, UploadFile
import docx

from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_core.messages import SystemMessage, HumanMessage

from app.core.config import get_settings
from app.core.clients import (
    client_manager,
    blob_service_client, embeddings_client,
    deepseek_llm, gpt4o_chat_llm
)
from app.services.rate_limiter import rate_limiter

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logging.getLogger("azure.core.pipeline.policies.http_logging_policy").setLevel(logging.WARNING)
logging.getLogger("httpx").setLevel(logging.WARNING)

settings = get_settings()
logger = logging.getLogger(__name__)

# --- Constants ---
DEEPSEEK_SUMMARY_PROMPT = "Summarize the following technical text. Focus on retaining all key technical terms, specifications, data points, and core concepts. Be concise and remove any filler content."
DIAGRAM_DESCRIPTION_SYSTEM_PROMPT = "You are a specialist in technical and systems analysis. Analyze the provided image, which is a technical diagram. Your description should be detailed and structured. Use markdown lists to break down the components. Identify all visible elements, including shapes, icons, labels, and text. Describe the connections, arrows, and flows between components to explain their relationships and interactions. Infer the overall purpose or function of the system depicted in the diagram based on its structure."

# --- Helper Functions ---
async def upload_file_to_blob(file_data: bytes, container_name: str, blob_name: str) -> str:
    """Uploads a file to the specified Azure Blob Storage container."""
    try:
        blob_client = blob_service_client.get_blob_client(container=container_name, blob=blob_name)
        await blob_client.upload_blob(file_data, overwrite=True)
        logger.info(f"Successfully uploaded {blob_name} to {container_name}")
        return blob_client.url
    except Exception as e:
        logger.error(f"Failed to upload {blob_name} to {container_name}: {e}")
        raise HTTPException(status_code=500, detail="Failed to upload file to cloud storage.")

# --- Core RAG Processing Functions ---
async def process_document_background(
    doc_id: str,
    user_id: str,
    classroom_id: int,
    file_data: bytes,
    filename: str,
    content_type: str
):
    """This function runs in the background to process the document."""
    supabase = client_manager.get_supabase_client()
    try:
        if content_type == "application/pdf":
            pages_content, total_pages = await extract_text_from_pdf(file_data)
            diagram_page_indices = await identify_diagram_pages(file_data)
            diagram_data = await process_diagrams(file_data, diagram_page_indices, doc_id)
        elif content_type == "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
            pages_content, total_pages = await extract_text_from_docx(file_data)
            diagram_data = {}
        elif content_type.startswith("image/"):
            description = await _invoke_gpt4o_diagram(file_data, "Describe this image in detail.", f"Image description ({filename})")
            pages_content = [description]
            total_pages = 1
            diagram_data = {}
        else:
            raise ValueError(f"Unsupported content type for processing: {content_type}")

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
        await asyncio.to_thread(
            supabase.table('documents_uploaded').update({'status': 'failed'}).eq('document_id', doc_id).execute
        )

async def extract_text_from_docx(file_data: bytes) -> Tuple[List[str], int]:
    """Extracts text from a .docx file."""
    document = docx.Document(io.BytesIO(file_data))
    text = "\n".join([para.text for para in document.paragraphs])
    # For simplicity, we'll treat the whole docx as a single "page"
    return [text], 1


async def extract_text_from_pdf(file_data: bytes) -> Tuple[List[str], int]:
    with fitz.open(stream=file_data, filetype='pdf') as doc:
        total_pages = doc.page_count
        batch_size = 2
        page_batches = [(i, min(i + batch_size - 1, total_pages - 1)) for i in range(0, total_pages, batch_size)]
        
        logger.info(f"OCR: Processing {total_pages} pages in {len(page_batches)} batches.")
        
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

    logger.info(f"Completed OCR for {total_pages} pages.")
    return all_page_texts, total_pages

async def process_diagrams(file_data: bytes, diagram_pages: List[int], document_id: str) -> Dict[int, Tuple[str, str]]:
    if not diagram_pages:
        return {}
    
    async def _process_single_diagram(page_idx: int):
        try:
            compressed_image_data = await extract_and_compress_page_image(file_data, page_idx)
            if not compressed_image_data:
                return page_idx, None

            image_url = await upload_image_to_blob(compressed_image_data, document_id, page_idx + 1)
            prompt = f"This diagram is from page {page_idx+1}. Provide a detailed description."
            description = await _invoke_gpt4o_diagram(compressed_image_data, prompt, f"Diagram description (Page {page_idx+1})")
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
    
    logger.info(f"Doc '{doc_id}': Document split into {len(all_chunks_to_process)} chunks.")

    # Summarization, Embedding, and Storage
    summarized_contents = await asyncio.gather(*[_invoke_deepseek_summarizer(item['content']) for item in all_chunks_to_process])
    for i, item in enumerate(all_chunks_to_process):
        item['content'] = summarized_contents[i]

    embeddings = await generate_embeddings_safely([item['content'] for item in all_chunks_to_process])
    for i, item in enumerate(all_chunks_to_process):
        item['embedding'] = embeddings[i]

    chunks_added = await store_chunks_in_supabase(all_chunks_to_process, doc_id, user_id, classroom_id)

    return all_chunks_to_process, chunks_added

# --- Helper Functions ---
async def _invoke_deepseek_summarizer(text_to_summarize: str) -> str:
    if not deepseek_llm:
        logger.warning("DeepSeek summarizer not configured. Summarization will be skipped.")
        return text_to_summarize

    await rate_limiter.check_and_wait('deepseek')
    logger.info("Starting summarization for a chunk.")
    messages = [SystemMessage(content=DEEPSEEK_SUMMARY_PROMPT), HumanMessage(content=text_to_summarize)]
    try:
        response = await deepseek_llm.ainvoke(messages)
        # Strip the <think> block from the response
        summary = response.content.split('</think>')[-1].strip()
        logger.info("Successfully summarized a chunk.")
        return summary if summary else text_to_summarize
    except Exception as e:
        logger.error(f"Error calling DeepSeek API, returning original text: {e}")
        return text_to_summarize

def validate_file(file: UploadFile, data: bytes):
    allowed_types = [
        "application/pdf",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "image/jpeg",
        "image/png"
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

async def generate_embeddings_safely(chunks: List[str]) -> List[List[float]]:
    if not chunks: return []
    embeddings_list = []
    for i in range(0, len(chunks), settings.EMBEDDING_BATCH_SIZE):
        batch = chunks[i:i + settings.EMBEDDING_BATCH_SIZE]
        await rate_limiter.check_and_wait('embedding')
        try:
            batch_embeddings = await embeddings_client.aembed_documents(batch)
            embeddings_list.extend(batch_embeddings)
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Failed to generate embeddings: {e}")
    return embeddings_list

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

async def _invoke_gpt4o_diagram(image_data: bytes, prompt: str, task_name: str) -> str:
    if not gpt4o_chat_llm:
        logger.warning("GPT-4o client not available. Skipping diagram description.")
        return "Diagram description not available."

    await rate_limiter.check_and_wait('gpt4o')
    logger.info(f"Invoking GPT-4o for diagram: {task_name}")
    image_b64 = base64.b64encode(image_data).decode("utf-8")
    messages = [
        SystemMessage(content=DIAGRAM_DESCRIPTION_SYSTEM_PROMPT),
        HumanMessage(content=[
            {"type": "text", "text": prompt},
            {"type": "image_url", "image_url": {"url": f"data:image/jpeg;base64,{image_b64}"}}
        ])
    ]
    try:
        response = await gpt4o_chat_llm.ainvoke(messages)
        if response.content:
            logger.info(f"Received diagram description for {task_name}")
            return response.content.strip()
        raise Exception("Empty response from GPT-4o vision")
    except Exception as e:
        logger.error(f"Error invoking GPT-4o vision for {task_name}: {e}")
        raise

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
        blob_client = blob_service_client.get_blob_client(container=settings.AZURE_STORAGE_CONTAINER_NAME, blob=blob_name)
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