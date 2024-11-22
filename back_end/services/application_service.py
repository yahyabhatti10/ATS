from sqlalchemy.orm import Session
from models import JobApplication
from schemas import JobApplicationCreate, JobApplicationUpdate
from datetime import datetime
from services import matching_service, interview_service
from utils import db_utils
from schemas import ApplicationResponse, MatchingResult
from fastapi import HTTPException

# Create a new job application
async def create_application(db: Session, application: JobApplicationCreate):
    new_application = JobApplication(
        job_id=application.job_id,
        candidate_id=application.candidate_id,
        date_applied=datetime.now(),
        status=application.status
    )
    db.add(new_application)
    db.commit()
    db.refresh(new_application)
    return new_application

# Get all job applications
async def get_applications(db: Session, page: int = 1, page_size: int = 15):
    """
    Fetch paginated job applications. Defaults to page 1 and 15 applications per page.
    """
    offset = (page - 1) * page_size
    total_applications = db.query(JobApplication).count()
    total_pages = (total_applications + page_size - 1) // page_size
    applications = db.query(JobApplication).offset(offset).limit(page_size).all()
    if not applications:
        raise HTTPException(status_code=404, detail="No applications found.")
    return {
        "page": page,
        "page_size": page_size,
        "total_pages": total_pages,
        "total_applications": total_applications,
        "applications": applications
    }
    
    
# Get a specific job application by ID
async def get_application(db: Session, application_id: int):
    return db.query(JobApplication).filter(JobApplication.application_id == application_id).first()

# Update a job application
async def update_application(db: Session, application_id: int, application: JobApplicationUpdate):
    db_application = db.query(JobApplication).filter(JobApplication.application_id == application_id).first()
    if not db_application:
        return None
    db_application.status = application.status
    db.commit()
    db.refresh(db_application)
    return db_application

# Delete a job application
async def delete_application(db: Session, application_id: int):
    db_application = db.query(JobApplication).filter(JobApplication.application_id == application_id).first()
    if db_application:
        db.delete(db_application)
        db.commit()



async def process_application(job_id: int, candidate_id: int, db) -> dict:
    # Evaluate the match
    match_result: MatchingResult = await matching_service.evaluate_match(job_id, candidate_id)

    if match_result.match_score >= 7:  # Assuming 7 is the threshold
        # Create application record
        application_id = db_utils.create_application_record(db, job_id, candidate_id)
        
        # Schedule interview
        interview_result = await interview_service.schedule_interview(candidate_id, db)
        
        return {
            "application_id": application_id,
            "status": "Interview Scheduled",
            "interview_link": interview_result["interview_link"],
            "match_score": match_result.match_score,
            "explanation": match_result.explanation
        }
    else:
        return {
            "application_id": None,
            "status": "Not Qualified",
            "interview_link": None,
            "match_score": match_result.match_score,
            "explanation": match_result.explanation
        }
