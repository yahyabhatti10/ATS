from pydantic import BaseModel, Field
from typing import Dict, Any, Optional, List
from datetime import datetime
from models import UserRole


class InterviewRequest(BaseModel):
    candidate_id: int


class VapiEndOfCallReport(BaseModel):
    message: Optional[Dict[str, Any]] = None
    variableValues: Optional[Dict[str, Any]] = None


class JobListingBase(BaseModel):
    title: str
    description: str
    location: Optional[str] = None
    salary: Optional[str] = None
    is_opened: Optional[bool] = True


class JobListingCreate(JobListingBase):
    pass


class JobListingUpdate(JobListingBase):
    pass


class JobListingResponse(JobListingBase):
    job_id: int
    date_posted: datetime

    class Config:
        from_attributes = True


class JobDescriptionSuggestion(BaseModel):
    description: str


class JobApplicationBase(BaseModel):
    job_id: int
    candidate_id: int
    status: str = "pending"
    match_score: Optional[float] = None


class JobApplicationCreate(JobApplicationBase):
    pass


class JobApplicationUpdate(BaseModel):
    status: Optional[str] = None
    match_score: Optional[float] = None


class JobApplicationResponse(JobApplicationBase):
    application_id: int
    date_applied: datetime
    job_listing: JobListingResponse  # Nested Job Listing in response
    interview_link: Optional[str] = None

    class Config:
        from_attributes = True


# Base schema for Candidate
class CandidateBase(BaseModel):
    name: str
    interview_token: Optional[str] = None
    token_expiry: Optional[datetime] = None
    is_interviewed: Optional[bool] = False
    is_valid: Optional[bool] = True


# Schema for creating a candidate
class CandidateCreate(CandidateBase):
    pass


# Schema for updating a candidate
class CandidateUpdate(CandidateBase):
    pass


# Schema for the response model (ORM Mode)
class CandidateResponse(CandidateBase):
    candidate_id: int

    class Config:
        from_attributes = True


class ApplicationRequest(BaseModel):
    candidate_id: int


class ApplicationResponse(BaseModel):
    application_id: int
    job_id: int
    candidate_id: int
    status: str
    date_applied: datetime
    match_score: float
    interview_link: Optional[str] = None
    explanation: str

    class Config:
        from_attributes = True


class MatchingResult(BaseModel):
    match_score: float
    explanation: str


class PaginatedApplicationsResponse(BaseModel):
    page: int
    page_size: int
    total_pages: int
    total_applications: int
    applications: List[ApplicationResponse]

    class Config:
        from_attributes = True


class PaginatedJobsResponse(BaseModel):

    total_jobs: int  # Changed from 'total' to 'total_jobs'
    page: int
    page_size: int
    total_pages: int
    jobs: List[JobListingResponse]

    class Config:
        from_attributes = True


class AdminCreate(BaseModel):
    username: str
    password: str


class AdminUpdate(BaseModel):
    username: Optional[str] = None  # Optional fields for partial update
    password: Optional[str] = None


class AdminResponse(BaseModel):
    id: int
    username: str
    role: UserRole

    class Config:
        orm_mode = True  # Allows Pydantic models to work with ORMs like SQLAlchemy


class PromptBase(BaseModel):
    name: str
    content: str
    required_elements: Optional[str] = None


class PromptCreate(PromptBase):
    pass


class PromptUpdate(BaseModel):
    content: str
    required_elements: Optional[str] = None


class PromptResponse(PromptBase):
    id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
