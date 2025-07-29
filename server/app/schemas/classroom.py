from pydantic import BaseModel, Field
from typing import Optional, List

class DocumentsUploaded(BaseModel):
    document_id: str = Field(..., alias="documentId")
    document_name: str = Field(..., alias="documentName")
    document_url: str = Field(..., alias="documentUrl")
    uploaded_at: str = Field(..., alias="uploadedAt")
    uploaded_by: str = Field(..., alias="uploadedBy")
    classroom_id: int = Field(..., alias="classroomId")
    unit_no: int = Field(..., alias="unitNo")
    is_class_context: bool = Field(..., alias="isClassContext")
    origin_blog: Optional[str] = Field(default=None, alias="originBlog")
    origin_work: Optional[str] = Field(default=None, alias="originWork")

    class Config:
        populate_by_name = True

class VideoUploaded(BaseModel):
    video_id: str = Field(..., alias="videoId")
    video_name: str = Field(..., alias="videoName")
    video_url: str = Field(..., alias="videoUrl")
    uploaded_at: str = Field(..., alias="uploadedAt")
    uploaded_by: str = Field(..., alias="uploadedBy")
    classroom_id: int = Field(..., alias="classroomId")
    unit_no: int = Field(..., alias="unitNo")
    is_class_context: bool = Field(..., alias="isClassContext")
    origin_blog: Optional[str] = Field(default=None, alias="originBlog")
    origin_work: Optional[str] = Field(default=None, alias="originWork")

    class Config:
        populate_by_name = True

class BlogsUploaded(BaseModel):
    id: str = Field(..., alias="id")
    title: str = Field(..., alias="title")
    content: str = Field(..., alias="content")
    documents_uploaded: List[DocumentsUploaded] = Field(default_factory=list, alias="documentsUploaded")
    videos_uploaded: List[VideoUploaded] = Field(default_factory=list, alias="videosUploaded")
    uploaded_at: str = Field(..., alias="uploadedAt")
    uploaded_by: str = Field(..., alias="uploadedBy")
    classroom_id: int = Field(..., alias="classroomId")
    unit_no: int = Field(..., alias="unitNo")

    class Config:
        populate_by_name = True

class WorkAssigned(BaseModel):
    work_id: str = Field(..., alias="workId")
    work_title: str = Field(..., alias="workTitle")
    work_description: str = Field(..., alias="workDescription")
    documents_uploaded: List[DocumentsUploaded] = Field(default_factory=list, alias="documentsUploaded")
    videos_uploaded: List[VideoUploaded] = Field(default_factory=list, alias="videosUploaded")
    due_date: str = Field(..., alias="dueDate")
    assigned_by: str = Field(..., alias="assignedBy")
    classroom_id: int = Field(..., alias="classroomId")
    unit_no: int = Field(..., alias="unitNo")

    class Config:
        populate_by_name = True

class ClassDetails(BaseModel):
    id: int = Field(..., alias="id")
    classname: str = Field(..., alias="classname")
    role: str = Field(..., alias="role")
    owner: str = Field(..., alias="owner")
    admins: List[str] = Field(..., alias="admins")
    students: List[str] = Field(..., alias="students")
    documents_uploaded: List[DocumentsUploaded] = Field(default_factory=list, alias="documentsUploaded")
    videos_uploaded: List[VideoUploaded] = Field(default_factory=list, alias="videosUploaded")
    blogs_uploaded: List[BlogsUploaded] = Field(default_factory=list, alias="blogsUploaded")
    works_assigned: List[WorkAssigned] = Field(default_factory=list, alias="worksAssigned")

    class Config:
        populate_by_name = True