import asyncio
import logging
from app.core.config import get_settings

settings = get_settings()
logger = logging.getLogger(__name__)

class BurstAndPauseRateLimiter:
    def __init__(self):
        self._limits = {
            'ocr': {'limit': settings.OCR_BURST_LIMIT, 'pause': settings.OCR_PAUSE_SECONDS},
            'embedding': {'limit': settings.EMBEDDING_BURST_LIMIT, 'pause': settings.EMBEDDING_PAUSE_SECONDS},
            'gpt4o': {'limit': settings.GPT4O_BURST_LIMIT, 'pause': settings.GPT4O_PAUSE_SECONDS},
            'deepseek': {'limit': settings.DEEPSEEK_BURST_LIMIT, 'pause': settings.DEEPSEEK_PAUSE_SECONDS}
        }
        self._counters = {service: 0 for service in self._limits}
        self._lock = asyncio.Lock()

    async def check_and_wait(self, service_name: str):
        async with self._lock:
            limit_details = self._limits.get(service_name)
            if not limit_details:
                return
            
            if self._counters[service_name] >= limit_details['limit']:
                pause_duration = limit_details['pause']
                logger.warning(f"Burst rate limit for '{service_name}' reached. Pausing for {pause_duration} seconds.")
                await asyncio.sleep(pause_duration)
                self._counters[service_name] = 0
            
            self._counters[service_name] += 1

# Create a single instance to be used throughout the application
rate_limiter = BurstAndPauseRateLimiter()