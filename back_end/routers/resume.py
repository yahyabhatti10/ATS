from fastapi import APIRouter, File, UploadFile, Depends
from sqlalchemy.orm import Session
from services import resume_service
from database import get_db
from services.resume_service import upload_resume, retrieve_resume, submit_resume



router = APIRouter()

@router.post("/upload/")
async def upload_resume(file: UploadFile = File(...), db: Session = Depends(get_db)):
    return await resume_service.upload_resume(file, db)

@router.get("/retrieve/")
async def retrieve_resume(filename: str, db: Session = Depends(get_db)):
    return await resume_service.retrieve_resume(filename, db)

@router.post("/submit/")
async def submit_resume(form_data: dict, db: Session = Depends(get_db)):
    return await resume_service.submit_resume(form_data, db)
