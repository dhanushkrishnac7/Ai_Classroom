from fastapi import FastAPI, APIRouter, Depends, HTTPException, status
from app.services.auth_middle import verify_token
from app.core.supabase_client import supabase
from app.schemas.dashboard import DashboardResponse, EnrolledClassroom, OwnedClassroom
from app.schemas.dashboard import UserProfile

router = APIRouter()


@router.get("/dashboard",response_model=DashboardResponse)
async def get_dashboard(token=Depends(verify_token)):
    user_id = token["sub"]

    user_query = supabase.table("profiles").select("user_name, full_name, email").eq("id", user_id).limit(1).execute()
    if not user_query.data:
        raise HTTPException(status_code=440, detail="User_not_found")


    try:
        owned_classrooms_response = supabase.table("classrooms").select("id, classname").eq("owner_id", user_id).execute()

        owned_classrooms = [
            OwnedClassroom(id=cls["id"], classname=cls["classname"])
            for cls in owned_classrooms_response.data
        ]

        enrolled_as_admins_response = supabase.table("admins_of_classrooms").select(
            "classrooms(id, classname, owner_id, profiles!classes_owner_fkey(id, user_name))"
        ).eq("profile_id", user_id).execute()
        
        enrolled_as_admins = [ 
            EnrolledClassroom(
                classroomId=cls["classrooms"]["id"],
                classroomName=cls["classrooms"]["classname"],
                ownerId=cls["classrooms"]["profiles"]["id"],
                ownerName=cls["classrooms"]["profiles"]["user_name"]
            ) 
            for cls in enrolled_as_admins_response.data
        ]


        enrolled_as_students_response = supabase.table("students_of_classrooms").select(
            "classrooms(id, classname, owner_id, profiles!classes_owner_fkey(id, user_name))"
        ).eq("profile_id", user_id).execute()

        enrolled_as_students = [
            EnrolledClassroom(
                classroomId=cls["classrooms"]["id"],
                classroomName=cls["classrooms"]["classname"],
                ownerId=cls["classrooms"]["profiles"]["id"],
                ownerName=cls["classrooms"]["profiles"]["user_name"]
            ) 
            for cls in enrolled_as_students_response.data
        ]

        return DashboardResponse(
            message="success",
            userName = user_query.data[0]['user_name'],
            fullName = user_query.data[0]['full_name'],    
            email = user_query.data[0]['email'],
            ownedClassrooms=owned_classrooms,
            enrolledClassroomsAsAdmins=enrolled_as_admins,
            enrolledClassroomsAsStudents=enrolled_as_students
        )


    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching classrooms: {str(e)}")


    


@router.post("/dashboard")
async def create_user_profile(user_profile: UserProfile, token=Depends(verify_token)):
    user_id = token["sub"]

    user_query = supabase.table("profiles").select("user_name").eq("id", user_id).limit(1).execute()
    if user_query.data:
        raise HTTPException(status_code=440, detail="User_already_exists")
    
    profile_data = user_profile.dict(by_alias=False)
    profile_data["id"] = user_id
    profile_data["email"] = token["email"]
    
    try:
        response = supabase.table("profiles").insert(profile_data).execute()
        
        if not response.data:
            raise HTTPException(
                status_code=500,
                detail="Failed to create user profile: No data returned"
            )
            
        return {"message": "User profile created successfully", "status": "success"}
        
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to create user profile: {str(e)}"
        )
    

@router.get("/username/{user_name}")
async def is_username_valid(user_name : str):

    user_query = supabase.table("profiles").select("user_name").eq("user_name", user_name).limit(1).execute()
    
    if not user_query.data:
        return {"isValid": True, "message": "Username is available"}
    
    return {"isValid": False, "message": "Username already exists"}