from fastapi import FastAPI, Depends, HTTPException, status, Request
from fastapi.responses import JSONResponse
from app.services.auth_middle import verify_token
from app.api.routes import dashboard
from app.api.routes.exception_handler import router as exception_handler_router

app = FastAPI()

app.include_router(dashboard.router, prefix="", tags=["Users"])
app.add_exception_handler(HTTPException, exception_handler_router)