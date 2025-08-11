from pydantic import BaseModel, Field
from typing import Optional, List, Any

class DocumentsUploaded(BaseModel):
    document_id: str = Field(..., alias="documentId")
    document_name: str = Field(..., alias="documentName")
    document_url: str = Field(..., alias="documentUrl")
    uploaded_at: Any = Field(..., alias="uploadedAt")
    uploaded_by: str = Field(..., alias="uploadedBy")
    classroom_id: int = Field(..., alias="classroomId")
    status: str = Field("processing", alias="status")  # New status field
    unit_no: Optional[int] = Field(None, alias="unitNo")
    is_class_context: bool = Field(False, alias="isClassContext")
    origin_blog: Optional[str] = Field(None, alias="originBlog")
    origin_work: Optional[str] = Field(None, alias="originWork")
    total_chunks_in_doc: Optional[int] = None
    
    class Config:
        populate_by_name = True
        from_attributes = True

class VideoUploaded(BaseModel):
    video_id: str = Field(..., alias="videoId")
    video_name: str = Field(..., alias="videoName")
    video_url: str = Field(..., alias="videoUrl")
    uploaded_at: Any = Field(..., alias="uploadedAt")
    uploaded_by: str = Field(..., alias="uploadedBy")
    classroom_id: int = Field(..., alias="classroomId")
    unit_no: Optional[int] = Field(None, alias="unitNo")
    
    class Config:
        populate_by_name = True
        from_attributes = True

class BlogsUploaded(BaseModel):
    id: str
    title: str
    context: str
    documents_uploaded: List[DocumentsUploaded] = Field(default_factory=list)
    videos_uploaded: List[VideoUploaded] = Field(default_factory=list)
    uploaded_at: Any
    uploaded_by: str
    classroom_id: int
    unit_no: Optional[int] = None
    class Config: 
        from_attributes = True

class WorkAssigned(BaseModel):
    work_id: str
    work_title: str
    work_description: str
    documents_uploaded: List[DocumentsUploaded] = Field(default_factory=list)
    videos_uploaded: List[VideoUploaded] = Field(default_factory=list)
    due_date: Any
    assigned_by: str
    classroom_id: int
    unit_no: Optional[int] = None
    class Config: 
        from_attributes = True

class ClassDetails(BaseModel):
    id: int
    classname: str
    role: str
    owner: str
    admins: List[str]
    students: List[str]
    documents_uploaded: List[DocumentsUploaded] = Field(default_factory=list)
    videos_uploaded: List[VideoUploaded] = Field(default_factory=list)
    blogs_uploaded: List[BlogsUploaded] = Field(default_factory=list)
    works_assigned: List[WorkAssigned] = Field(default_factory=list)
    class Config: 
        from_attributes = True

class AddBlog(BaseModel):
    title: str
    context: str
    unit_no: Optional[int] = None

class AssignWork(BaseModel):
    work_title: str
    work_description: str
    due_date: str
    unit_no: Optional[int] = None
