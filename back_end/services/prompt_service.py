from sqlalchemy.orm import Session
from models import Prompt
from schemas import PromptCreate, PromptUpdate

async def create_prompt(db: Session, prompt: PromptCreate):
    db_prompt = Prompt(**prompt.dict())
    db.add(db_prompt)
    db.commit()
    db.refresh(db_prompt)
    return db_prompt

async def get_prompts(db: Session):
    return db.query(Prompt).all()

async def get_prompt(db: Session, prompt_id: int):
    return db.query(Prompt).filter(Prompt.id == prompt_id).first()

async def update_prompt(db: Session, name: str, prompt: PromptUpdate):
    db_prompt = db.query(Prompt).filter(Prompt.name == name).first()
    if db_prompt:
        for key, value in prompt.dict(exclude_unset=True).items():
            setattr(db_prompt, key, value)
        db.commit()
        db.refresh(db_prompt)
    return db_prompt

async def delete_prompt(db: Session, name: str):
    db_prompt = db.query(Prompt).filter(Prompt.name == name).first()
    if db_prompt:
        db.delete(db_prompt)
        db.commit()
        return True
    return False

async def get_prompt_by_name(db: Session, name: str):
    return db.query(Prompt).filter(Prompt.name == name).first()
