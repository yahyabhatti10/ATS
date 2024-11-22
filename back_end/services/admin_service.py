from fastapi import FastAPI, Query, Depends, HTTPException, status
from fastapi.responses import JSONResponse
from fastapi.security import OAuth2PasswordRequestForm
from utils.admin_utils import get_current_admin, verify_password, create_access_token
from typing import List, Optional
from models import Candidate
from sqlalchemy.orm import Session
from database import get_db
from models import User, UserRole
from schemas import AdminCreate, AdminUpdate, AdminResponse
from utils.admin_utils import hash_password
from fastapi.encoders import jsonable_encoder
from datetime import datetime


async def login(form_data: OAuth2PasswordRequestForm, db: Session):
    user = db.query(User).filter(User.username == form_data.username).first()
    if not user or not verify_password(form_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )

    # Create access token with user info
    access_token = create_access_token(user=user)  # Pass the user object
    return {"access_token": access_token, "token_type": "bearer"}


async def admin_dashboard(db: Session = Depends(get_db)):
    # Fetch all candidates
    candidates = db.query(Candidate).all()

    def serialize_datetime(dt):
        return dt.isoformat() if isinstance(dt, datetime) else None

    # Process each candidate and include the new fields
    results = []
    for candidate in candidates:
        candidate_data = {
            "candidate_id": candidate.candidate_id,
            "name": candidate.name,
            "interview_token": candidate.interview_token,
            "token_expiry": serialize_datetime(candidate.token_expiry),
            "is_interviewed": candidate.is_interviewed,
            "is_valid": candidate.is_valid,
            "contact": [
                {
                    "email_address": contact.email_address,
                    "phone_number": contact.phone_number,
                }
                for contact in candidate.contacts
            ],
            "address": [
                {
                    "address_line_1": address.address_line_1,
                    "address_line_2": address.address_line_2,
                    "area": address.area,
                    "province": address.province,
                    "country": address.country,
                    "postal_code": address.postal_code,
                }
                for address in candidate.addresses
            ],
            "skills": [skill.skill for skill in candidate.skills],
            "projects": [
                {"name": project.name, "description": project.description}
                for project in candidate.projects
            ],
            "experiences": [
                {
                    "job_title": exp.job_title,
                    "company_name": exp.company_name,
                    "start_date": serialize_datetime(exp.start_date),
                    "end_date": serialize_datetime(exp.end_date),
                }
                for exp in candidate.experiences
            ],
            "education": [
                {
                    "degree": edu.degree,
                    "institution": edu.institution,
                    "start_date": serialize_datetime(edu.start_date),
                    "end_date": serialize_datetime(edu.end_date),
                }
                for edu in candidate.educations
            ],
            "interviews": [
                {
                    "interview_id": interview.interview_id,
                    "start_time": serialize_datetime(interview.start_time),
                    "end_time": serialize_datetime(interview.end_time),
                    "duration": interview.duration,
                    "transcript": interview.transcript,
                    "summary": interview.summary,
                    "recording_url": interview.recording_url,
                    "video_recording_url": interview.video_recording_url,
                    "created_at": serialize_datetime(interview.created_at),
                    "success_evaluation": interview.success_evaluation,
                }
                for interview in candidate.interviews  # Fetching interviews related to the candidate
            ],
        }
        results.append(candidate_data)

    # Return the data as a dictionary, not as a JSONResponse
    return {"total_candidates": len(candidates), "candidates": results}


