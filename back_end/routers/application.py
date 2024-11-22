from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from services import application_service
from database import get_db
from schemas import JobApplicationCreate, JobApplicationUpdate, JobApplicationResponse,PaginatedApplicationsResponse

router = APIRouter()

# Create a new job application
@router.post("/applications/", response_model=JobApplicationResponse)
async def create_application(application: JobApplicationCreate, db: Session = Depends(get_db)):
    return await application_service.create_application(db, application)

# Retrieve all job applications
@router.get("/applications/",response_model=PaginatedApplicationsResponse)
async def get_applications(db: Session = Depends(get_db)):
    return await application_service.get_applications(db)

# Retrieve a specific job application by ID
@router.get("/applications/{application_id}/", response_model=JobApplicationResponse)
async def get_application(application_id: int, db: Session = Depends(get_db)):
    application = await application_service.get_application(db, application_id)
    if not application:
        raise HTTPException(status_code=404, detail="Application not found")
    return application

# Update a job application by ID
@router.put("/applications/{application_id}/", response_model=JobApplicationResponse)
async def update_application(application_id: int, application: JobApplicationUpdate, db: Session = Depends(get_db)):
    return await application_service.update_application(db, application_id, application)

# Delete a job application by ID
@router.delete("/applications/{application_id}/")
async def delete_application(application_id: int, db: Session = Depends(get_db)):
    await application_service.delete_application(db, application_id)
    return {"detail": "Application deleted successfully"}
