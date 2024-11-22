from langchain_openai import ChatOpenAI
from langchain_core.prompts import PromptTemplate
from config import settings
from services import prompt_service
from sqlalchemy.orm import Session
import json
import re
import logging

logger = logging.getLogger(__name__)

async def generate_job_description(title: str, keywords: str, db: Session):
    try:
        # Fetch the prompt from the database
        job_prompt = await prompt_service.get_prompt_by_name(db, "JOB_DESCRIPTION_PROMPT")
        if not job_prompt:
            logger.error("Job description prompt not found in database")
            raise ValueError("Job description prompt not found in database")

        llm = ChatOpenAI(model="gpt-4-0125-preview", openai_api_key=settings.OPENAI_API_KEY)
        
        prompt_template = PromptTemplate(
            input_variables=["title", "keywords"],
            template=job_prompt.content
        )
        
        prompt = prompt_template.format(title=title, keywords=keywords)
        response = await llm.ainvoke(prompt)
        
        if isinstance(response.content, str):
            try:
                # Clean response by stripping whitespace and removing unnecessary characters
                cleaned_response = response.content.strip()
                cleaned_response = re.sub(r'```(json)?', '', cleaned_response)  # Remove ```json or ``` markers
                cleaned_response = cleaned_response.replace('"null"', 'null').replace('JSON', '').replace('json', '')
                logger.info("Original response content: %s", response.content)
                logger.info("Cleaned response: %s", cleaned_response)
                
                # Parse the cleaned response
                job_data = json.loads(cleaned_response)
                
                # Format the description
                overview = job_data['overview'].replace('\n', ' ').strip()
                responsibilities = ' '.join([f"• {resp.strip()}" for resp in job_data['key_responsibilities']])
                skills = ' '.join([f"• {skill.strip()}" for skill in job_data['required_skills']])
                
                description = f"{overview} Key Responsibilities: {responsibilities} Required Skills: {skills}"
                
                # Create the final job data structure
                final_job_data = {
                    "title": title,
                    "description": description.strip(),
                    "keywords": keywords,
                    "is_opened": True
                }
                
                return final_job_data
            except json.JSONDecodeError as e:
                logger.error("JSON decode error: %s", e)
                return {"error": f"Failed to parse job description: {str(e)}"}
            except Exception as e:
                logger.error("Error processing job description: %s", e)
                return {"error": f"Error processing job description: {str(e)}"}
        else:
            return {"error": "Unexpected response format from language model"}
    except Exception as e:
        logger.error("Error in generate_job_description: %s", e, exc_info=True)
        return {"error": f"Error generating job description: {str(e)}"}
