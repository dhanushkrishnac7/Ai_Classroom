from fastapi import APIRouter, Depends, HTTPException
from app.services.auth_middle import verify_token
from app.core.supabase_client import supabase
