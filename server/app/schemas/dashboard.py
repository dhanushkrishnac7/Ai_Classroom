from pydantic import BaseModel, Field
from typing import Optional, List

class EnrolledClassroom(BaseModel):
    classroom_name: str = Field(..., alias="classroomName", description="Name of the enrolled classroom")
    owner_name: str = Field(..., alias="ownerName", description="Full name of the classroom owner")


class DashboardResponse(BaseModel):
    message: str = Field(..., description="Response message")
    owned_classrooms: Optional[List[str]] = Field(default_factory=list, alias="ownedClassrooms", description="Classrooms created by the user")
    enrolled_as_admins: Optional[List[EnrolledClassroom]] = Field(default_factory=list, alias="enrolledClassroomsAsAdmins", description="Classrooms the user is enrolled as admin")
    enrolled_as_students: Optional[List[EnrolledClassroom]] = Field(default_factory=list, alias="enrolledClassroomsAsStudents", description="Classrooms the user is enrolled as student")

class UserProfile(BaseModel):
    user_name: str = Field(..., alias="userName",description="Username of the user")
    full_name: str = Field(..., alias="fullName", description="Full name of the user")
    age: int = Field(..., description="Age of the user")
    phone:  str = Field(..., description="Phone number of the user")