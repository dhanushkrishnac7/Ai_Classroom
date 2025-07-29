
from pydantic import BaseModel, Field
from typing import Optional, List

class OwnedClassroom(BaseModel):
    id: int = Field(..., alias="id")
    classname: str = Field(..., alias="classname")
    role: str = Field(..., alias="role")

    class Config:
        populate_by_name = True

class EnrolledClassroom(BaseModel):
    classroom_id: int = Field(..., alias="classroomId")
    classroom_name: str = Field(..., alias="classroomName")
    owner_id: str = Field(..., alias="ownerId")
    owner_name: str = Field(..., alias="ownerName")
    role: str = Field(..., alias="role")

    class Config:
        populate_by_name = True

class DashboardResponse(BaseModel):
    message: str = Field(..., alias="message")
    user_name: str = Field(..., alias="userName")
    full_name: str = Field(..., alias="fullName")
    email: Optional[str] = Field(None, alias="email")
    owned_classrooms: List[OwnedClassroom] = Field(default_factory=list, alias="ownedClassrooms")
    enrolled_as_admins: List[EnrolledClassroom] = Field(default_factory=list, alias="enrolledAsAdmins")
    enrolled_as_students: List[EnrolledClassroom] = Field(default_factory=list, alias="enrolledAsStudents")

    class Config:
        populate_by_name = True

class UserProfile(BaseModel):
    user_name: str = Field(..., alias="userName")
    full_name: str = Field(..., alias="fullName")
    age: int = Field(..., alias="age")
    phone: str = Field(..., alias="phone")

    class Config:
        populate_by_name = True