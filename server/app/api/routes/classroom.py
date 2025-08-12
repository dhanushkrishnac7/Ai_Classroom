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

@router.post("/classroom/{classroom_id}/document", status_code=status.HTTP_202_ACCEPTED)
async def add_document_to_classroom(
    classroom_id: int,
    token: dict = Depends(verify_token),
    file: UploadFile = File(...),
    is_class_context: bool = Form(...),
    origin_blog: Optional[str] = Form(None),
    origin_work: Optional[str] = Form(None)
):
    """
    Adds a document to a classroom.

    - If `is_class_context` is `True`, the document undergoes background processing
      (text extraction, chunking, embedding).
    - If `is_class_context` is `False`, the document is simply stored and its
      metadata is saved with a 'completed' status.
    """
    user_id = token["sub"]
    if not await _verify_admin_or_owner(classroom_id, user_id):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Only admins or the owner can add documents.")

    doc_id = str(uuid.uuid4())
    logger.info(f"Received document upload for doc '{doc_id}' (filename: {file.filename}).")

    data = await file.read()
    validate_pdf_file(file, data)

    cleaned_origin_blog = None if origin_blog in [None, "", "string"] else origin_blog
    cleaned_origin_work = None if origin_work in [None, "", "string"] else origin_work

    if is_class_context:
        try:
            document_url = await upload_file_to_blob(data, settings.AZURE_DOCS_CONTAINER_NAME, f"{doc_id}_{file.filename}")

            initial_doc_record = {
                'document_id': doc_id, 'uploaded_by': user_id, 'document_name': file.filename,
                'document_url': document_url, 'classroom_id': classroom_id,
                'origin_blog': cleaned_origin_blog, 'origin_work': cleaned_origin_work,
                'is_class_context': is_class_context, 'status': 'processing'
            }

            supabase = client_manager.get_supabase_client()
            insert_response = await asyncio.to_thread(
                supabase.table('documents_uploaded').insert(initial_doc_record).execute
            )
            if not insert_response.data:
                raise HTTPException(status_code=500, detail="Failed to create initial document record.")

            task_data = {
                "doc_id": doc_id, "user_id": user_id, "classroom_id": classroom_id,
                "file_data": data, "filename": file.filename
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
    else:  # is_class_context is False
        try:
            document_url = await upload_file_to_blob(data, settings.AZURE_DOCS_CONTAINER_NAME, f"{doc_id}_{file.filename}")

            doc_record = {
                'document_id': doc_id, 'uploaded_by': user_id, 'document_name': file.filename,
                'document_url': document_url, 'classroom_id': classroom_id,
                'origin_blog': cleaned_origin_blog, 'origin_work': cleaned_origin_work,
                'is_class_context': is_class_context, 'status': 'completed'
            }

            supabase = client_manager.get_supabase_client()
            insert_response = await asyncio.to_thread(
                supabase.table('documents_uploaded').insert(doc_record).execute
            )
            if not insert_response.data:
                raise HTTPException(status_code=500, detail="Failed to store document record.")

            return JSONResponse(
                status_code=status.HTTP_201_CREATED,
                content={
                    "message": "Document stored successfully.",
                    "document_id": doc_id,
                    "status": "completed"
                }
            )
        except Exception as e:
            logger.critical(f"Critical error during document storage for classroom {classroom_id}: {e}", exc_info=True)
            raise HTTPException(status_code=500, detail=str(e))


@router.post("/classroom/{classroom_id}/video", status_code=status.HTTP_201_CREATED, response_model=VideoUploaded)
async def add_video_to_classroom(
    classroom_id: int,
    token: dict = Depends(verify_token),
    file: UploadFile = File(...),
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
            'uploaded_by': user_id, 'classroom_id': classroom_id,
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
async def add_blog_to_classroom(
    classroom_id: int,
    token: dict = Depends(verify_token),
    title: str = Form(...),
    context: str = Form(...),
    files: List[UploadFile] = File(default=[])
):
    user_id = token["sub"]
    if not await _verify_admin_or_owner(classroom_id, user_id):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Only admins or the owner can add blogs.")

    if len(files) > 3:
        raise HTTPException(status_code=400, detail="You can upload a maximum of 3 documents.")

    supabase = client_manager.get_supabase_client()
    blog_id = str(uuid.uuid4())

    try:
        # 1. Insert the blog post to get a blog_id
        blog_record = {
            'id': blog_id,
            'title': title,
            'context': context,
            'classroom_id': classroom_id,
            'uploaded_by': user_id
        }
        blog_response = await asyncio.to_thread(
            supabase.table("blogs_uploaded").insert(blog_record).execute
        )
        if not blog_response.data:
            raise HTTPException(status_code=500, detail="Failed to create blog post.")

        new_blog = blog_response.data[0]
        uploaded_documents_data = []

        # 2. Process and store each uploaded document
        if files:
            for file in files:
                if file.filename:
                    doc_id = str(uuid.uuid4())
                    data = await file.read()
                    validate_pdf_file(file, data)

                    document_url = await upload_file_to_blob(data, settings.AZURE_DOCS_CONTAINER_NAME, f"{doc_id}_{file.filename}")

                    doc_record = {
                        'document_id': doc_id, 'uploaded_by': user_id, 'document_name': file.filename,
                        'document_url': document_url, 'classroom_id': classroom_id,
                        'origin_blog': blog_id, 'is_class_context': False, 'status': 'completed'
                    }
                    doc_response = await asyncio.to_thread(
                        supabase.table('documents_uploaded').insert(doc_record).execute
                    )
                    if not doc_response.data:
                        logger.error(f"Failed to store document record for blog {blog_id}")
                    else:
                        uploaded_documents_data.append(doc_response.data[0])

        new_blog['documents_uploaded'] = [DocumentsUploaded.model_validate(doc) for doc in uploaded_documents_data]
        new_blog.setdefault('videos_uploaded', [])

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
    files: List[UploadFile] = File(default=[])
):
    user_id = token["sub"]
    if not await _verify_admin_or_owner(classroom_id, user_id):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Only admins or the owner can assign work.")

    if len(files) > 3:
        raise HTTPException(status_code=400, detail="You can upload a maximum of 3 documents.")

    supabase = client_manager.get_supabase_client()
    work_id = str(uuid.uuid4())

    try:
        # Format the due_date to 'YYYY-MM-DD'
        formatted_due_date = datetime.strptime(due_date, '%d-%m-%Y').strftime('%Y-%m-%d')
        # 1. Insert the work assignment to get a work_id
        work_record = {
            'work_id': work_id,
            'work_title': work_title,
            'work_description': work_description,
            'due_date': formatted_due_date,
            'classroom_id': classroom_id,
            'assigned_by': user_id
        }
        work_response = await asyncio.to_thread(
            supabase.table("work_assigned").insert(work_record).execute
        )
        if not work_response.data:
            raise HTTPException(status_code=500, detail="Failed to assign work.")

        new_work = work_response.data[0]
        uploaded_documents_data = []

        # 2. Process and store each uploaded document
        if files:
            for file in files:
                if file.filename:
                    doc_id = str(uuid.uuid4())
                    data = await file.read()
                    validate_pdf_file(file, data)

                    document_url = await upload_file_to_blob(data, settings.AZURE_DOCS_CONTAINER_NAME, f"{doc_id}_{file.filename}")

                    doc_record = {
                        'document_id': doc_id, 'uploaded_by': user_id, 'document_name': file.filename,
                        'document_url': document_url, 'classroom_id': classroom_id,
                        'origin_work': work_id, 'is_class_context': False, 'status': 'completed'
                    }
                    doc_response = await asyncio.to_thread(
                        supabase.table('documents_uploaded').insert(doc_record).execute
                    )
                    if not doc_response.data:
                        logger.error(f"Failed to store document record for work {work_id}")
                    else:
                        uploaded_documents_data.append(doc_response.data[0])

        new_work['documents_uploaded'] = [DocumentsUploaded.model_validate(doc) for doc in uploaded_documents_data]
        new_work.setdefault('videos_uploaded', [])

        return WorkAssigned.model_validate(new_work)

    except Exception as e:
        logger.critical(f"Error assigning work to classroom {classroom_id}: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))