# from sqlalchemy.orm import Session
# from models import Candidate

# async def get_all_candidates(db: Session):
#     candidates = db.query(Candidate).all()
#     results = []
#     for candidate in candidates:
#         candidate_data = {
#             "candidate_id": candidate.candidate_id,
#             "name": candidate.name,
#             "contact": [{"email_address": contact.email_address, "phone_number": contact.phone_number} for contact in candidate.contacts],
#             "address": [{"address_line_1": address.address_line_1, "address_line_2": address.address_line_2, "area": address.area, "province": address.province, "country": address.country, "postal_code": address.postal_code} for address in candidate.addresses],
#             "skills": [skill.skill for skill in candidate.skills],
#             "projects": [{"name": project.name, "description": project.description} for project in candidate.projects],
#             "experiences": [{"job_title": exp.job_title, "company_name": exp.company_name, "start_date": exp.start_date, "end_date": exp.end_date} for exp in candidate.experiences],
#             "education": [{"degree": edu.degree, "institution": edu.institution, "start_date": edu.start_date, "end_date": edu.end_date} for edu in candidate.educations]
#         }
#         results.append(candidate_data)
#     return results


from sqlalchemy.orm import Session
from models import Candidate,JobListing,JobApplication
from schemas import CandidateCreate, CandidateUpdate
from datetime import datetime
from fastapi import HTTPException
# Create a new candidate
async def create_candidate(db: Session, candidate: CandidateCreate):
    new_candidate = Candidate(
        name=candidate.name,
        interview_token=candidate.interview_token,
        token_expiry=candidate.token_expiry,
        is_interviewed=candidate.is_interviewed,
        is_valid=candidate.is_valid
    )
    db.add(new_candidate)
    db.commit()
    db.refresh(new_candidate)
    return new_candidate

# Get all candidates
async def get_candidates(db: Session):
    return db.query(Candidate).all()

# Get a specific candidate by ID
async def get_candidate(db: Session, candidate_id: int):
    return db.query(Candidate).filter(Candidate.candidate_id == candidate_id).first()

# Update a candidate
async def update_candidate(db: Session, candidate_id: int, candidate: CandidateUpdate):
    db_candidate = db.query(Candidate).filter(Candidate.candidate_id == candidate_id).first()
    if not db_candidate:
        return None
    db_candidate.name = candidate.name
    db_candidate.interview_token = candidate.interview_token
    db_candidate.token_expiry = candidate.token_expiry
    db_candidate.is_interviewed = candidate.is_interviewed
    db_candidate.is_valid = candidate.is_valid
    db.commit()
    db.refresh(db_candidate)
    return db_candidate

# Delete a candidate
async def delete_candidate(db: Session, candidate_id: int):
    db_candidate = db.query(Candidate).filter(Candidate.candidate_id == candidate_id).first()
    if db_candidate:
        db.delete(db_candidate)
        db.commit()


async def get_my_jobs(candidate_id: int, db: Session):
    """
    Get all job applications for a specific candidate along with the job details.
    """
    applications = db.query(JobApplication).join(JobListing).filter(JobApplication.candidate_id == candidate_id).all()
    
    if not applications:
        raise HTTPException(status_code=404, detail="No job applications found for this candidate.")
    
    return applications