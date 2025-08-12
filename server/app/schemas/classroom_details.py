from pydantic import BaseModel, Field
from typing import Optional, List, Any, Union

class DocumentDetail(BaseModel):
    document_id: str
    document_name: str
    document_url: str

class VideoDetail(BaseModel):
    video_id: str
    video_name: str
    video_url: str

class BlogContent(BaseModel):
    id: str
    title: str
    context: str
    uploaded_at: Any
    type: str = "blog"
    documents: List[DocumentDetail] = []
    videos: List[VideoDetail] = []

class WorkContent(BaseModel):
    work_id: str
    work_title: str
    work_description: str
    due_date: Any
    created_at: Any
    type: str = "work"
    documents: List[DocumentDetail] = []
    videos: List[VideoDetail] = []

class UpcomingWork(BaseModel):
    work_id: str
    work_title: str
    due_date: Any

class ClassroomMember(BaseModel):
    id: str
    user_name: str
    full_name: str
    avatar_url: Optional[str] = None

class ClassroomMembers(BaseModel):
    owner: ClassroomMember
    admins: List[ClassroomMember]
    students: List[ClassroomMember]

class ClassroomDetailsResponse(BaseModel):
    all_content: List[Union[BlogContent, WorkContent]]
    upcoming_deadlines: List[UpcomingWork]
    members: ClassroomMembers