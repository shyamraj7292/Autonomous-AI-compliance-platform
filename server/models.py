from pydantic import BaseModel, Field
from typing import List, Optional, Literal
from datetime import datetime

class ComplianceFinding(BaseModel):
    id: str
    severity: Literal["critical", "high", "medium", "low"]
    description: str
    remediation: str
    timestamp: datetime = Field(default_factory=datetime.now)

class Regulation(BaseModel):
    id: str
    name: str
    description: str
    url: Optional[str] = None

class DashboardMetrics(BaseModel):
    score: int
    risks: int
    policies_mapped: int
    pending_reviews: int
