import uuid
import logging
import asyncio
import time
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form, status

from app.core.clients import client_manager
from app.core.config import get_settings
from app.schemas.classroom import (
    DocumentsUploaded, VideoUploaded, BlogsUploaded, WorkAssigned, 
    AddBlog, AssignWork
)
from app.services.auth import verify_token
from app.services.rag_processing import (
    upload_file_to_blob, 
    validate_file as validate_pdf_file,
    extract_text_from_pdf, 
    chunk_text, 
    clean_text, 
    _invoke_deepseek_summarizer, 
    generate_embeddings_safely, 
    store_chunks_in_supabase,
    identify_diagram_pages,
    process_diagrams
)

router = APIRouter()
settings = get_settings()
logger = logging.getLogger(__name__)

async def _verify_admin_or_owner(classroom_id: int, user_id: str) -> bool:
    supabase = client_manager.get_supabase_client()
    owner_res = await asyncio.to_thread(
        supabase.table("classrooms").select("owner_id").eq("id", classroom_id).single().execute
    )
    if owner_res.data and owner_res.data['owner_id'] == user_id:
        return True
    
    admin_res = await asyncio.to_thread(
        supabase.table("admins_of_classrooms").select("id").eq("classroom_id", classroom_id).eq("profile_id", user_id).execute
    )
    if admin_res.data:
        return True
        
    return False

@router.post("/classroom/{classroom_id}/document", status_code=status.HTTP_201_CREATED, response_model=DocumentsUploaded)
async def add_document_to_classroom(
    classroom_id: int,
    token: dict = Depends(verify_token),
    file: UploadFile = File(...),
    is_class_context: bool = Form(...),
    unit_no: Optional[int] = Form(None),
    origin_blog: Optional[str] = Form(None),
    origin_work: Optional[str] = Form(None)
):
    start_time = time.time()
    user_id = token["sub"]
    if not await _verify_admin_or_owner(classroom_id, user_id):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Only admins or the owner can add documents.")

    doc_id = str(uuid.uuid4())
    logger.info(f"Initiating processing for doc '{doc_id}' (filename: {file.filename}).")

    if origin_blog == "string" or not origin_blog: origin_blog = None
    if origin_work == "string" or not origin_work: origin_work = None

    data = await file.read()
    validate_pdf_file(file, data)
    logger.info(f"Doc '{doc_id}': File validated successfully.")
    
    try:
        document_url = await upload_file_to_blob(data, settings.AZURE_DOCS_CONTAINER_NAME, f"{doc_id}_{file.filename}")
        logger.info(f"Doc '{doc_id}': Uploaded to Azure Blob Storage at {document_url}.")

        initial_doc_record = {
            'document_id': doc_id, 'uploaded_by': user_id, 'document_name': file.filename,
            'document_url': document_url, 'classroom_id': classroom_id, 'unit_no': unit_no,
            'origin_blog': origin_blog, 'origin_work': origin_work, 'is_class_context': is_class_context,
            'total_chunks_in_doc': 0
        }
        
        supabase = client_manager.get_supabase_client()
        insert_response = await asyncio.to_thread(
            supabase.table('documents_uploaded').insert(initial_doc_record).execute
        )
        if not insert_response.data:
            raise HTTPException(status_code=500, detail="Failed to create initial document record.")
        logger.info(f"Doc '{doc_id}': Initial record created in 'documents_uploaded' table.")

        if is_class_context:
            logger.info(f"Doc '{doc_id}': Starting RAG processing.")
            
            tasks = {
                "ocr": asyncio.create_task(extract_text_from_pdf(data)),
                "diagrams": asyncio.create_task(identify_diagram_pages(data)),
            }

            pages_content, total_pages = await tasks["ocr"]
            diagram_page_indices = await tasks["diagrams"]
            logger.info(f"Doc '{doc_id}': Identified {len(diagram_page_indices)} potential diagram pages: {diagram_page_indices}")

            diagram_data = await process_diagrams(data, diagram_page_indices, doc_id)

            if not any(pages_content) and not diagram_data:
                raise HTTPException(status_code=400, detail="No text or diagrams extracted from the document.")

            all_chunks_to_process = []
            base_meta = {'filename': file.filename, 'total_pages': total_pages, 'document_id': doc_id}
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

            summarized_contents = await asyncio.gather(*[_invoke_deepseek_summarizer(item['content']) for item in all_chunks_to_process])
            for i, item in enumerate(all_chunks_to_process):
                item['content'] = summarized_contents[i]
            logger.info(f"Doc '{doc_id}': Summarization complete.")

            embeddings = await generate_embeddings_safely([item['content'] for item in all_chunks_to_process])
            for i, item in enumerate(all_chunks_to_process):
                item['embedding'] = embeddings[i]
            logger.info(f"Doc '{doc_id}': Embedding generation complete.")

            chunks_added = await store_chunks_in_supabase(all_chunks_to_process, doc_id, user_id, classroom_id, unit_no)
            logger.info(f"Doc '{doc_id}': Stored {chunks_added} chunks in 'document_chunks' table.")

            update_record = {'total_chunks_in_doc': chunks_added, 'total_pages': total_pages}
            supabase = client_manager.get_supabase_client()
            await asyncio.to_thread(
                supabase.table('documents_uploaded').update(update_record).eq('document_id', doc_id).execute
            )

        supabase = client_manager.get_supabase_client()
        final_doc_response = await asyncio.to_thread(
            supabase.table('documents_uploaded').select('*').eq('document_id', doc_id).single().execute
        )
        final_doc = final_doc_response.data
        processing_time = time.time() - start_time
        logger.info(f"Doc '{doc_id}': Successfully processed in {processing_time:.2f}s.")
        return DocumentsUploaded.from_orm(final_doc)

    except HTTPException as he:
        raise he
    except Exception as e:
        logger.critical(f"Critical error adding document to classroom {classroom_id}: {e}", exc_info=True)
        if 'violates foreign key constraint' in str(e):
             raise HTTPException(status_code=400, detail="Invalid reference: Ensure classroom, blog, or work exists.")
        raise HTTPException(status_code=500, detail=str(e))

