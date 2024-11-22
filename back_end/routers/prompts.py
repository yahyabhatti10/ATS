from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from database import get_db
from schemas import PromptCreate, PromptUpdate, PromptResponse
from services import prompt_service
from middleware import role_dependency

router = APIRouter()

@router.post("/prompts/", response_model=PromptResponse)
async def create_prompt(prompt: PromptCreate, db: Session = Depends(get_db), current_user: str = Depends(role_dependency)):
    if current_user != "admin":
        raise HTTPException(status_code=403, detail="Not authorized")
    return await prompt_service.create_prompt(db, prompt)

@router.get("/prompts/", response_model=List[PromptResponse])
async def read_prompts(db: Session = Depends(get_db), current_user: str = Depends(role_dependency)):
    if current_user != "admin":
        raise HTTPException(status_code=403, detail="Not authorized")
    return await prompt_service.get_prompts(db)

@router.get("/prompts/{name}", response_model=PromptResponse)
async def read_prompt(name: str, db: Session = Depends(get_db), current_user: str = Depends(role_dependency)):
    if current_user != "admin":
        raise HTTPException(status_code=403, detail="Not authorized")
    prompt = await prompt_service.get_prompt_by_name(db, name)
    if prompt is None:
        raise HTTPException(status_code=404, detail="Prompt not found")
    return prompt

@router.put("/prompts/{name}", response_model=PromptResponse)
async def update_prompt(name: str, prompt: PromptUpdate, db: Session = Depends(get_db), current_user: str = Depends(role_dependency)):
    if current_user != "admin":
        raise HTTPException(status_code=403, detail="Not authorized")
    updated_prompt = await prompt_service.update_prompt(db, name, prompt)
    if updated_prompt is None:
        raise HTTPException(status_code=404, detail="Prompt not found")
    return updated_prompt

@router.delete("/prompts/{name}")
async def delete_prompt(name: str, db: Session = Depends(get_db), current_user: str = Depends(role_dependency)):
    if current_user != "admin":
        raise HTTPException(status_code=403, detail="Not authorized")
    result = await prompt_service.delete_prompt(db, name)
    if result:
        return {"message": "Deleted successfully"}
    raise HTTPException(status_code=404, detail="Prompt not found")
