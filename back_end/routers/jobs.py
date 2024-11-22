from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List
from services import job_service, application_service
from database import get_db
from schemas import JobListingCreate, JobListingUpdate, JobListingResponse, ApplicationRequest, ApplicationResponse,PaginatedJobsResponse, JobDescriptionSuggestion
from utils.jobs_utils import generate_job_description
from sqlalchemy import func
from models import JobListing
import logging

logger = logging.getLogger(__name__)
router = APIRouter()



# Suggest a job description
@router.get("/jobs/suggest-description/", response_model=JobDescriptionSuggestion)
async def suggest_job_description(
    title: str = Query(..., description="Job title"),
    keywords: str = Query(..., description="Keywords related to the job"),
    db: Session = Depends(get_db)
):
    try:
        logger.info(f"Received request for job description. Title: {title}, Keywords: {keywords}")
        suggested_job = await job_service.suggest_job_description(title, keywords, db)
        logger.info(f"Generated job description: {suggested_job}")
        return JobDescriptionSuggestion(description=suggested_job)
    except Exception as e:
        logger.error(f"Error in suggest_job_description: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"An error occurred while generating the description: {str(e)}")

# Create a new job listing
@router.post("/jobs/", response_model=JobListingResponse)
async def create_job(job: JobListingCreate, db: Session = Depends(get_db)):
    return await job_service.create_job(db, job)

# Retrieve all job listings
@router.get("/jobs/", response_model=PaginatedJobsResponse)
async def get_jobs(
    page: int = Query(1, ge=1, description="Page number"),
    db: Session = Depends(get_db)
):
    page_size = 15  # Set the page size to 15 jobs per page

    # Calculate the offset
    offset = (page - 1) * page_size

    # Query for paginated jobs
    jobs = db.query(JobListing).offset(offset).limit(page_size).all()

    # Get total count of jobs
    total_jobs = db.query(func.count(JobListing.job_id)).scalar()

    # Calculate total pages
    total_pages = (total_jobs + page_size - 1) // page_size

    # Convert jobs to response model
    job_responses = [JobListingResponse.from_orm(job) for job in jobs]

    return PaginatedJobsResponse(
        jobs=job_responses,
        total_jobs=total_jobs,  # Changed from 'total' to 'total_jobs'
        page=page,
        page_size=page_size,
        total_pages=total_pages
    )


# Retrieve a specific job listing by ID
@router.get("/jobs/{job_id}/", response_model=JobListingResponse)
async def get_job(job_id: int, db: Session = Depends(get_db)):
    job = await job_service.get_job(db, job_id)
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    return job

# Update a job listing by ID
@router.put("/jobs/{job_id}/", response_model=JobListingResponse)
async def update_job(job_id: int, job: JobListingUpdate, db: Session = Depends(get_db)):
    return await job_service.update_job(db, job_id, job)

# Delete a job listing by ID
@router.delete("/jobs/{job_id}/")
async def delete_job(job_id: int, db: Session = Depends(get_db)):
    await job_service.delete_job(db, job_id)
    return {"detail": "Job deleted successfully"}

# New route for job application
@router.post("/jobs/apply/{job_id}", response_model=ApplicationResponse)
async def apply_for_job(job_id: int, application: ApplicationRequest, db: Session = Depends(get_db)):
    try:
        result = await job_service.apply_for_job(db, job_id, application.candidate_id)
        return result
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"An error occurred: {str(e)}")