# ... other endpoints remain the same ...
@router.post("/classroom/{classroom_id}/video", status_code=status.HTTP_201_CREATED, response_model=VideoUploaded)
async def add_video_to_classroom(
    classroom_id: int,
    token: dict = Depends(verify_token),
    file: UploadFile = File(...),
    unit_no: Optional[int] = Form(None),
    origin_blog: Optional[str] = Form(None),
    origin_work: Optional[str] = Form(None)
):
    user_id = token["sub"]
    if not await _verify_admin_or_owner(classroom_id, user_id):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Only admins or the owner can add videos.")

    if origin_blog == "string" or not origin_blog: origin_blog = None
    if origin_work == "string" or not origin_work: origin_work = None

    data = await file.read()
    if not data:
        raise HTTPException(status_code=400, detail="Video file is empty.")
        
    video_id = str(uuid.uuid4())
    blob_name = f"{video_id}_{file.filename}"
    
    try:
        video_url = await upload_file_to_blob(data, settings.AZURE_VIDEOS_CONTAINER_NAME, blob_name)
        
        video_record = {
            'video_id': video_id, 'video_name': file.filename, 'video_url': video_url,
            'uploaded_by': user_id, 'classroom_id': classroom_id, 'unit_no': unit_no,
            'origin_blog': origin_blog, 'origin_work': origin_work
        }
        
        supabase = client_manager.get_supabase_client()
        response = await asyncio.to_thread(
            supabase.table('videos_uploaded').insert(video_record).execute
        )
        
        if not response.data:
            raise HTTPException(status_code=500, detail="Failed to save video record to the database.")
            
        return VideoUploaded.from_orm(response.data[0])
        
    except Exception as e:
        logger.critical(f"Error adding video to classroom {classroom_id}: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/classroom/{classroom_id}/blog", status_code=status.HTTP_201_CREATED, response_model=BlogsUploaded)
async def add_blog_to_classroom(classroom_id: int, blog_data: AddBlog, token: dict = Depends(verify_token)):
    user_id = token["sub"]
    if not await _verify_admin_or_owner(classroom_id, user_id):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Only admins or the owner can add blogs.")
    insert_data = blog_data.model_dump()
    insert_data.update({'classroom_id': classroom_id, 'uploaded_by': user_id})
    
    supabase = client_manager.get_supabase_client()
    response = await asyncio.to_thread(
        supabase.table("blogs_uploaded").insert(insert_data).execute
    )
    if not response.data:
        raise HTTPException(status_code=500, detail="Failed to create blog post.")
    new_blog = response.data[0]
    new_blog.setdefault('documents_uploaded', [])
    new_blog.setdefault('videos_uploaded', [])
    return BlogsUploaded.from_orm(new_blog)

@router.post("/classroom/{classroom_id}/work", status_code=status.HTTP_201_CREATED, response_model=WorkAssigned)
async def assign_work_to_classroom(classroom_id: int, work_data: AssignWork, token: dict = Depends(verify_token)):
    user_id = token["sub"]
    if not await _verify_admin_or_owner(classroom_id, user_id):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Only admins or the owner can assign work.")
    insert_data = work_data.model_dump()
    insert_data.update({'classroom_id': classroom_id, 'assigned_by': user_id})
    
    supabase = client_manager.get_supabase_client()
    response = await asyncio.to_thread(
        supabase.table("work_assigned").insert(insert_data).execute
    )
    if not response.data:
        raise HTTPException(status_code=500, detail="Failed to assign work.")
    new_work = response.data[0]
    new_work.setdefault('documents_uploaded', [])
    new_work.setdefault('videos_uploaded', [])
    return WorkAssigned.from_orm(new_work)