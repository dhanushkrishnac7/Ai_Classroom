import uuid
import logging
import asyncio
from typing import Optional, List, Union
from datetime import datetime
import yt_dlp

from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form, status
from fastapi.responses import JSONResponse

from app.core.clients import client_manager
from app.core.config import get_settings
from app.schemas.classroom import (
    DocumentsUploaded, VideoUploaded, BlogsUploaded, WorkAssigned, 
    CreateClassroomRequest, ClassroomResponse, AddStudentRequest, StudentAddedResponse,
    AddAdminRequest, AdminAddedResponse, DeleteResponse
)
from app.services.auth import verify_token
from app.services.rag_processing import upload_file_to_blob, validate_file
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

async def _verify_owner_only(classroom_id: int, user_id: str) -> bool:
    supabase = client_manager.get_supabase_client()
    try:
        owner_res = await asyncio.to_thread(
            supabase.table("classrooms").select("owner_id").eq("id", classroom_id).single().execute
        )
        if owner_res.data and owner_res.data.get('owner_id') == user_id:
            return True
    except Exception as e:
        logger.error(f"Error verifying owner for classroom {classroom_id}: {e}")
    return False

@router.post("/addclass", status_code=status.HTTP_201_CREATED, response_model=ClassroomResponse)
async def create_classroom(
    classroom_request: CreateClassroomRequest,
    token: dict = Depends(verify_token)
):
    """
    Create a new classroom with the authenticated user as the owner.
    """
    user_id = token["sub"]
    supabase = client_manager.get_supabase_client()
    
    try:
        # Create the classroom record
        classroom_data = {
            "classname": classroom_request.classname,
            "owner_id": user_id
        }
        
        response = await asyncio.to_thread(
            supabase.table("classrooms").insert(classroom_data).execute
        )
        
        if not response.data:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to create classroom: No data returned"
            )
        
        created_classroom = response.data[0]
        return ClassroomResponse.model_validate(created_classroom)
        
    except Exception as e:
        logger.error(f"Error creating classroom for user {user_id}: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to create classroom: {str(e)}"
        )

@router.post("/classroom/{classroom_id}/add-student", status_code=status.HTTP_201_CREATED, response_model=StudentAddedResponse)
async def add_student_to_classroom(
    classroom_id: int,
    student_request: AddStudentRequest,
    token: dict = Depends(verify_token)
):
    """
    Add a student to the classroom by email. Only classroom owners and admins can add students.
    """
    user_id = token["sub"]
    supabase = client_manager.get_supabase_client()
    
    # Verify that the user is admin or owner of the classroom
    if not await _verify_admin_or_owner(classroom_id, user_id):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN, 
            detail="Only admins or the owner can add students to the classroom."
        )
    
    try:
        # Check if the email is registered in the platform
        user_query = await asyncio.to_thread(
            supabase.table("profiles").select("id, user_name, full_name, email").eq("email", student_request.email).execute
        )
        
        if not user_query.data:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Student is not registered on the platform"
            )
        
        student_profile = user_query.data[0]
        student_id = student_profile["id"]
        
        # Check if student is already enrolled in this classroom
        existing_enrollment = await asyncio.to_thread(
            supabase.table("students_of_classrooms").select("id").eq("classroom_id", classroom_id).eq("profile_id", student_id).execute
        )
        
        if existing_enrollment.data:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="Student is already enrolled in this classroom"
            )
        
        # Check if student is the owner of the classroom
        if student_id == user_id:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Cannot add yourself as a student to your own classroom"
            )
        
        # Check if student is an admin of the classroom
        admin_check = await asyncio.to_thread(
            supabase.table("admins_of_classrooms").select("id").eq("classroom_id", classroom_id).eq("profile_id", student_id).execute
        )
        
        if admin_check.data:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Cannot add an admin as a student to the classroom"
            )
        
        # Add student to the classroom
        student_enrollment_data = {
            "classroom_id": classroom_id,
            "profile_id": student_id
        }
        
        enrollment_response = await asyncio.to_thread(
            supabase.table("students_of_classrooms").insert(student_enrollment_data).execute
        )
        
        if not enrollment_response.data:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to add student to classroom: No data returned"
            )
        
        # Prepare response data
        enrollment_record = enrollment_response.data[0]
        response_data = {
            "message": "Student added to classroom successfully",
            "studentId": student_id,
            "studentName": student_profile.get("full_name", student_profile.get("user_name", "")),
            "studentEmail": student_profile["email"],
            "classroomId": classroom_id,
            "addedAt": enrollment_record["created_at"]
        }
        
        return StudentAddedResponse.model_validate(response_data)
        
    except HTTPException:
        # Re-raise HTTP exceptions as they are
        raise
    except Exception as e:
        logger.error(f"Error adding student to classroom {classroom_id}: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to add student to classroom: {str(e)}"
        )

