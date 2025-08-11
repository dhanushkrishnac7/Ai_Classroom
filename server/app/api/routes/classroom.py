import uuid
import logging
import asyncio
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form, status
from fastapi.responses import JSONResponse

from app.core.clients import client_manager
from app.core.config import get_settings
from app.schemas.classroom import (
    DocumentsUploaded, VideoUploaded, BlogsUploaded, WorkAssigned,
    AddBlog, AssignWork
)
from app.services.auth import verify_token
from app.services.rag_processing import upload_file_to_blob, validate_file as validate_pdf_file
from app.services.document_queue import document_queue

router = APIRouter()
settings = get_settings()
logger = logging.getLogger(__name__)

async def _verify_admin_or_owner(classroom_id: int, user_id: str) -> bool:
    supabase = client_manager.get_supabase_client()
    try:
        owner_res = await asyncio.to_thread(
            supabase.table("classrooms").select("owner_id").eq("id", classroom_id).single().execute
        )
        if owner_res.data and owner_res.data.get('owner_id') == user_id:
            return True

        admin_res = await asyncio.to_thread(
            supabase.table("admins_of_classrooms").select("id").eq("classroom_id", classroom_id).eq("profile_id", user_id).execute
        )
        if admin_res.data:
            return True
    except Exception as e:
        logger.error(f"Error verifying admin or owner for classroom {classroom_id}: {e}")
    return False

@router.post("/classroom/{classroom_id}/document", status_code=status.HTTP_202_ACCEPTED)
async def add_document_to_classroom(
    classroom_id: int,
    token: dict = Depends(verify_token),
    file: UploadFile = File(...),
    is_class_context: bool = Form(...),
    unit_no: Optional[int] = Form(None),
    origin_blog: Optional[str] = Form(None),
    origin_work: Optional[str] = Form(None)
):
    user_id = token["sub"]
    if not await _verify_admin_or_owner(classroom_id, user_id):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Only admins or the owner can add documents.")

    doc_id = str(uuid.uuid4())
    logger.info(f"Received document upload for doc '{doc_id}' (filename: {file.filename}).")

    data = await file.read()
    validate_pdf_file(file, data)

    cleaned_origin_blog = None if origin_blog in [None, "", "string"] else origin_blog
    cleaned_origin_work = None if origin_work in [None, "", "string"] else origin_work

    try:
        document_url = await upload_file_to_blob(data, settings.AZURE_DOCS_CONTAINER_NAME, f"{doc_id}_{file.filename}")

        initial_doc_record = {
            'document_id': doc_id, 'uploaded_by': user_id, 'document_name': file.filename,
            'document_url': document_url, 'classroom_id': classroom_id, 'unit_no': unit_no,
            'origin_blog': cleaned_origin_blog, 'origin_work': cleaned_origin_work,
            'is_class_context': is_class_context, 'status': 'processing'
        }

        supabase = client_manager.get_supabase_client()
        insert_response = await asyncio.to_thread(
            supabase.table('documents_uploaded').insert(initial_doc_record).execute
        )
        if not insert_response.data:
            raise HTTPException(status_code=500, detail="Failed to create initial document record.")

        if is_class_context:
            task_data = {
                "doc_id": doc_id, "user_id": user_id, "classroom_id": classroom_id,
                "unit_no": unit_no, "file_data": data, "filename": file.filename
            }
            await document_queue.add_to_queue(task_data)

        return JSONResponse(
            status_code=status.HTTP_202_ACCEPTED,
            content={
                "message": "Document accepted and is now being processed. This may take a few minutes.",
                "document_id": doc_id, "status": "processing"
            }
        )
    except Exception as e:
        logger.critical(f"Critical error during initial document handling for classroom {classroom_id}: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))


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

    cleaned_origin_blog = None if origin_blog in [None, "", "string"] else origin_blog
    cleaned_origin_work = None if origin_work in [None, "", "string"] else origin_work

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
            'origin_blog': cleaned_origin_blog,
            'origin_work': cleaned_origin_work
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