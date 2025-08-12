from fastapi import FastAPI
from contextlib import asynccontextmanager
import logging

from app.api.routes import classroom, dashboard, exception_handler, classroom_details
from app.core.config import get_settings
from app.core.clients import client_manager
from app.services.document_queue import document_queue

# Initialize settings and logger
settings = get_settings()
logger = logging.getLogger(__name__)

@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Handles application startup and shutdown events.
    """
    # Startup event
    logger.info("Application startup: Initializing services...")
    await client_manager.ensure_containers_exist()
    document_queue.start_worker()
    logger.info("All services initialized.")
    yield
    # Shutdown event
    logger.info("Application shutdown.")

# Create the FastAPI app instance with the lifespan manager
app = FastAPI(title="AI Classroom API", lifespan=lifespan)

# Add the custom exception handler
app.add_exception_handler(Exception, exception_handler.http_exception_handler)

# Include your API routers
app.include_router(classroom.router, prefix="/api", tags=["Classroom"])
app.include_router(dashboard.router, prefix="/api", tags=["Dashboard"])
app.include_router(classroom_details.router, prefix="/api", tags=["Classroom Details"])


@app.get("/")
def read_root():
    """
    Root endpoint for the API.
    """
    return {"message": "Welcome to the AI Classroom API"}