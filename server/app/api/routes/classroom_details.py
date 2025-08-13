from fastapi import APIRouter, Depends, HTTPException
from typing import List, Dict, Any
from datetime import datetime
import asyncio
from app.core.clients import client_manager
from app.services.auth import verify_token
from app.schemas.classroom_details import (
    ClassroomDetailsResponse,
    BlogContent,
    WorkContent,
    UpcomingWork,
    ClassroomMember,
    ClassroomMembers,
    DocumentDetail,
    VideoDetail
)

router = APIRouter()

@router.get("/classroom/{classroom_id}", response_model=ClassroomDetailsResponse)
async def get_classroom_details(classroom_id: int, token: dict = Depends(verify_token)):
    supabase = client_manager.get_supabase_client()
    user_id = token["sub"]

    # --- Fetch all data in parallel ---
    blogs_res, works_res, docs_res, videos_res, classroom_res, admins_res, students_res = await asyncio.gather(
        asyncio.to_thread(supabase.table("blogs_uploaded").select("id, title, context, uploaded_at").eq("classroom_id", classroom_id).execute),
        asyncio.to_thread(supabase.table("work_assigned").select("work_id, work_title, work_description, due_date, created_at").eq("classroom_id", classroom_id).execute),
        asyncio.to_thread(supabase.table("documents_uploaded").select("document_id, document_name, document_url, origin_blog, origin_work").eq("classroom_id", classroom_id).execute),
        asyncio.to_thread(supabase.table("videos_uploaded").select("video_id, video_name, video_url, origin_blog, origin_work").eq("classroom_id", classroom_id).execute),
        asyncio.to_thread(supabase.table("classrooms").select("owner_id").eq("id", classroom_id).single().execute),
        asyncio.to_thread(supabase.table("admins_of_classrooms").select("profiles(id, user_name, full_name, avatar_url)").eq("classroom_id", classroom_id).execute),
        asyncio.to_thread(supabase.table("students_of_classrooms").select("profiles(id, user_name, full_name, avatar_url)").eq("classroom_id", classroom_id).execute)
    )

    # --- Process content (blogs and works) ---
    docs_by_blog = {}
    docs_by_work = {}
    videos_by_blog = {}
    videos_by_work = {}

    for doc in docs_res.data:
        if doc.get('origin_blog'):
            docs_by_blog.setdefault(doc['origin_blog'], []).append(DocumentDetail(**doc))
        if doc.get('origin_work'):
            docs_by_work.setdefault(doc['origin_work'], []).append(DocumentDetail(**doc))

    for vid in videos_res.data:
        if vid.get('origin_blog'):
            videos_by_blog.setdefault(vid['origin_blog'], []).append(VideoDetail(**vid))
        if vid.get('origin_work'):
            videos_by_work.setdefault(vid['origin_work'], []).append(VideoDetail(**vid))
    
    all_content = []
    if blogs_res.data:
        for blog in blogs_res.data:
            blog_id = blog['id']
            blog_content = BlogContent(**blog)
            blog_content.documents = docs_by_blog.get(blog_id, [])
            blog_content.videos = videos_by_blog.get(blog_id, [])
            all_content.append(blog_content)
            
    if works_res.data:
        for work in works_res.data:
            work_id = work['work_id']
            work_content = WorkContent(**work)
            work_content.documents = docs_by_work.get(work_id, [])
            work_content.videos = videos_by_work.get(work_id, [])
            all_content.append(work_content)

    all_content.sort(key=lambda x: getattr(x, 'uploaded_at', getattr(x, 'created_at', None)), reverse=True)

    # --- Process upcoming deadlines ---
    upcoming_deadlines = []
    if works_res.data:
        today = datetime.now().date()
        for work in works_res.data:
            due_date_str = work.get('due_date')
            if due_date_str:
                due_date = datetime.strptime(due_date_str, '%Y-%m-%d').date()
                if due_date >= today:
                    work_id = work['work_id']
                    upcoming_work = UpcomingWork(**work)
                    upcoming_work.documents = docs_by_work.get(work_id, [])
                    upcoming_work.videos = videos_by_work.get(work_id, [])
                    upcoming_deadlines.append(upcoming_work)
        upcoming_deadlines.sort(key=lambda x: x.due_date)

    # --- Process members ---
    if not classroom_res.data:
        raise HTTPException(status_code=404, detail="Classroom not found")
    owner_id = classroom_res.data['owner_id']

    owner_res = await asyncio.to_thread(supabase.table("profiles").select("id, user_name, full_name, avatar_url").eq("id", owner_id).single().execute)
    
    owner = ClassroomMember(**owner_res.data) if owner_res.data else None
    admins = [ClassroomMember(**admin['profiles']) for admin in admins_res.data] if admins_res.data else []
    students = [ClassroomMember(**student['profiles']) for student in students_res.data] if students_res.data else []
    
    if not owner:
        raise HTTPException(status_code=404, detail="Classroom owner not found")

    members = ClassroomMembers(owner=owner, admins=admins, students=students)

    return ClassroomDetailsResponse(
        all_content=all_content,
        upcoming_deadlines=upcoming_deadlines,
        members=members
    )