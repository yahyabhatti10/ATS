from sqlalchemy.orm import Session
from models import JobListing, JobApplication
from schemas import JobListingCreate, JobListingUpdate, ApplicationResponse, MatchingResult, PaginatedJobsResponse, JobListingResponse
from datetime import datetime
from services import matching_service, interview_service, resume_service
from fastapi import HTTPException
import logging
from config import settings
from utils.jobs_utils import generate_job_description
import asyncio
from sqlalchemy import func


logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Create a new job listing
async def create_job(db: Session, job: JobListingCreate):
    db_job = JobListing(
        title=job.title,
        description=job.description,
        location=job.location,
        salary=job.salary,
        is_opened=job.is_opened,
        date_posted=datetime.now()
    )
    db.add(db_job)
    db.commit()
    db.refresh(db_job)
    return db_job

# Get all job listings
async def get_jobs(db: Session, page: int, page_size: int = 15) -> PaginatedJobsResponse:
    # Calculate the offset
    offset = (page - 1) * page_size

    # Query for paginated jobs
    jobs = db.query(JobListing).offset(offset).limit(page_size).all()

    # Get total count of jobs
    total_jobs = db.query(func.count(JobListing.id)).scalar()

    # Calculate total pages
    total_pages = (total_jobs + page_size - 1) // page_size

    # Convert jobs to response model
    job_responses = [JobListingResponse.from_orm(job) for job in jobs]

    return PaginatedJobsResponse(
        jobs=job_responses,
        total=total_jobs,
        page=page,
        page_size=page_size,
        total_pages=total_pages
    )

# Get a specific job by ID
async def get_job(db: Session, job_id: int):
    return db.query(JobListing).filter(JobListing.job_id == job_id).first()

# Update a job listing
async def update_job(db: Session, job_id: int, job: JobListingUpdate):
    db_job = db.query(JobListing).filter(JobListing.job_id == job_id).first()
    if not db_job:
        return None
    db_job.title = job.title
    db_job.description = job.description
    db_job.location = job.location
    db_job.salary = job.salary
    db_job.is_opened = job.is_opened
    db.commit()
    db.refresh(db_job)
    return db_job

# Delete a job listing
async def delete_job(db: Session, job_id: int):
    db_job = db.query(JobListing).filter(JobListing.job_id == job_id).first()
    if db_job:
        db.delete(db_job)
        db.commit()

async def get_job_details(db: Session, job_id: int) -> dict:
    job = db.query(JobListing).filter(JobListing.job_id == job_id).first()
    if not job:
        return None
    
    return {
        "title": job.title or None,
        "description": job.description or None,
        "location": job.location or None,
        "salary": job.salary or None,
        "date_posted": job.date_posted.strftime("%Y-%m-%d") if job.date_posted else None,
        "is_opened": job.is_opened if job.is_opened is not None else None
    }


async def apply_for_job(db: Session, job_id: int, candidate_id: int) -> ApplicationResponse:
    logger.info(f"Applying for job_id: {job_id}, candidate_id: {candidate_id}")
    
    job = db.query(JobListing).filter(JobListing.job_id == job_id).first()
    if not job:
        logger.error(f"Job with id {job_id} not found")
        raise ValueError(f"Job with id {job_id} not found")

    logger.info(f"Job details: {job.__dict__}")

    # Create a new application with initial status "Pending"
    new_application = JobApplication(
        job_id=job_id,
        candidate_id=candidate_id,
        date_applied=datetime.utcnow(),
        status="Pending",
        match_score=None  # We'll update this after evaluation
    )
    
    db.add(new_application)
    db.commit()
    db.refresh(new_application)
    logger.info(f"New application created: {new_application.__dict__}")

    # Fetch and log the parsed resume
    parsed_resume = await resume_service.get_parsed_resume(db, candidate_id)
    logger.info(f"Parsed resume for candidate {candidate_id}: {parsed_resume}")

    # Evaluate the match
    match_result: MatchingResult = await matching_service.evaluate_match(db, job_id, candidate_id)
    logger.info(f"Match result: {match_result}")

    # Update the application with the match score
    new_application.match_score = match_result.match_score

    if match_result.match_score >= 7:
        logger.info("High match score: Scheduling interview")
        class RequestBody:
            def __init__(self, candidate_id):
                self.candidate_id = candidate_id

        request_body = RequestBody(candidate_id)
        interview_result = await interview_service.schedule_interview(request_body, db)
        new_application.status = "Interview Scheduled"
        interview_link = interview_result.get("interview_link")
        logger.info(f"Interview scheduled: {interview_link}")
    # elif match_result.match_score >= 5:
    #     logger.info("Medium match score: Keeping as 'Pending' for manual review")
    #     new_application.status = "Pending"
    #     interview_link = None
    else:
        logger.info("Low match score: Marking as 'Not Qualified'")
        new_application.status = "Not Qualified"
        interview_link = None

    db.commit()
    logger.info(f"Application status updated: {new_application.status}")

    response = ApplicationResponse(
        application_id=new_application.application_id,
        job_id=job_id,
        candidate_id=candidate_id,
        status=new_application.status,
        date_applied=new_application.date_applied,
        match_score=match_result.match_score,
        interview_link=interview_link,
        explanation=match_result.explanation
    )
    logger.info(f"Application response: {response}")

    return response
