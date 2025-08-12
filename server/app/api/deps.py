"""
API Dependencies module for FastAPI dependency injection.
"""

from typing import Annotated
from fastapi import Depends

from app.core.config import get_settings, Settings
from app.services.rate_limiter import rate_limiter, RateLimiter


def get_rate_limiter() -> RateLimiter:
    """Dependency to get the rate limiter instance."""
    return rate_limiter


def get_app_settings() -> Settings:
    """Dependency to get application settings."""
    return get_settings()


# Type aliases for dependency injection
SettingsDep = Annotated[Settings, Depends(get_app_settings)]
RateLimiterDep = Annotated[RateLimiter, Depends(get_rate_limiter)]