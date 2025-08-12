import asyncio
import logging
from typing import Dict, Any

from app.services.rag_processing import process_document_background

logger = logging.getLogger(__name__)

class DocumentProcessingQueue:
    def __init__(self):
        self.queue = asyncio.Queue()
        self.worker_task = None

    async def _worker(self):
        """Continuously pulls tasks from the queue and processes them."""
        while True:
            try:
                task_data = await self.queue.get()
                logger.info(f"Starting processing for doc '{task_data['doc_id']}' from the queue.")
                await process_document_background(**task_data)
                self.queue.task_done()
            except Exception as e:
                logger.error(f"Error in document processing worker: {e}", exc_info=True)

    def start_worker(self):
        """Starts the background worker task."""
        if self.worker_task is None:
            self.worker_task = asyncio.create_task(self._worker())
            logger.info("Document processing queue worker started.")

    async def add_to_queue(self, task_data: Dict[str, Any]):
        """Adds a new document processing task to the queue."""
        await self.queue.put(task_data)
        logger.info(f"Doc '{task_data['doc_id']}' has been added to the processing queue.")

# Create a single, global instance of the queue
document_queue = DocumentProcessingQueue()