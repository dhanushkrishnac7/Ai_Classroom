from pydantic import BaseModel, Field
from typing import Optional, List, Any

class DocumentsUploaded(BaseModel):
    document_id: str = Field(..., alias="documentId")
    document_name: str = Field(..., alias="documentName")
    document_url: str = Field(..., alias="documentUrl")
    uploaded_at: Any = Field(..., alias="uploadedAt")
    uploaded_by: str = Field(..., alias="uploadedBy")
    classroom_id: int = Field(..., alias="classroomId")
    status: str = Field("processing", alias="status")
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
    status: str = Field("processing", alias="status")

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
    class Config:
        from_attributes = True

class CreateClassroomRequest(BaseModel):
    classname: str = Field(..., min_length=1, max_length=100)

class ClassroomResponse(BaseModel):
    id: int
    classname: str
    owner_id: str = Field(..., alias="ownerId")
    created_at: Any = Field(..., alias="createdAt")
    
    class Config:
        populate_by_name = True
        from_attributes = True

class AddStudentRequest(BaseModel):
    email: str = Field(..., pattern=r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$')

class StudentAddedResponse(BaseModel):
    message: str
    student_id: str = Field(..., alias="studentId")
    student_name: str = Field(..., alias="studentName")
    student_email: str = Field(..., alias="studentEmail")
    classroom_id: int = Field(..., alias="classroomId")
    added_at: Any = Field(..., alias="addedAt")
    
    class Config:
        populate_by_name = True
        from_attributes = True

class AddAdminRequest(BaseModel):
    email: str = Field(..., pattern=r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$')

class AdminAddedResponse(BaseModel):
    message: str
    admin_id: str = Field(..., alias="adminId")
    admin_name: str = Field(..., alias="adminName")
    admin_email: str = Field(..., alias="adminEmail")
    classroom_id: int = Field(..., alias="classroomId")
    added_at: Any = Field(..., alias="addedAt")
    
    class Config:
        populate_by_name = True
        from_attributes = True

class DeleteResponse(BaseModel):
    message: str
    user_id: str = Field(..., alias="userId")
    user_name: str = Field(..., alias="userName")
    user_email: str = Field(..., alias="userEmail")
    classroom_id: int = Field(..., alias="classroomId")
    deleted_at: Any = Field(..., alias="deletedAt")
    
    class Config:
        populate_by_name = True
        from_attributes = True