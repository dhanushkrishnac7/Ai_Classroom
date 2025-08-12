import asyncio
import logging
from typing import Dict

from app.core.config import get_settings

logger = logging.getLogger(__name__)
settings = get_settings()

class ServiceRateLimiter:
    """Manages a queue of requests for a single service to enforce a burst-then-sleep pattern."""
    def __init__(self, service_name: str, burst_limit: int, sleep_interval: int):
        self.service_name = service_name
        self.burst_limit = burst_limit
        self.sleep_interval = sleep_interval
        self.queue = asyncio.Queue()
        self.worker_task = asyncio.create_task(self._worker())

    async def _worker(self):
        """Processes requests from the queue, enforcing burst limits and sleep intervals."""
        request_count = 0
        while True:
            future = await self.queue.get()
            try:
                if request_count >= self.burst_limit:
                    logger.info(f"Burst limit of {self.burst_limit} hit for {self.service_name}. Waiting for {self.sleep_interval} seconds.")
                    await asyncio.sleep(self.sleep_interval)
                    request_count = 0  # Reset after sleeping

                if not future.cancelled():
                    future.set_result(None)
                
                request_count += 1

            except Exception as e:
                logger.error(f"Error in {self.service_name} rate limiter worker: {e}")
                if not future.done():
                    future.set_exception(e)
            finally:
                self.queue.task_done()

    async def check_and_wait(self):
        """Adds a request to the queue and waits for it to be processed."""
        future = asyncio.Future()
        await self.queue.put(future)
        await future

class RateLimiter:
    """Manages all service rate limiters."""
    def __init__(self, settings):
        self.limiters: Dict[str, ServiceRateLimiter] = {
            'ocr': ServiceRateLimiter(service_name='ocr', burst_limit=60, sleep_interval=20),
            'embedding': ServiceRateLimiter(service_name='embedding', burst_limit=150, sleep_interval=60),
            'gpt4o': ServiceRateLimiter(service_name='gpt4o', burst_limit=20, sleep_interval=60),
            'deepseek': ServiceRateLimiter(service_name='deepseek', burst_limit=120, sleep_interval=60)
        }

    async def check_and_wait(self, service: str):
        limiter = self.limiters.get(service)
        if limiter:
            await limiter.check_and_wait()

rate_limiter = RateLimiter(settings)