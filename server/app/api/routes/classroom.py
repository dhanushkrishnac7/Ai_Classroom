from fastapi import APIRouter, Depends, HTTPException
from app.services.auth_middle import verify_token
from app.core.supabase_client import supabase
from app.schemas.classroom import ClassDetails, DocumentsUploaded, VideoUploaded, BlogsUploaded, WorkAssigned
from typing import Dict, List

router = APIRouter()

@router.get("/classroom/{classroom_id}", response_model=ClassDetails)
async def get_classroom_details(classroom_id: int, token: dict = Depends(verify_token)):
    """
    Retrieves comprehensive details for a specific classroom, including its members,
    content, and the role of the requesting user.
    """
    user_id = token["sub"]

    # 1. Fetch core classroom data and its owner
    classroom_response = supabase.table("classrooms").select(
        "id, classname, owner_id, owner:profiles!owner_id(user_name)"
    ).eq("id", classroom_id).single().execute()

    if not classroom_response.data:
        raise HTTPException(status_code=404, detail="Classroom not found")
    classroom_data = classroom_response.data

    # 2. Fetch all members (admins and students) of the classroom
    admins_response = supabase.table("admins_of_classrooms").select(
        "profile:profiles(id, user_name)"
    ).eq("classroom_id", classroom_id).execute()
    
    students_response = supabase.table("students_of_classrooms").select(
        "profile:profiles(id, user_name)"
    ).eq("classroom_id", classroom_id).execute()

    admins = admins_response.data or []
    students = students_response.data or []

    # 3. Determine the user's role and authorize access
    role = None
    if classroom_data["owner_id"] == user_id:
        role = "owner"
    elif any(admin['profile']['id'] == user_id for admin in admins):
        role = "admin"
    elif any(student['profile']['id'] == user_id for student in students):
        role = "student"

    if role is None:
        raise HTTPException(status_code=403, detail="User does not have access to this classroom")

    # 4. Fetch all content associated with the classroom
    docs_response = supabase.table("documents_uploaded").select("*").eq("classroom_id", classroom_id).execute()
    videos_response = supabase.table("videos_uploaded").select("*").eq("classroom_id", classroom_id).execute()
    blogs_response = supabase.table("blogs_uploaded").select("*").eq("classroom_id", classroom_id).execute()
    works_response = supabase.table("work_assigned").select("*").eq("classroom_id", classroom_id).execute()

    # 5. Process and organize the fetched content
    
    # Process blogs and works into dictionaries for efficient lookup
    blogs_map: Dict[str, BlogsUploaded] = {
        blog['id']: BlogsUploaded(**blog) for blog in (blogs_response.data or [])
    }
    works_map: Dict[str, WorkAssigned] = {
        work['work_id']: WorkAssigned(**work) for work in (works_response.data or [])
    }
    
    standalone_docs: List[DocumentsUploaded] = []
    standalone_videos: List[VideoUploaded] = []

    # Distribute documents into blogs, works, or standalone list
    for doc_data in (docs_response.data or []):
        doc = DocumentsUploaded(**doc_data)
        if doc.origin_blog and doc.origin_blog in blogs_map:
            blogs_map[doc.origin_blog].documents_uploaded.append(doc)
        elif doc.origin_work and doc.origin_work in works_map:
            works_map[doc.origin_work].documents_uploaded.append(doc)
        else:
            standalone_docs.append(doc)

    # Distribute videos into blogs, works, or standalone list
    for video_data in (videos_response.data or []):
        video = VideoUploaded(**video_data)
        if video.origin_blog and video.origin_blog in blogs_map:
            blogs_map[video.origin_blog].vidoes_uploaded.append(video)
        elif video.origin_work and video.origin_work in works_map:
            works_map[video.origin_work].vidoes_uploaded.append(video)
        else:
            standalone_videos.append(video)

    # 6. Assemble the final response model
    class_details = ClassDetails(
        id=classroom_data['id'],
        classname=classroom_data['classname'],
        role=role,
        owner=classroom_data['owner']['user_name'],
        admins=[admin['profile']['user_name'] for admin in admins],
        students=[student['profile']['user_name'] for student in students],
        documents_uploaded=standalone_docs,
        videos_uploaded=standalone_videos,
        blogs_uploaded=list(blogs_map.values()),
        works_assigned=list(works_map.values())
    )

    return class_details