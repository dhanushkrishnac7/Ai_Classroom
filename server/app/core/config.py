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

    # Rate Limiting (Requests Per Minute)
    OCR_RPM: int = 50
    EMBEDDING_RPM: int = 250
    GPT4O_RPM: int = 40
    DEEPSEEK_RPM: int = 180
    
    class Config:
        env_file = ".env"
        extra = 'ignore'

@lru_cache()
def get_settings() -> Settings:
    return Settings()