async def admin_dashboard_filters(
    current_admin: str = Depends(get_current_admin),
    db: Session = Depends(get_db),
    skill: Optional[str] = Query(None),
    interviewed: Optional[bool] = Query(None),
    non_interviewed_expired: Optional[bool] = Query(None),
    pending_interviews: Optional[bool] = Query(None),
):
    # Query candidates with related data using joins
    candidates_query = (
        db.query(Candidate)
        .join(Candidate.contacts)
        .join(Candidate.addresses)
        .join(Candidate.skills)
        .join(Candidate.projects)
        .join(Candidate.experiences)
        .join(Candidate.educations)
        .distinct()
    )

    # Apply filters based on the query parameters
    if interviewed is not None:
        candidates_query = candidates_query.filter(
            Candidate.is_interviewed == interviewed
        )

    if non_interviewed_expired is not None:
        candidates_query = candidates_query.filter(
            Candidate.is_interviewed == False, Candidate.is_valid == False
        )

    if pending_interviews is not None:
        candidates_query = candidates_query.filter(
            Candidate.is_interviewed == False, Candidate.is_valid == True
        )

    # Apply skill filter if present
    if skill:
        candidates_query = candidates_query.filter(Candidate.skills.any(skill == skill))

    # Execute query to get the filtered candidates
    filtered_candidates = candidates_query.all()

    # Prepare the response data in the required format
    response_data = []
    for candidate in filtered_candidates:
        candidate_data = {
            "candidate_id": candidate.candidate_id,
            "name": candidate.name,
            "interview_token": candidate.interview_token,
            "token_expiry": candidate.token_expiry,
            "is_interviewed": candidate.is_interviewed,
            "is_valid": candidate.is_valid,
            "contact": [
                {
                    "email_address": contact.email_address,
                    "phone_number": contact.phone_number,
                }
                for contact in candidate.contacts
            ],
            "address": [
                {
                    "address_line_1": address.address_line_1,
                    "address_line_2": address.address_line_2,
                    "area": address.area,
                    "province": address.province,
                    "country": address.country,
                    "postal_code": address.postal_code,
                }
                for address in candidate.addresses
            ],
            "skills": [skill.skill for skill in candidate.skills],
            "projects": [
                {"name": project.name, "description": project.description}
                for project in candidate.projects
            ],
            "experiences": [
                {
                    "job_title": exp.job_title,
                    "company_name": exp.company_name,
                    "start_date": exp.start_date,
                    "end_date": exp.end_date,
                }
                for exp in candidate.experiences
            ],
            "education": [
                {
                    "degree": edu.degree,
                    "institution": edu.institution,
                    "start_date": edu.start_date,
                    "end_date": edu.end_date,
                }
                for edu in candidate.educations
            ],
        }
        response_data.append(candidate_data)

    return {"candidates": response_data}


# Create Admin
async def create_admin(admin_data: AdminCreate, db: Session) -> AdminResponse:
    # Check if the username already exists
    existing_user = db.query(User).filter(User.username == admin_data.username).first()
    if existing_user:
        raise HTTPException(status_code=400, detail="Username already exists")

    # Hash the password and create new admin user
    hashed_password = hash_password(admin_data.password)
    new_admin = User(
        username=admin_data.username,
        hashed_password=hashed_password,
        role=UserRole.admin,  # Assign admin role
    )

    db.add(new_admin)
    db.commit()
    db.refresh(new_admin)

    return AdminResponse(
        id=new_admin.id, username=new_admin.username, role=new_admin.role
    )


# Delete Admin
async def delete_admin(admin_id: int, db: Session):
    admin = (
        db.query(User).filter(User.id == admin_id, User.role == UserRole.admin).first()
    )
    if not admin:
        raise HTTPException(status_code=404, detail="Admin not found")

    # Soft-delete the admin by setting is_deleted to True
    admin.is_deleted = True
    db.commit()


# Update Admin
async def update_admin(
    admin_id: int, admin_data: AdminUpdate, db: Session
) -> AdminResponse:
    admin = (
        db.query(User).filter(User.id == admin_id, User.role == UserRole.admin).first()
    )
    if not admin:
        raise HTTPException(status_code=404, detail="Admin not found")

    # Update fields
    admin.username = admin_data.username
    admin.hashed_password = hash_password(
        admin_data.password
    )  # Re-hash the new password

    db.commit()
    db.refresh(admin)

    return AdminResponse(id=admin.id, username=admin.username, role=admin.role)


# Get All Admins
async def get_all_admins(db: Session) -> List[dict]:
    admins = (
        db.query(User)
        .filter(User.role == UserRole.admin, User.is_deleted == False)
        .all()
    )

    def serialize_datetime(dt):
        return dt.isoformat() if isinstance(dt, datetime) else None

    result = [
        {
            "id": admin.id,
            "username": admin.username,
            "role": admin.role.value,
            "created_at": serialize_datetime(admin.created_at),
            "updated_at": serialize_datetime(admin.updated_at),
        }
        for admin in admins
    ]
    print("Admins data:", result)  # Add this line
    return result
