import uuid
import logging
import asyncio
from typing import Optional, List
from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form, status
from fastapi.responses import JSONResponse

from app.core.clients import client_manager
from app.core.config import get_settings
from app.schemas.classroom import (
    DocumentsUploaded, VideoUploaded, BlogsUploaded, WorkAssigned
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

@router.post("/classroom/{classroom_id}/blog", status_code=status.HTTP_201_CREATED, response_model=BlogsUploaded)
async def add_blog_to_classroom(
    classroom_id: int,
    token: dict = Depends(verify_token),
    title: str = Form(...),
    context: str = Form(...),
    files: Optional[List[UploadFile]] = File(None)
):
    user_id = token["sub"]
    if not await _verify_admin_or_owner(classroom_id, user_id):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Only admins or the owner can add blogs.")

    if files and len(files) > 3:
        raise HTTPException(status_code=400, detail="You can upload a maximum of 3 files.")

    supabase = client_manager.get_supabase_client()
    blog_id = str(uuid.uuid4())

    try:
        blog_record = {
            'id': blog_id, 'title': title, 'context': context,
            'classroom_id': classroom_id, 'uploaded_by': user_id
        }
        blog_response = await asyncio.to_thread(
            supabase.table("blogs_uploaded").insert(blog_record).execute
        )
        if not blog_response.data:
            raise HTTPException(status_code=500, detail="Failed to create blog post.")

        new_blog = blog_response.data[0]
        uploaded_documents_data = []
        uploaded_videos_data = []

        if files:
            for file in files:
                if file.filename:
                    file_id = str(uuid.uuid4())
                    data = await file.read()
                    
                    if file.content_type == "application/pdf":
                        validate_pdf_file(file, data)
                        doc_url = await upload_file_to_blob(data, settings.AZURE_DOCS_CONTAINER_NAME, f"{file_id}_{file.filename}")
                        doc_record = {
                            'document_id': file_id, 'uploaded_by': user_id, 'document_name': file.filename,
                            'document_url': doc_url, 'classroom_id': classroom_id, 'origin_blog': blog_id,
                            'is_class_context': True, 'status': 'processing'
                        }
                        doc_insert_res = await asyncio.to_thread(supabase.table('documents_uploaded').insert(doc_record).execute)
                        if doc_insert_res.data:
                            uploaded_documents_data.append(doc_insert_res.data[0])
                            task_data = {"doc_id": file_id, "user_id": user_id, "classroom_id": classroom_id, "file_data": data, "filename": file.filename}
                            await document_queue.add_to_queue(task_data)
                    
                    elif file.content_type and file.content_type.startswith("video/"):
                        video_url = await upload_file_to_blob(data, settings.AZURE_VIDEOS_CONTAINER_NAME, f"{file_id}_{file.filename}")
                        video_record = {
                            'video_id': file_id, 'video_name': file.filename, 'video_url': video_url,
                            'uploaded_by': user_id, 'classroom_id': classroom_id, 'origin_blog': blog_id
                        }
                        video_insert_res = await asyncio.to_thread(supabase.table('videos_uploaded').insert(video_record).execute)
                        if video_insert_res.data:
                            uploaded_videos_data.append(video_insert_res.data[0])

        new_blog['documents_uploaded'] = [DocumentsUploaded.model_validate(doc) for doc in uploaded_documents_data]
        new_blog['videos_uploaded'] = [VideoUploaded.model_validate(vid) for vid in uploaded_videos_data]

        return BlogsUploaded.model_validate(new_blog)

    except Exception as e:
        logger.critical(f"Error creating blog post in classroom {classroom_id}: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/classroom/{classroom_id}/work", status_code=status.HTTP_201_CREATED, response_model=WorkAssigned)
async def assign_work_to_classroom(
    classroom_id: int,
    token: dict = Depends(verify_token),
    work_title: str = Form(...),
    work_description: str = Form(...),
    due_date: str = Form(...),
    files: Optional[List[UploadFile]] = File(None)
):
    user_id = token["sub"]
    if not await _verify_admin_or_owner(classroom_id, user_id):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Only admins or the owner can assign work.")

    if files and len(files) > 3:
        raise HTTPException(status_code=400, detail="You can upload a maximum of 3 files.")

    supabase = client_manager.get_supabase_client()
    work_id = str(uuid.uuid4())

    try:
        formatted_due_date = datetime.strptime(due_date, '%d-%m-%Y').strftime('%Y-%m-%d')
        work_record = {
            'work_id': work_id, 'work_title': work_title, 'work_description': work_description,
            'due_date': formatted_due_date, 'classroom_id': classroom_id, 'assigned_by': user_id
        }
        work_response = await asyncio.to_thread(
            supabase.table("work_assigned").insert(work_record).execute
        )
        if not work_response.data:
            raise HTTPException(status_code=500, detail="Failed to assign work.")

        new_work = work_response.data[0]
        uploaded_documents_data = []
        uploaded_videos_data = []

        if files:
            for file in files:
                if file.filename:
                    file_id = str(uuid.uuid4())
                    data = await file.read()

                    if file.content_type == "application/pdf":
                        validate_pdf_file(file, data)
                        doc_url = await upload_file_to_blob(data, settings.AZURE_DOCS_CONTAINER_NAME, f"{file_id}_{file.filename}")
                        doc_record = {
                            'document_id': file_id, 'uploaded_by': user_id, 'document_name': file.filename,
                            'document_url': doc_url, 'classroom_id': classroom_id, 'origin_work': work_id,
                            'is_class_context': True, 'status': 'processing'
                        }
                        doc_insert_res = await asyncio.to_thread(supabase.table('documents_uploaded').insert(doc_record).execute)
                        if doc_insert_res.data:
                            uploaded_documents_data.append(doc_insert_res.data[0])
                            task_data = {"doc_id": file_id, "user_id": user_id, "classroom_id": classroom_id, "file_data": data, "filename": file.filename}
                            await document_queue.add_to_queue(task_data)

                    elif file.content_type and file.content_type.startswith("video/"):
                        video_url = await upload_file_to_blob(data, settings.AZURE_VIDEOS_CONTAINER_NAME, f"{file_id}_{file.filename}")
                        video_record = {
                            'video_id': file_id, 'video_name': file.filename, 'video_url': video_url,
                            'uploaded_by': user_id, 'classroom_id': classroom_id, 'origin_work': work_id
                        }
                        video_insert_res = await asyncio.to_thread(supabase.table('videos_uploaded').insert(video_record).execute)
                        if video_insert_res.data:
                            uploaded_videos_data.append(video_insert_res.data[0])

        new_work['documents_uploaded'] = [DocumentsUploaded.model_validate(doc) for doc in uploaded_documents_data]
        new_work['videos_uploaded'] = [VideoUploaded.model_validate(vid) for vid in uploaded_videos_data]

        return WorkAssigned.model_validate(new_work)

    except Exception as e:
        logger.critical(f"Error assigning work to classroom {classroom_id}: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))