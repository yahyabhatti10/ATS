from sqlalchemy import (
    Column,
    Integer,
    String,
    ForeignKey,
    Text,
    DateTime,
    Boolean,
    TIMESTAMP,
    Enum,
    Float,
    func
)
from sqlalchemy.orm import relationship
from datetime import datetime
import enum
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.sql import func

Base = declarative_base()


class Candidate(Base):
    __tablename__ = "candidate"
    candidate_id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False)
    interview_token = Column(
        String(255), nullable=True
    )  # Nullable to allow for empty values
    token_expiry = Column(DateTime, nullable=True)
    is_interviewed = Column(Boolean, default=False)  # New column
    is_valid = Column(Boolean, default=True)
    contacts = relationship("Contact", back_populates="candidate")
    addresses = relationship("Address", back_populates="candidate")
    skills = relationship("Skill", back_populates="candidate")
    projects = relationship("Project", back_populates="candidate")
    experiences = relationship("Experience", back_populates="candidate")
    educations = relationship("Education", back_populates="candidate")
    interviews = relationship("Interview", back_populates="candidate")

    job_applications = relationship("JobApplication", back_populates="candidate")


class Interview(Base):
    __tablename__ = "interviews"
    interview_id = Column(Integer, primary_key=True, index=True)
    candidate_id = Column(Integer, ForeignKey("candidate.candidate_id"))
    start_time = Column(DateTime)
    end_time = Column(DateTime)
    duration = Column(Integer)  # Duration in seconds
    transcript = Column(Text)
    summary = Column(Text)
    recording_url = Column(Text)
    video_recording_url = Column(Text)
    created_at = Column(DateTime, default=datetime.utcnow)
    success_evaluation = Column(Integer)
    candidate = relationship("Candidate", back_populates="interviews")


class Contact(Base):
    __tablename__ = "contact"
    contact_id = Column(Integer, primary_key=True, index=True)
    candidate_id = Column(Integer, ForeignKey("candidate.candidate_id"))
    email_address = Column(String(255))
    phone_number = Column(String(50))
    candidate = relationship("Candidate", back_populates="contacts")


class Address(Base):
    __tablename__ = "address"
    address_id = Column(Integer, primary_key=True, index=True)
    candidate_id = Column(Integer, ForeignKey("candidate.candidate_id"))
    address_line_1 = Column(Text)
    address_line_2 = Column(Text)
    area = Column(String(255))
    province = Column(String(255))
    country = Column(String(255))
    postal_code = Column(Integer)
    candidate = relationship("Candidate", back_populates="addresses")


class Skill(Base):
    __tablename__ = "skills"
    skill_id = Column(Integer, primary_key=True, index=True)
    candidate_id = Column(Integer, ForeignKey("candidate.candidate_id"))
    skill = Column(String(255))
    candidate = relationship("Candidate", back_populates="skills")


class Project(Base):
    __tablename__ = "projects"
    project_id = Column(Integer, primary_key=True, index=True)
    candidate_id = Column(Integer, ForeignKey("candidate.candidate_id"))
    name = Column(String(255))
    description = Column(Text)
    candidate = relationship("Candidate", back_populates="projects")


class Experience(Base):
    __tablename__ = "experiences"
    experience_id = Column(Integer, primary_key=True, index=True)
    candidate_id = Column(Integer, ForeignKey("candidate.candidate_id"))
    job_title = Column(String(255))
    company_name = Column(String(255))
    start_date = Column(String(50))
    end_date = Column(String(50))
    candidate = relationship("Candidate", back_populates="experiences")


class Education(Base):
    __tablename__ = "education"
    education_id = Column(Integer, primary_key=True, index=True)
    candidate_id = Column(Integer, ForeignKey("candidate.candidate_id"))
    degree = Column(String(255))
    institution = Column(String(255))
    start_date = Column(String(50))
    end_date = Column(String(50))
    candidate = relationship("Candidate", back_populates="educations")


class JobListing(Base):
    __tablename__ = "job_listing"
    job_id = Column(Integer, primary_key=True, index=True)
    title = Column(String(255))
    description = Column(Text)
    location = Column(String(255))
    salary = Column(String(50))
    date_posted = Column(DateTime)
    is_opened = Column(Boolean, default=True)


class JobApplication(Base):
    __tablename__ = "job_application"
    application_id = Column(Integer, primary_key=True, index=True)
    job_id = Column(Integer, ForeignKey("job_listing.job_id"))
    candidate_id = Column(Integer, ForeignKey("candidate.candidate_id"))
    date_applied = Column(DateTime)
    status = Column(String(50))
    match_score = Column(Float)  # Add this line
    candidate = relationship("Candidate", back_populates="job_applications")
    job_listing = relationship("JobListing")


class UserRole(enum.Enum):
    user = "user"
    admin = "admin"


class User(Base):
    __tablename__ = "user"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String(50), unique=True, index=True)
    hashed_password = Column(String(255))

    # Restrict role to "user" or "admin" using Enum
    role = Column(Enum(UserRole), default=UserRole.user, nullable=False)

    # Add boolean field to handle soft-deletes
    is_deleted = Column(Boolean, default=False)

    created_at = Column(TIMESTAMP, default=datetime.utcnow)
    updated_at = Column(TIMESTAMP, default=datetime.utcnow, onupdate=datetime.utcnow)


class Prompt(Base):
    __tablename__ = "prompts"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), unique=True, index=True)
    content = Column(Text, nullable=False)
    required_elements = Column(Text)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
