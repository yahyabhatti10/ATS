from sqlalchemy import text
from models import Candidate
import uuid
from datetime import datetime, timedelta

def sanitize_value(value):
    return None if value == "null" else value

def get_existing_candidate(db, email, phone_number):
    return db.execute(
        text("""SELECT candidate_id FROM contact WHERE email_address = :email OR phone_number = :phone_number"""),
        {"email": email, "phone_number": phone_number}
    ).fetchone()

def update_candidate(db, candidate_id, form_data):
    candidate = db.query(Candidate).filter(Candidate.candidate_id == candidate_id).first()
    if candidate.name != form_data.get("name"):
        candidate.name = sanitize_value(form_data.get("name"))

    if candidate.contacts:
        contact = candidate.contacts[0]
        contact.email_address = sanitize_value(form_data.get("email"))
        contact.phone_number = sanitize_value(form_data.get("phone_number"))
    else:
        db.execute(
            text("INSERT INTO contact (candidate_id, email_address, phone_number) VALUES (:candidate_id, :email, :phone)"),
            {
                "candidate_id": candidate_id,
                "email": sanitize_value(form_data.get("email")),
                "phone": sanitize_value(form_data.get("phone_number"))
            }
        )

    update_skills(db, candidate_id, form_data.get("skills", ""))
    update_experiences(db, candidate_id, form_data.get("experiences", []))
    update_projects(db, candidate_id, form_data.get("projects", []))
    update_education(db, candidate_id, form_data.get("education", {}))

    db.commit()

def insert_candidate(db, form_data):
    new_candidate = Candidate(name=sanitize_value(form_data.get("name")))
    db.add(new_candidate)
    db.flush()

    db.execute(
        text("INSERT INTO contact (candidate_id, email_address, phone_number) VALUES (:candidate_id, :email, :phone)"),
        {
            "candidate_id": new_candidate.candidate_id,
            "email": sanitize_value(form_data.get("email")),
            "phone": sanitize_value(form_data.get("phone_number"))
        }
    )

    update_skills(db, new_candidate.candidate_id, form_data.get("skills", ""))
    update_experiences(db, new_candidate.candidate_id, form_data.get("experiences", []))
    update_projects(db, new_candidate.candidate_id, form_data.get("projects", []))
    update_education(db, new_candidate.candidate_id, form_data.get("education", {}))

    db.commit()
    return new_candidate.candidate_id

def update_skills(db, candidate_id, skills):
    db.execute(
        text("DELETE FROM skills WHERE candidate_id = :candidate_id"),
        {"candidate_id": candidate_id}
    )
    skills_list = skills.split(",") if skills != "null" else []
    for skill in skills_list:
        db.execute(
            text("INSERT INTO skills (candidate_id, skill) VALUES (:candidate_id, :skill)"),
            {
                "candidate_id": candidate_id,
                "skill": skill.strip() if skill.strip() else None
            }
        )

def update_experiences(db, candidate_id, experiences):
    if isinstance(experiences, list):
        db.execute(
            text("DELETE FROM experiences WHERE candidate_id = :candidate_id"),
            {"candidate_id": candidate_id}
        )
        for exp in experiences:
            db.execute(
                text("INSERT INTO experiences (candidate_id, job_title, company_name, start_date, end_date) "
                     "VALUES (:candidate_id, :job_title, :company_name, :start_date, :end_date)"),
                {
                    "candidate_id": candidate_id,
                    "job_title": sanitize_value(exp.get("job_title")),
                    "company_name": sanitize_value(exp.get("company_name")),
                    "start_date": sanitize_value(exp.get("start_date")),
                    "end_date": sanitize_value(exp.get("end_date"))
                }
            )

def update_projects(db, candidate_id, projects):
    if isinstance(projects, list):
        db.execute(
            text("DELETE FROM projects WHERE candidate_id = :candidate_id"),
            {"candidate_id": candidate_id}
        )
        for project in projects:
            db.execute(
                text("INSERT INTO projects (candidate_id, name, description) VALUES (:candidate_id, :name, :description)"),
                {
                    "candidate_id": candidate_id,
                    "name": sanitize_value(project.get("name")),
                    "description": sanitize_value(project.get("description"))
                }
            )

def update_education(db, candidate_id, education):
    if isinstance(education, dict):
        db.execute(
            text("DELETE FROM education WHERE candidate_id = :candidate_id"),
            {"candidate_id": candidate_id}
        )
        db.execute(
            text("INSERT INTO education (candidate_id, degree, institution, start_date, end_date) "
                 "VALUES (:candidate_id, :degree, :institution, :start_date, :end_date)"),
            {
                "candidate_id": candidate_id,
                "degree": sanitize_value(education.get("degree")),
                "institution": sanitize_value(education.get("institution")),
                "start_date": sanitize_value(education.get("start_date")),
                "end_date": sanitize_value(education.get("end_date"))
            }
        )

def get_candidate_details(db, candidate_id):
    candidate = db.query(Candidate).filter(Candidate.candidate_id == candidate_id).first()
    if candidate and candidate.contacts:
        return candidate.contacts[0].email_address, candidate.name
    return None, None

def generate_candidate_link(db, candidate_id):
    token = str(uuid.uuid4())
    expiration_time_utc = datetime.utcnow() + timedelta(minutes=30)

    candidate = db.query(Candidate).filter(Candidate.candidate_id == candidate_id).first()
    if candidate:
        candidate.interview_token = token
        candidate.token_expiry = expiration_time_utc
        candidate.is_valid = True
        candidate.is_interviewed = False
        db.commit()

    return token, expiration_time_utc