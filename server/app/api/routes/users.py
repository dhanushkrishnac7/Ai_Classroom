
from fastapi import APIRouter, HTTPException
from app.core.supabase_client import supabase

router = APIRouter()

@router.get("/users")
def get_users():
    try:
        response = supabase.table("users").select("*").execute()
        return response.data
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
