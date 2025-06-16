from pydantic import BaseModel, Field
from typing import Optional, List

class DashboardResponse(BaseModel):
    message : str = Field(..., description="Response message")
    classnames : Optional[list[str]] = Field(default_factory=list, description="Class name")
    admins : Optional[list[str]] = Field(default_factory=list, description="Admin names")