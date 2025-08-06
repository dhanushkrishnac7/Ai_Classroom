import google.generativeai as genai
from azure.core.credentials import AzureKeyCredential
from azure.ai.formrecognizer.aio import DocumentAnalysisClient
from azure.storage.blob.aio import BlobServiceClient
from supabase import create_client, Client
from langchain_openai import AzureOpenAIEmbeddings, AzureChatOpenAI
import tiktoken
import logging
from typing import Optional

from app.core.config import get_settings

settings = get_settings()
logger = logging.getLogger(__name__)

class ClientManager:
    def __init__(self):
        self._blob_service_client = None
        self._embeddings = None
        self._deepseek_llm = None
        self._gpt4o_chat_llm = None
        self._encoding = None
        if settings.GEMINI_API_KEY:
            genai.configure(api_key=settings.GEMINI_API_KEY)

    def get_supabase_client(self) -> Client:
        """Creates and returns a new Supabase client."""
        return create_client(settings.SUPABASE_URL, settings.SUPABASE_KEY)

    @property
    def ocr(self) -> DocumentAnalysisClient:
        return DocumentAnalysisClient(settings.OCR_ENDPOINT, AzureKeyCredential(settings.OCR_KEY))

    @property
    def blob_service_client(self) -> BlobServiceClient:
        if not self._blob_service_client:
            self._blob_service_client = BlobServiceClient.from_connection_string(settings.AZURE_STORAGE_CONNECTION_STRING)
        return self._blob_service_client

    @property
    def embeddings(self) -> AzureOpenAIEmbeddings:
        if not self._embeddings:
            self._embeddings = AzureOpenAIEmbeddings(
                azure_endpoint=settings.AZURE_OPENAI_ENDPOINT,
                api_key=settings.AZURE_OPENAI_API_KEY,
                azure_deployment=settings.EMBEDDING_MODEL_DEPLOYMENT,
                api_version=settings.AZURE_OPENAI_API_VERSION,
                chunk_size=settings.EMBEDDING_BATCH_SIZE
            )
        return self._embeddings

    @property
    def deepseek_llm(self) -> Optional[AzureChatOpenAI]:
        if not self._deepseek_llm:
            if not all([settings.DEEPSEEK_API_ENDPOINT, settings.DEEPSEEK_API_KEY, settings.DEEPSEEK_DEPLOYMENT_NAME, settings.DEEPSEEK_API_VERSION]):
                return None
            self._deepseek_llm = AzureChatOpenAI(
                azure_endpoint=settings.DEEPSEEK_API_ENDPOINT,
                api_key=settings.DEEPSEEK_API_KEY,
                azure_deployment=settings.DEEPSEEK_DEPLOYMENT_NAME,
                api_version=settings.DEEPSEEK_API_VERSION,
                temperature=0.1, max_retries=3, timeout=90
            )
        return self._deepseek_llm
        
    @property
    def gpt4o_chat_llm(self) -> Optional[AzureChatOpenAI]:
        if not self._gpt4o_chat_llm:
            if not all([settings.GPT4O_ENDPOINT, settings.GPT4O_API_KEY, settings.GPT4O_DEPLOYMENT_NAME, settings.GPT4O_API_VERSION]):
                logger.warning("GPT-4o client not configured. Diagram processing will be skipped.")
                return None
            self._gpt4o_chat_llm = AzureChatOpenAI(
                azure_endpoint=settings.GPT4O_ENDPOINT, 
                api_key=settings.GPT4O_API_KEY, 
                azure_deployment=settings.GPT4O_DEPLOYMENT_NAME, 
                api_version=settings.GPT4O_API_VERSION, 
                temperature=0.0, max_retries=3, timeout=60
            )
        return self._gpt4o_chat_llm

    @property
    def encoding(self):
        if not self._encoding:
            self._encoding = tiktoken.get_encoding('cl100k_base')
        return self._encoding

client_manager = ClientManager()

# Make clients directly accessible
ocr = client_manager.ocr
blob_service_client = client_manager.blob_service_client
embeddings_client = client_manager.embeddings
deepseek_llm = client_manager.deepseek_llm
gpt4o_chat_llm = client_manager.gpt4o_chat_llm
encoding = client_manager.encoding