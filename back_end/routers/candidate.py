from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from services import candidate_service
from database import get_db
from schemas import CandidateCreate, CandidateUpdate, CandidateResponse,JobApplicationResponse

router = APIRouter()

# Create a new candidate
@router.post("/candidate/", response_model=CandidateResponse)
async def create_candidate(candidate: CandidateCreate, db: Session = Depends(get_db)):
    return await candidate_service.create_candidate(db, candidate)

# Get all candidates
@router.get("/candidate/", response_model=List[CandidateResponse])
async def get_candidates(db: Session = Depends(get_db)):
    return await candidate_service.get_candidates(db)

# Get a specific candidate by ID
@router.get("/candidate/{candidate_id}/", response_model=CandidateResponse)
async def get_candidate(candidate_id: int, db: Session = Depends(get_db)):
    candidate = await candidate_service.get_candidate(db, candidate_id)
    if not candidate:
        raise HTTPException(status_code=404, detail="Candidate not found")
    return candidate

# Update a candidate by ID
@router.put("/candidate/{candidate_id}/", response_model=CandidateResponse)
async def update_candidate(candidate_id: int, candidate: CandidateUpdate, db: Session = Depends(get_db)):
    return await candidate_service.update_candidate(db, candidate_id, candidate)

# Delete a candidate by ID
@router.delete("/candidate/{candidate_id}/")
async def delete_candidate(candidate_id: int, db: Session = Depends(get_db)):
    await candidate_service.delete_candidate(db, candidate_id)
    return {"detail": "Candidate deleted successfully"}

@router.get("/candidates/my-jobs/{candidate_id}/", response_model=List[JobApplicationResponse])
async def get_my_jobs( candidate_id : int , db:Session = Depends(get_db)):
     await candidate_service.get_my_jobs(db , candidate_id)
    