from fastapi import FastAPI, HTTPException
from fastapi.responses import JSONResponse
from app.services.auth_middle import verify_token
from app.api.routes import dashboard
from app.api.routes.exception_handler import http_exception_handler

app = FastAPI()

app.include_router(dashboard.router, prefix="", tags=["Users"])
app.add_exception_handler(HTTPException, http_exception_handler)