@router.post("/classroom/{classroom_id}/add-admin", status_code=status.HTTP_201_CREATED, response_model=AdminAddedResponse)
async def add_admin_to_classroom(
    classroom_id: int,
    admin_request: AddAdminRequest,
    token: dict = Depends(verify_token)
):
    """
    Add an admin to the classroom by email. Only classroom owners can add admins.
    """
    user_id = token["sub"]
    supabase = client_manager.get_supabase_client()
    
    # Verify that the user is the owner of the classroom (only owners can add admins)
    if not await _verify_owner_only(classroom_id, user_id):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN, 
            detail="Only the classroom owner can add admins to the classroom."
        )
    
    try:
        # Check if the email is registered in the platform
        user_query = await asyncio.to_thread(
            supabase.table("profiles").select("id, user_name, full_name, email").eq("email", admin_request.email).execute
        )
        
        if not user_query.data:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User is not registered on the platform"
            )
        
        admin_profile = user_query.data[0]
        admin_id = admin_profile["id"]
        
        # Check if user is already an admin in this classroom
        existing_admin = await asyncio.to_thread(
            supabase.table("admins_of_classrooms").select("id").eq("classroom_id", classroom_id).eq("profile_id", admin_id).execute
        )
        
        if existing_admin.data:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="User is already an admin in this classroom"
            )
        
        # Check if user is the owner of the classroom
        if admin_id == user_id:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Cannot add yourself as an admin to your own classroom"
            )
        
        # Check if user is a student of the classroom
        student_check = await asyncio.to_thread(
            supabase.table("students_of_classrooms").select("id").eq("classroom_id", classroom_id).eq("profile_id", admin_id).execute
        )
        
        if student_check.data:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Cannot add a student as an admin to the classroom"
            )
        
        # Add admin to the classroom
        admin_data = {
            "classroom_id": classroom_id,
            "profile_id": admin_id
        }
        
        admin_response = await asyncio.to_thread(
            supabase.table("admins_of_classrooms").insert(admin_data).execute
        )
        
        if not admin_response.data:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to add admin to classroom: No data returned"
            )
        
        # Prepare response data
        admin_record = admin_response.data[0]
        response_data = {
            "message": "Admin added to classroom successfully",
            "adminId": admin_id,
            "adminName": admin_profile.get("full_name", admin_profile.get("user_name", "")),
            "adminEmail": admin_profile["email"],
            "classroomId": classroom_id,
            "addedAt": admin_record["created_at"]
        }
        
        return AdminAddedResponse.model_validate(response_data)
        
    except HTTPException:
        # Re-raise HTTP exceptions as they are
        raise
    except Exception as e:
        logger.error(f"Error adding admin to classroom {classroom_id}: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to add admin to classroom: {str(e)}"
        )

