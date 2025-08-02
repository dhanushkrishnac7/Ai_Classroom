import os
from functools import lru_cache
from pydantic_settings import BaseSettings
from dotenv import load_dotenv
from typing import Optional

load_dotenv()

class Settings(BaseSettings):
    # Service Credentials
    DEEPSEEK_API_ENDPOINT: Optional[str] = None
    DEEPSEEK_API_KEY: Optional[str] = None
    DEEPSEEK_DEPLOYMENT_NAME: Optional[str] = None
    DEEPSEEK_API_VERSION: Optional[str] = None
    
    GPT4O_ENDPOINT: Optional[str] = None
    GPT4O_API_KEY: Optional[str] = None
    GPT4O_DEPLOYMENT_NAME: Optional[str] = None
    GPT4O_API_VERSION: Optional[str] = None

    AZURE_OPENAI_ENDPOINT: str
    AZURE_OPENAI_API_KEY: str
    AZURE_OPENAI_API_VERSION: str
    EMBEDDING_MODEL_DEPLOYMENT: str
    
    OCR_ENDPOINT: str
    OCR_KEY: str
    
    SUPABASE_URL: str
    SUPABASE_KEY: str
    SUPABASE_JWT_SECRET: str
    
    AZURE_STORAGE_CONNECTION_STRING: str
    
    GEMINI_API_KEY: Optional[str] = None
    GEMINI_MODEL_NAME: Optional[str] = None

    # Configuration
    AZURE_STORAGE_CONTAINER_NAME: str = "diagram-images"
    AZURE_DOCS_CONTAINER_NAME: str = "uploaded-documents"
    AZURE_VIDEOS_CONTAINER_NAME: str = "uploaded-videos"
    MAX_FILE_SIZE: int = 50_000_000
    MAX_PAGES: int = 500
    BATCH_SIZE: int = 2
    MAX_CHUNK_SIZE: int = 1500
    CHUNK_OVERLAP: int = 150
    EMBEDDING_BATCH_SIZE: int = 16
    DIAGRAM_MAX_WIDTH: int = 1024
    DIAGRAM_MAX_HEIGHT: int = 1024
    DIAGRAM_JPEG_QUALITY: int = 75

    # Rate Limiting
    OCR_BURST_LIMIT: int = 60
    OCR_PAUSE_SECONDS: int = 10
    EMBEDDING_BURST_LIMIT: int = 300
    EMBEDDING_PAUSE_SECONDS: int = 5
    GPT4O_BURST_LIMIT: int = 50
    GPT4O_PAUSE_SECONDS: int = 60
    DEEPSEEK_BURST_LIMIT: int = 200
    DEEPSEEK_PAUSE_SECONDS: int = 60  # Updated from 30 to 60
    GPT4O_CONCURRENCY_LIMIT: int = 10

    class Config:
        env_file = ".env"
        extra = 'ignore'

@lru_cache()
def get_settings() -> Settings:
    return Settings()