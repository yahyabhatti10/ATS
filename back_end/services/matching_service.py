import re
import traceback
from schemas import MatchingResult
from services import resume_service, job_service, prompt_service
from langchain_openai import ChatOpenAI
from config import settings
import json
from sqlalchemy.orm import Session

# Initialize the LLM
llm = ChatOpenAI(model="gpt-4-0125-preview", openai_api_key=settings.OPENAI_API_KEY)

async def evaluate_match(db: Session, job_id: int, candidate_id: int) -> MatchingResult:
    try:
        job_details = await job_service.get_job_details(db, job_id)
        parsed_resume = await resume_service.get_parsed_resume(db, candidate_id)

        if job_details is None:
            return MatchingResult(
                match_score=0,
                explanation=f"Job with id {job_id} not found."
            )
        
        if parsed_resume is None:
            return MatchingResult(
                match_score=0,
                explanation=f"Resume for candidate with id {candidate_id} not found."
            )

        print(f"Job details: {json.dumps(job_details, indent=2)}")
        print(f"Parsed resume: {json.dumps(parsed_resume, indent=2)}")

        # Fetch the prompt from the database
        matching_prompt = await prompt_service.get_prompt_by_name(db, "MATCHING_EVALUATION_PROMPT")
        if not matching_prompt:
            raise ValueError("Matching evaluation prompt not found in the database")

        # Use a safer string formatting method
        prompt = matching_prompt.content.replace(
            "{job_details}", json.dumps(job_details, indent=2)
        ).replace(
            "{parsed_resume}", json.dumps(parsed_resume, indent=2)
        )

        print(f"Sending prompt to LLM: {prompt}")
        response = await llm.ainvoke(prompt)
        print(f"LLM Response: {response.content}")  # Debug print
        
        if not response.content.strip():
            return MatchingResult(
                match_score=0,
                explanation="Error: Empty response from LLM."
            )

        # Remove Markdown code block syntax if present
        json_content = re.sub(r'```json\n|\n```', '', response.content).strip()

        result = json.loads(json_content)
        
        # Ensure the match_score is between 0 and 10
        match_score = min(max(float(result["match_score"]), 0), 10)
        
        return MatchingResult(
            match_score=match_score,
            explanation=result["explanation"]
        )
    except json.JSONDecodeError as e:
        error_msg = f"Error parsing LLM response: {str(e)}\nResponse content: {response.content}"
        print(error_msg)
        return MatchingResult(match_score=0, explanation=error_msg)
    except Exception as e:
        error_msg = f"Error during matching process: {str(e)}\n{traceback.format_exc()}"
        print(error_msg)
        return MatchingResult(match_score=0, explanation=error_msg)
