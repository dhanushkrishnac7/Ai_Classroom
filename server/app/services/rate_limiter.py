import asyncio
import time
import logging
from typing import Dict

from app.core.config import get_settings

logger = logging.getLogger(__name__)
settings = get_settings()

class ServiceRateLimiter:
    """Manages requests for a single service to enforce a burst-then-sleep pattern."""
    def __init__(self, service_name: str, burst_limit: int, sleep_interval: int):
        self.service_name = service_name
        self.burst_limit = burst_limit
        self.sleep_interval = sleep_interval
        self.request_count = 0
        self.lock = asyncio.Lock()
        self.is_sleeping = False

    async def check_and_wait(self):
        """
        Checks if a request can proceed. If the burst limit is hit, it enforces a sleep period
        for all subsequent requests until the interval is over.
        """
        while True:
            async with self.lock:
                if self.is_sleeping:
                    # If another task has already initiated the sleep, wait for it to finish.
                    pass
                elif self.request_count >= self.burst_limit:
                    # This task is the one hitting the limit, so it initiates the sleep.
                    logger.info(f"Burst limit of {self.burst_limit} hit for {self.service_name}. Waiting for {self.sleep_interval} seconds.")
                    self.is_sleeping = True
                    # Release the lock before sleeping to allow other tasks to check the `is_sleeping` flag.
                    await asyncio.sleep(self.sleep_interval)
                    # Re-acquire lock to safely reset state.
                    self.request_count = 0
                    self.is_sleeping = False
                    continue  # Re-evaluate in the next loop iteration.
                else:
                    # If not sleeping and limit not hit, proceed.
                    self.request_count += 1
                    return
            
            # If we are here, it means the service is sleeping. Wait a bit before retrying.
            await asyncio.sleep(0.1)


class RateLimiter:
    """Manages all service rate limiters."""
    def __init__(self, settings: settings):
        self.limiters: Dict[str, ServiceRateLimiter] = {
            'ocr': ServiceRateLimiter(service_name='ocr', burst_limit=60, sleep_interval=10),
            'embedding': ServiceRateLimiter(service_name='embedding', burst_limit=150, sleep_interval=60),
            'gpt4o': ServiceRateLimiter(service_name='gpt4o', burst_limit=20, sleep_interval=60),
            'deepseek': ServiceRateLimiter(service_name='deepseek', burst_limit=120, sleep_interval=60)
        }

    async def check_and_wait(self, service: str):
        limiter = self.limiters.get(service)
        if limiter:
            await limiter.check_and_wait()

rate_limiter = RateLimiter(settings)