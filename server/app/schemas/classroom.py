from pydantic import BaseModel, Field
from typing import Optional, List

class ClassDetails(BaseModel):
    id: int
    classname: str = Field(..., description="Name of the Class")
    role: str = Field(..., description="Role of the user in the class")
    owner: str = Field(..., description="owner of the class")
    admins: List[str] = Field(..., description="Admins of the class")
    students: List[str] = Field(..., description="Students of the class")
    documents_uploaded: List[str] = Field(..., alias="documentsUploaded", description="documents that are being uploaded in the class")
    videos_uploaded: List[str] = Field(..., alias="videosUploaded",description="videos that are being uploaded in the class")
    blogs: List[str] = Field(..., description="Blogs that are being uploaded in the class")
    works_assigned: List[str] = Field(..., alias="worksAssigned", description="works that are being assigned in the class")