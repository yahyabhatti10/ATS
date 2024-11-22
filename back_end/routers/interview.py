from fastapi import APIRouter, Depends, Request, HTTPException
from sqlalchemy.orm import Session
from database import get_db
from schemas import InterviewRequest
from database import get_db
from services import interview_service


router = APIRouter()

@router.post("/schedule")
async def schedule_interview(request_body: InterviewRequest, db: Session = Depends(get_db)):
    return await interview_service.schedule_interview(request_body, db)

@router.get("/validate_interview_link/{token}")
async def validate_interview_link(request: Request, db: Session = Depends(get_db)):
    return await interview_service.validate_interview_link(request, db)

@router.post("/vapi-end-of-call")
async def handle_vapi_end_of_call(request: Request, db: Session = Depends(get_db)):
    return await interview_service.handle_vapi_end_of_call(request, db)

@router.post("/end-interview/{candidate_id}")
async def end_interview(
    candidate_id: int,
    db: Session = Depends(get_db)
):
    updated_candidate = interview_service.end_interview(db, candidate_id)
    
    if not updated_candidate:
        raise HTTPException(status_code=404, detail="Candidate not found or update failed")
    
    return {
        "message": "Interview ended successfully",
        "candidate_id": updated_candidate.candidate_id,
        "is_interviewed": updated_candidate.is_interviewed,
        "is_valid": updated_candidate.is_valid
    }
