from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.routes import classroom, dashboard

app = FastAPI(title="AI Classroom API", version="1.0.0")

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(dashboard.router, prefix="/api", tags=["Dashboard"])
app.include_router(classroom.router, prefix="/api", tags=["Classroom"])

@app.get("/")
async def read_root():
    return {"message": "Welcome to the AI Classroom API"}

