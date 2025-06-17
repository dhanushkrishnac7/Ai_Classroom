from fastapi import FastAPI, APIRouter, Depends, HTTPException, status
from app.services.auth_middle import verify_token
from app.core.supabase_client import supabase
from app.schemas.dashboard import DashboardResponse
from app.schemas.dashboard import UserProfile

router = APIRouter()


@router.get("/dashboard", response_model=DashboardResponse)
async def get_dashboard(token=Depends(verify_token)):
    user_id = token["sub"]
    user_query = supabase.table("profiles").select("user_name").eq("id", user_id).limit(1).execute()
    if not user_query.data:
        raise HTTPException(status_code=440, detail="User_not_found")
    


@router.post("/dashboard")
async def create_user_profile(user_profile: UserProfile, token=Depends(verify_token)):
    user_id = token["sub"]

    user_query = supabase.table("profiles").select("user_name").eq("id", user_id).limit(1).execute()
    if user_query.data:
        raise HTTPException(status_code=440, detail="User_already_exists")
    
    profile_data = user_profile.dict(by_alias=False)
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
