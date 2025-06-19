from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from app.api.routes import dashboard
from app.api.routes.exception_handler import http_exception_handler
from fastapi.middleware.cors import CORSMiddleware
app = FastAPI()

origins = [


    "http://localhost:3000"

]

app.add_middleware(
    CORSMiddleware,

    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(dashboard.router, prefix="", tags=["Users"])
app.add_exception_handler(HTTPException, http_exception_handler)