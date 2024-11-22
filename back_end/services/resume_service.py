# print("Importing resume_service.py")
# print(f"__name__ is: {__name__}")

from fastapi import UploadFile, Depends
from sqlalchemy.orm import Session
from utils import pdf_utils, db_utils
from config import settings
import os
import json
from langchain_openai import ChatOpenAI
from langchain.prompts import PromptTemplate
from models import Candidate, Contact, Address, Skill, Project, Experience, Education
from database import get_db
# from backend.backup_prompts import RESUME_PARSING_PROMPT
from services import prompt_service
from langchain.chains.llm import LLMChain

async def upload_resume(file: UploadFile, db: Session):
    file_location = os.path.join(settings.UPLOAD_FOLDER, file.filename)
    try:
        os.makedirs(settings.UPLOAD_FOLDER, exist_ok=True)
        with open(file_location, "wb+") as file_object:
            file_object.write(await file.read())
        
        # Parse the uploaded resume
        parsed_data = await retrieve_resume(file.filename, db)
        
        # Submit the parsed data to create or update a candidate
        result = await submit_resume(parsed_data, db)
        
        return {
            "info": f"File '{file.filename}' uploaded successfully.",
            "candidate_id": result["candidate_id"],
            "message": result["info"]
        }
    except Exception as e:
        return {"error": f"There was an error processing the file: {str(e)}"}
    
    



async def retrieve_resume(filename: str, db: Session):
    file_location = os.path.join(settings.UPLOAD_FOLDER, filename)
    if not os.path.exists(file_location):
        return {"error": "File not found"}

    pdf_text = pdf_utils.extract_text_from_pdf(file_location)
    llm = ChatOpenAI(model="gpt-4-0125-preview", openai_api_key=settings.OPENAI_API_KEY)
    
    # Fetch the prompt from the database
    resume_parsing_prompt = await prompt_service.get_prompt_by_name(db, "RESUME_PARSING_PROMPT")
    if not resume_parsing_prompt:
        return {"error": "Resume parsing prompt not found in the database"}
    
    print(f"Retrieved prompt: {resume_parsing_prompt.content}")
    
    resume_prompt_template = PromptTemplate(
        input_variables=["text"],
        template=resume_parsing_prompt.content
    )
    
    final_prompt = resume_prompt_template.format(text=pdf_text)
    response = llm(final_prompt)
    
    # print(f"Type of response: {type(response)}")
    # print(f"Response: {response}")

    if isinstance(response.content, str):
        try:
            # Clean response by stripping whitespace and removing backticks or any unnecessary characters
            cleaned_response = response.content.strip().replace('"null"', 'null').replace('JSON', '').replace('json', '')
            
            # Remove any backticks if present in the LLM response
            cleaned_response = cleaned_response.replace('```', '').strip()
            
            print("Original response content:", response.content)
            print(f"Cleaned response: {cleaned_response}")
            
            # Ensure the cleaned response is not empty before attempting to parse
            if cleaned_response:
                parsed_data = json.loads(cleaned_response)
            else:
                print("Cleaned response is empty!")
                parsed_data = {}  # Default to empty dict in case of empty response
            
        except json.JSONDecodeError as e:
            print("JSON decoding error:", e)
            print(f"Problematic response: {cleaned_response}")
            parsed_data = {}  # Default to an empty dict in case of error
    else:
        parsed_data = response.content  # Assume it's already a dictionary
    
    print(f"Parsed data: {parsed_data}")
    return parsed_data



async def submit_resume(form_data: dict, db: Session):
    email = form_data.get("email")
    phone_number = form_data.get("phone_number")

    if email or phone_number:
        existing_candidate = db_utils.get_existing_candidate(db, email, phone_number)
        if existing_candidate:
            candidate_id = existing_candidate[0]
            db_utils.update_candidate(db, candidate_id, form_data)
            return {"info": f"Resume for email '{email}' updated successfully", "candidate_id": candidate_id}
        else:
            candidate_id = db_utils.insert_candidate(db, form_data)
            return {"info": f"New candidate inserted successfully", "candidate_id": candidate_id}
    else:
        candidate_id = db_utils.insert_candidate(db, form_data)
        return {"info": "New candidate inserted successfully", "candidate_id": candidate_id}


async def get_parsed_resume(db: Session, candidate_id: int) -> dict:
    candidate = db.query(Candidate).filter(Candidate.candidate_id == candidate_id).first()
    if not candidate:
        return None

    parsed_resume = {
        "name": candidate.name or None,
        "email": None,
        "phone_number": None,
        "skills": ", ".join([s.skill for s in candidate.skills]) if candidate.skills else None,
        "education": None,
        "projects": [],
        "experiences": []
    }

    # Handle contacts (email and phone)
    if candidate.contacts:
        parsed_resume["email"] = candidate.contacts[0].email_address
        parsed_resume["phone_number"] = candidate.contacts[0].phone_number

    # Handle education
    if candidate.educations:
        most_recent_education = candidate.educations[0]  # Assuming the most recent is first
        parsed_resume["education"] = {
            "degree": most_recent_education.degree,
            "institution": most_recent_education.institution,
            "start_date": most_recent_education.start_date,
            "end_date": most_recent_education.end_date
        }

    # Handle projects
    parsed_resume["projects"] = [
        {"name": p.name, "description": p.description}
        for p in candidate.projects
    ]

    # Handle experiences
    parsed_resume["experiences"] = [
        {
            "job_title": e.job_title,
            "company_name": e.company_name,
            "start_date": e.start_date,
            "end_date": e.end_date
        }
        for e in candidate.experiences
    ]

    return parsed_resume




