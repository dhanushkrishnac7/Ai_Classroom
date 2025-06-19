from fastapi import FastAPI, HTTPException
from fastapi.responses import JSONResponse
from app.services.auth_middle import verify_token
from app.api.routes import dashboard
from app.api.routes.exception_handler import http_exception_handler
from fastapi.middleware.cors import CORSMiddleware
app = FastAPI()

origins = [
    "http://localhost:3000",  # Next.js frontend URL
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,       # Allow frontend origin(s)
    allow_credentials=True,
    allow_methods=["*"],         # Allow all HTTP methods
    allow_headers=["*"],         # Allow all headers
)

app.include_router(dashboard.router, prefix="", tags=["Users"])
app.add_exception_handler(HTTPException, http_exception_handler)