@router.delete("/classroom/{classroom_id}/delete-admin/{admin_id}", status_code=status.HTTP_200_OK, response_model=DeleteResponse)
async def delete_admin_from_classroom(
    classroom_id: int,
    admin_id: str,
    token: dict = Depends(verify_token)
):
    """
    Remove an admin from the classroom. Only classroom owners can delete admins.
    """
    user_id = token["sub"]
    supabase = client_manager.get_supabase_client()
    
    # Verify that the user is the owner of the classroom (only owners can delete admins)
    if not await _verify_owner_only(classroom_id, user_id):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN, 
            detail="Only the classroom owner can remove admins from the classroom."
        )
    
    try:
        # Check if the admin exists in this classroom
        admin_query = await asyncio.to_thread(
            supabase.table("admins_of_classrooms").select("id, created_at").eq("classroom_id", classroom_id).eq("profile_id", admin_id).execute
        )
        
        if not admin_query.data:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Admin not found in this classroom"
            )
        
        # Get admin profile information
        admin_profile_query = await asyncio.to_thread(
            supabase.table("profiles").select("id, user_name, full_name, email").eq("id", admin_id).execute
        )
        
        if not admin_profile_query.data:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Admin profile not found"
            )
        
        admin_profile = admin_profile_query.data[0]
        
        # Delete the admin from the classroom
        delete_response = await asyncio.to_thread(
            supabase.table("admins_of_classrooms").delete().eq("classroom_id", classroom_id).eq("profile_id", admin_id).execute
        )
        
        if not delete_response.data:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to remove admin from classroom"
            )
        
        # Prepare response data
        response_data = {
            "message": "Admin removed from classroom successfully",
            "userId": admin_id,
            "userName": admin_profile.get("full_name", admin_profile.get("user_name", "")),
            "userEmail": admin_profile["email"],
            "classroomId": classroom_id,
            "deletedAt": delete_response.data[0]["created_at"]
        }
        
        return DeleteResponse.model_validate(response_data)
        
    except HTTPException:
        # Re-raise HTTP exceptions as they are
        raise
    except Exception as e:
        logger.error(f"Error removing admin from classroom {classroom_id}: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to remove admin from classroom: {str(e)}"
        )

@router.delete("/classroom/{classroom_id}/delete-student/{student_id}", status_code=status.HTTP_200_OK, response_model=DeleteResponse)
async def delete_student_from_classroom(
    classroom_id: int,
    student_id: str,
    token: dict = Depends(verify_token)
):
    """
    Remove a student from the classroom. Only classroom owners and admins can delete students.
    """
    user_id = token["sub"]
    supabase = client_manager.get_supabase_client()
    
    # Verify that the user is admin or owner of the classroom
    if not await _verify_admin_or_owner(classroom_id, user_id):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN, 
            detail="Only admins or the owner can remove students from the classroom."
        )
    
    try:
        # Check if the student exists in this classroom
        student_query = await asyncio.to_thread(
            supabase.table("students_of_classrooms").select("id, created_at").eq("classroom_id", classroom_id).eq("profile_id", student_id).execute
        )
        
        if not student_query.data:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Student not found in this classroom"
            )
        
        # Get student profile information
        student_profile_query = await asyncio.to_thread(
            supabase.table("profiles").select("id, user_name, full_name, email").eq("id", student_id).execute
        )
        
        if not student_profile_query.data:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Student profile not found"
            )
        
        student_profile = student_profile_query.data[0]
        
        # Delete the student from the classroom
        delete_response = await asyncio.to_thread(
            supabase.table("students_of_classrooms").delete().eq("classroom_id", classroom_id).eq("profile_id", student_id).execute
        )
        
        if not delete_response.data:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to remove student from classroom"
            )
        
        # Prepare response data
        response_data = {
            "message": "Student removed from classroom successfully",
            "userId": student_id,
            "userName": student_profile.get("full_name", student_profile.get("user_name", "")),
            "userEmail": student_profile["email"],
            "classroomId": classroom_id,
            "deletedAt": delete_response.data[0]["created_at"]
        }
        
        return DeleteResponse.model_validate(response_data)
        
    except HTTPException:
        # Re-raise HTTP exceptions as they are
        raise
    except Exception as e:
        logger.error(f"Error removing student from classroom {classroom_id}: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to remove student from classroom: {str(e)}"
        )

