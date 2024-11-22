from fastapi import HTTPException, Request, Depends
from sqlalchemy.orm import Session
from models import Candidate, Interview
from utils import email_utils, db_utils
from datetime import datetime, timedelta
from zoneinfo import ZoneInfo
import json
from config import settings
from database import get_db
import logging

# logging.basicConfig(level=logging.DEBUG)
# logger = logging.getLogger(__name__)


async def schedule_interview(request_body, db: Session):
    candidate_id = request_body.candidate_id
    candidate_email, candidate_name = db_utils.get_candidate_details(db, candidate_id)
    
    if candidate_email:
        token, expiration_time_utc = db_utils.generate_candidate_link(db, candidate_id)
        interview_url = f"http://localhost:5173/vapi/{token}"  # Replace with actual frontend URL

        expiration_time_pst = expiration_time_utc.astimezone(ZoneInfo("Asia/Karachi"))
        expiration_time_str = expiration_time_pst.strftime("%Y-%m-%d %I:%M %p %Z")

        subject = "Congratulations! You're Shortlisted for EDVENITY"

        body = (f"Dear {candidate_name},\n\n"
                "Congratulations! We are thrilled to inform you that you have been shortlisted for the position at EDVENITY. "
                "Your qualifications and experience have impressed our team, and we're excited to learn more about you.\n\n"
                "We would like to invite you to the next stage of our selection process: an interview with our team.\n\n"
                f"Interview Details:\n"
                f"• Link: {interview_url}\n"
                f"• Expiration: {expiration_time_str} (Pakistan Standard Time)\n\n"
                "This is an excellent opportunity for us to get to know you better and for you to learn more about EDVENITY "
                "and the exciting role we have to offer.\n\n"
                "To ensure a smooth interview experience:\n"
                "1. Please test the link before the scheduled time.\n"
                "2. Ensure you have a stable internet connection.\n"
                "3. Choose a quiet location for the interview.\n\n"
                "If you have any questions or need to reschedule, please don't hesitate to contact us.\n\n"
                "Once again, congratulations on reaching this stage. We look forward to speaking with you and potentially "
                "welcoming you to the EDVENITY team.\n\n"
                "Best regards,\n"
                "EDVENITY Recruitment Team")

        email_utils.send_interview_email(candidate_email, subject, body)

        return {"message": f"Interview scheduled for candidate ID {candidate_id} ({candidate_name}).",
                "interview_link": interview_url}
    else:
        raise HTTPException(status_code=404, detail=f"Candidate with ID {candidate_id} not found.")

async def validate_interview_link(request: Request, db: Session = Depends(get_db)):

    token = request.path_params.get("token")
    # Fetch the candidate by token and check if the token is valid and the interview has not been completed
    candidate = db.query(Candidate).filter(
        Candidate.interview_token == token,
        Candidate.is_valid.is_(True),   # Check if token is still valid
        Candidate.is_interviewed.is_(False)  # Check if interview has not been completed
    ).first()

    # If no candidate is found or the token is invalid or interview is completed
    if not candidate:
        raise HTTPException(status_code=400, detail="Link has expired or is invalid.")

    # Get the current time in UTC or convert it to the required timezone
    current_time = datetime.utcnow()

    # Check if the token has expired
    if current_time > candidate.token_expiry:
        # Mark the token as invalid because it has expired
        candidate.is_valid = False
        db.commit()  # Save the changes in the database

        raise HTTPException(status_code=400, detail="Link has expired due to token expiration.")

    # Prepare the candidate data in the required format
    candidate_data = {
        "candidate_id": candidate.candidate_id,
        "name": candidate.name,
        "contact": [{"email_address": contact.email_address, "phone_number": contact.phone_number} for contact in candidate.contacts],
        "address": [{"address_line_1": address.address_line_1, "address_line_2": address.address_line_2, "area": address.area, "province": address.province, "country": address.country, "postal_code": address.postal_code} for address in candidate.addresses],
        "skills": [skill.skill for skill in candidate.skills],
        "projects": [{"name": project.name, "description": project.description} for project in candidate.projects],
        "experiences": [{"job_title": exp.job_title, "company_name": exp.company_name, "start_date": exp.start_date, "end_date": exp.end_date} for exp in candidate.experiences],
        "education": [{"degree": edu.degree, "institution": edu.institution, "start_date": edu.start_date, "end_date": edu.end_date} for edu in candidate.educations]
    }

    # Return the candidate data if the token is still valid and the interview has not been completed
    return candidate_data

async def handle_vapi_end_of_call(request: Request, db: Session):
    try:
        # Parse and validate incoming JSON data
        data = await request.json()
        if not isinstance(data, dict):
            raise ValueError(f"Expected a JSON object, but received {type(data)}")

        # Extract and validate message, analysis, and assistant data
        message = data.get('message')
        analysis = message.get('analysis')
        assistant = message.get('assistant')
        artifact = message.get('artifact', {})
       
        # Extract and process success evaluation
        success_evaluation = analysis.get('successEvaluation')
        try:
            success_evaluation = int(success_evaluation) if success_evaluation is not None else 0
        except ValueError:
            success_evaluation = 0

        # Extract candidate ID and verify candidate exists
        variable_values = assistant.get('variableValues')
        candidate_id = variable_values.get('candidateId')
        # ... (validation checks for candidate_id)

        candidate = db.query(Candidate).filter(Candidate.candidate_id == candidate_id).first()
        if not candidate:
            raise HTTPException(status_code=404, detail=f"Candidate with ID {candidate_id} not found")

        try:
            # Create new Interview object and update candidate status
            new_interview = Interview(
                candidate_id=candidate_id,
                start_time=datetime.fromisoformat(message.get('startedAt', datetime.utcnow().isoformat())),
                end_time=datetime.fromisoformat(message.get('endedAt', datetime.utcnow().isoformat())),
                duration=float(message.get('durationSeconds', 0)),
                transcript=message.get('transcript', ''),
                summary=analysis.get('summary', ''),
                recording_url=message.get('recordingUrl', ''),
                video_recording_url=artifact.get('videoRecordingUrl', ''),
                success_evaluation=success_evaluation
            )

            db.add(new_interview)
            
            candidate.is_interviewed = True
            candidate.is_valid = False
            candidate.interview_token = None

            db.commit()
            db.refresh(new_interview)

        except Exception as e:
            db.rollback()
            raise HTTPException(status_code=500, detail=f"Failed to store interview data: {str(e)}")

        # Return success response with interview details
        return {
            "status": "success", 
            "message": "Interview data stored successfully and interview marked as completed", 
            "interview_id": new_interview.interview_id,
            "success_evaluation": success_evaluation,
            "video_recording_url": new_interview.video_recording_url
        }

    except json.JSONDecodeError as e:
        raise HTTPException(status_code=400, detail=f"Invalid JSON: {str(e)}")
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"An error occurred while processing the request: {str(e)}")

def end_interview(db: Session, candidate_id: int):
    try:
        # Fetch the candidate
        candidate = db.query(Candidate).filter(Candidate.candidate_id == candidate_id).first()
        
        if not candidate:
            return None

        # Update candidate fields
        candidate.interview_token = None
        candidate.token_expiry = None
        candidate.is_interviewed = True
        candidate.is_valid = False

        # Commit changes to the database
        db.commit()
        
        return candidate
    except Exception as e:
        db.rollback()
        print(f"Error updating candidate: {e}")
        return None
