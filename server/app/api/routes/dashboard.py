from fastapi import APIRouter, Depends, HTTPException
from app.services.auth import verify_token
from app.core.clients import client_manager
from app.schemas.dashboard import DashboardResponse, EnrolledClassroom, OwnedClassroom, UserProfile

router = APIRouter()

@router.get("/dashboard", response_model=DashboardResponse)
async def get_dashboard(token: dict = Depends(verify_token)):
    user_id = token["sub"]
    supabase = client_manager.get_supabase_client()

    user_query = supabase.table("profiles").select("user_name, full_name, email").eq("id", user_id).limit(1).execute()
    if not user_query.data:
        raise HTTPException(status_code=440, detail="User not found")

    try:
        owned_classrooms_response = supabase.table("classrooms").select("id, classname").eq("owner_id", user_id).execute()
        owned_classrooms = [
            OwnedClassroom(id=cls["id"], classname=cls["classname"], role="owner")
            for cls in owned_classrooms_response.data
        ]

        enrolled_as_admins_response = supabase.table("admins_of_classrooms").select(
            "classrooms(id, classname, owner_id, profiles!classes_owner_fkey(id, user_name))"
        ).eq("profile_id", user_id).execute()
        
        enrolled_as_admins = [ 
            EnrolledClassroom(
                classroom_id=cls["classrooms"]["id"],
                classroom_name=cls["classrooms"]["classname"],
                owner_id=cls["classrooms"]["profiles"]["id"],
                owner_name=cls["classrooms"]["profiles"]["user_name"],
                role="admin"
            ) 
            for cls in enrolled_as_admins_response.data
        ]

        enrolled_as_students_response = supabase.table("students_of_classrooms").select(
            "classrooms(id, classname, owner_id, profiles!classes_owner_fkey(id, user_name))"
        ).eq("profile_id", user_id).execute()

        enrolled_as_students = [
            EnrolledClassroom(
                classroom_id=cls["classrooms"]["id"],
                classroom_name=cls["classrooms"]["classname"],
                owner_id=cls["classrooms"]["profiles"]["id"],
                owner_name=cls["classrooms"]["profiles"]["user_name"],
                role="student"
            ) 
            for cls in enrolled_as_students_response.data
        ]
        
        return DashboardResponse(
            message="success",
            user_name=user_query.data[0]['user_name'],
            full_name=user_query.data[0]['full_name'],    
            email=user_query.data[0]['email'],
            owned_classrooms=owned_classrooms,
            enrolled_as_admins=enrolled_as_admins,
            enrolled_as_students=enrolled_as_students
        )
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching classrooms: {str(e)}")

@router.post("/dashboard", status_code=201)
async def create_user_profile(user_profile: UserProfile, token: dict = Depends(verify_token)):
    user_id = token["sub"]
    supabase = client_manager.get_supabase_client()
    
    user_query = supabase.table("profiles").select("user_name").eq("id", user_id).limit(1).execute()
    if user_query.data:
        raise HTTPException(status_code=409, detail="User profile already exists")
    
    profile_data = user_profile.model_dump(by_alias=False)
    profile_data["id"] = user_id

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
async def is_username_valid(user_name: str):
    supabase = client_manager.get_supabase_client()
    user_query = supabase.table("profiles").select("user_name").eq("user_name", user_name).limit(1).execute()
    
    if not user_query.data:
        return {"isValid": True, "message": "Username is available"}
    
    return {"isValid": False, "message": "Username already exists"}