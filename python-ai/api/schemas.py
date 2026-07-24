from pydantic import BaseModel
from typing import List, Optional


class MatchRequest(BaseModel):
    """Request schema for the candidate matching endpoint."""
    resume_text: str
    job_description: str
    applicant_skills: List[str]
    required_skills: List[str]
    experience_years: Optional[float] = 0


class MatchResponse(BaseModel):
    """Response schema containing suitability analysis results."""
    suitability_score: float
    similarity_score: float
    matched_skills: List[str]
    missing_skills: List[str]
    explanation: str


class EnhanceRequest(BaseModel):
    """Request schema for the resume enhancement endpoint."""
    resume_text: str
    job_description: str


class EnhanceResponse(BaseModel):
    """Response schema containing the enhanced resume and changes made."""
    enhanced_resume: str
    changes_summary: List[str]