@router.post("/classroom/{classroom_id}/blog", status_code=status.HTTP_201_CREATED, response_model=BlogsUploaded)
async def add_blog_to_classroom(
    classroom_id: int,
    token: dict = Depends(verify_token),
    title: str = Form(...),
    context: str = Form(...),
    files: Optional[List[Union[UploadFile, str]]] = File(None),
    youtube_url: Optional[str] = Form(None)
):
    user_id = token["sub"]
    if not await _verify_admin_or_owner(classroom_id, user_id):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Only admins or the owner can add blogs.")
    
    actual_files = [f for f in files if isinstance(f, UploadFile)] if files else []
        
    if actual_files and len(actual_files) > 3:
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

        if actual_files:
            for file in actual_files:
                if file.filename:
                    file_id = str(uuid.uuid4())
                    data = await file.read()
                    content_type = file.content_type
                    
                    if content_type.startswith("video/"):
                        video_url = await upload_file_to_blob(data, settings.AZURE_VIDEOS_CONTAINER_NAME, f"{file_id}_{file.filename}")
                        video_record = {
                            'video_id': file_id, 'video_name': file.filename, 'video_url': video_url,
                            'uploaded_by': user_id, 'classroom_id': classroom_id, 'origin_blog': blog_id, 
                            'origin_work': None, 'status': 'processing'
                        }
                        video_insert_res = await asyncio.to_thread(supabase.table('videos_uploaded').insert(video_record).execute)
                        if video_insert_res.data:
                            uploaded_videos_data.append(video_insert_res.data[0])
                            task_data = {
                                "doc_id": file_id, "user_id": user_id, "classroom_id": classroom_id,
                                "file_data": data, "filename": file.filename, "content_type": content_type, "task_type": "video"
                            }
                            await document_queue.add_to_queue(task_data)
                    else:
                        validate_file(file, data)
                        doc_url = await upload_file_to_blob(data, settings.AZURE_DOCS_CONTAINER_NAME, f"{file_id}_{file.filename}")
                        doc_record = {
                            'document_id': file_id, 'uploaded_by': user_id, 'document_name': file.filename,
                            'document_url': doc_url, 'classroom_id': classroom_id, 'origin_blog': blog_id,
                            'is_class_context': True, 'status': 'processing'
                        }
                        doc_insert_res = await asyncio.to_thread(supabase.table('documents_uploaded').insert(doc_record).execute)
                        if doc_insert_res.data:
                            uploaded_documents_data.append(doc_insert_res.data[0])
                            task_data = {
                                "doc_id": file_id, "user_id": user_id, "classroom_id": classroom_id,
                                "file_data": data, "filename": file.filename, "content_type": content_type, "task_type": "document"
                            }
                            await document_queue.add_to_queue(task_data)

        if youtube_url:
            video_id = str(uuid.uuid4())
            with yt_dlp.YoutubeDL({'quiet': True, 'no_warnings': True}) as ydl:
                info = ydl.extract_info(youtube_url, download=False)
                video_title = info.get('title', 'YouTube Video')

            video_record = {
                'video_id': video_id, 'video_name': video_title, 'video_url': youtube_url,
                'uploaded_by': user_id, 'classroom_id': classroom_id, 'origin_blog': blog_id, 
                'origin_work': None, 'status': 'processing'
            }
            video_insert_res = await asyncio.to_thread(supabase.table('videos_uploaded').insert(video_record).execute)
            if video_insert_res.data:
                uploaded_videos_data.append(video_insert_res.data[0])
                task_data = {
                    "doc_id": video_id, "user_id": user_id, "classroom_id": classroom_id,
                    "youtube_url": youtube_url, "task_type": "youtube"
                }
                await document_queue.add_to_queue(task_data)

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
    files: Optional[List[Union[UploadFile, str]]] = File(None),
    youtube_url: Optional[str] = Form(None)
):
    user_id = token["sub"]
    if not await _verify_admin_or_owner(classroom_id, user_id):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Only admins or the owner can assign work.")

    actual_files = [f for f in files if isinstance(f, UploadFile)] if files else []

    if actual_files and len(actual_files) > 3:
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

        if actual_files:
            for file in actual_files:
                if file.filename:
                    file_id = str(uuid.uuid4())
                    data = await file.read()
                    content_type = file.content_type

                    if content_type.startswith("video/"):
                        video_url = await upload_file_to_blob(data, settings.AZURE_VIDEOS_CONTAINER_NAME, f"{file_id}_{file.filename}")
                        video_record = {
                            'video_id': file_id, 'video_name': file.filename, 'video_url': video_url,
                            'uploaded_by': user_id, 'classroom_id': classroom_id, 'origin_work': work_id, 
                            'origin_blog': None, 'status': 'processing'
                        }
                        video_insert_res = await asyncio.to_thread(supabase.table('videos_uploaded').insert(video_record).execute)
                        if video_insert_res.data:
                            uploaded_videos_data.append(video_insert_res.data[0])
                            task_data = {
                                "doc_id": file_id, "user_id": user_id, "classroom_id": classroom_id,
                                "file_data": data, "filename": file.filename, "content_type": content_type, "task_type": "video"
                            }
                            await document_queue.add_to_queue(task_data)
                    else:
                        validate_file(file, data)
                        doc_url = await upload_file_to_blob(data, settings.AZURE_DOCS_CONTAINER_NAME, f"{file_id}_{file.filename}")
                        doc_record = {
                            'document_id': file_id, 'uploaded_by': user_id, 'document_name': file.filename,
                            'document_url': doc_url, 'classroom_id': classroom_id, 'origin_work': work_id,
                            'is_class_context': True, 'status': 'processing'
                        }
                        doc_insert_res = await asyncio.to_thread(supabase.table('documents_uploaded').insert(doc_record).execute)
                        if doc_insert_res.data:
                            uploaded_documents_data.append(doc_insert_res.data[0])
                            task_data = {
                                "doc_id": file_id, "user_id": user_id, "classroom_id": classroom_id,
                                "file_data": data, "filename": file.filename, "content_type": content_type, "task_type": "document"
                            }
                            await document_queue.add_to_queue(task_data)

        if youtube_url:
            video_id = str(uuid.uuid4())
            with yt_dlp.YoutubeDL({'quiet': True, 'no_warnings': True}) as ydl:
                info = ydl.extract_info(youtube_url, download=False)
                video_title = info.get('title', 'YouTube Video')

            video_record = {
                'video_id': video_id, 'video_name': video_title, 'video_url': youtube_url,
                'uploaded_by': user_id, 'classroom_id': classroom_id, 'origin_work': work_id, 
                'origin_blog': None, 'status': 'processing'
            }
            video_insert_res = await asyncio.to_thread(supabase.table('videos_uploaded').insert(video_record).execute)
            if video_insert_res.data:
                uploaded_videos_data.append(video_insert_res.data[0])
                task_data = {
                    "doc_id": video_id, "user_id": user_id, "classroom_id": classroom_id,
                    "youtube_url": youtube_url, "task_type": "youtube"
                }
                await document_queue.add_to_queue(task_data)

        new_work['documents_uploaded'] = [DocumentsUploaded.model_validate(doc) for doc in uploaded_documents_data]
        new_work['videos_uploaded'] = [VideoUploaded.model_validate(vid) for vid in uploaded_videos_data]

        return WorkAssigned.model_validate(new_work)

    except Exception as e:
        logger.critical(f"Error assigning work to classroom {classroom_id}: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))