from pydantic import BaseModel, Field
from typing import Optional, List

class OwnedClassroom(BaseModel):
    id: int
    classname: str

class EnrolledClassroom(BaseModel):
    classroomId: int
    classroomName: str
    ownerId: str
    ownerName: str


class DashboardResponse(BaseModel):
    message: str = Field(..., description="Response message")
    owned_classrooms: List[OwnedClassroom] = Field(default_factory=list, alias="ownedClassrooms", description="Classrooms created by the user")
    enrolled_as_admins: List[EnrolledClassroom] = Field(default_factory=list, alias="enrolledClassroomsAsAdmins", description="Classrooms the user is enrolled as admin")
    enrolled_as_students: List[EnrolledClassroom] = Field(default_factory=list, alias="enrolledClassroomsAsStudents", description="Classrooms the user is enrolled as student")

class UserProfile(BaseModel):
    user_name: str = Field(..., alias="userName",description="Username of the user")
    full_name: str = Field(..., alias="fullName", description="Full name of the user")
    age: int = Field(..., description="Age of the user")
    phone:  str = Field(..., description="Phone number of the user")