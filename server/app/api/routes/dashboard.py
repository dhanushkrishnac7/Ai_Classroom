from fastapi import FastAPI, APIRouter, Depends, HTTPException, status
from app.services.auth_middle import verify_token
from pydantic import BaseModel
from app.core.supabase_client import supabase
from app.schemas.dashboard import DashboardResponse

router = APIRouter()


@router.get("/dashboard")
async def get_dashboard(token = Depends(verify_token)):
    print(token)
