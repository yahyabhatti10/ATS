from fastapi import APIRouter, Depends, Query, HTTPException, status
from sqlalchemy.orm import Session
from database import get_db
from services import admin_service
from typing import Optional
from models import User
from fastapi.security import OAuth2PasswordRequestForm
from middleware import role_dependency
from schemas import AdminCreate, AdminUpdate, AdminResponse
from typing import List
from fastapi.responses import JSONResponse
from fastapi.encoders import jsonable_encoder


router = APIRouter()


# Admin Login
@router.post("/login-admin")
async def login(
    form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)
):
    return await admin_service.login(form_data, db)


# Admin Dashboard fetch all candidates
@router.get("/admin-dashboard")
async def admin_dashboard(
    current_user: User = Depends(role_dependency),
    db: Session = Depends(get_db),
):
    print(current_user)
    if current_user != "admin":
        raise HTTPException(status_code=403, detail="Access denied")

    dashboard_data = await admin_service.admin_dashboard(db)
    return JSONResponse(content=dashboard_data)


# Filters applying at Admin Dashboard
@router.get("/admin-dashboard/filters")
async def admin_dashboard_filters(
    current_user: User = Depends(role_dependency),
    db: Session = Depends(get_db),
    skill: Optional[str] = Query(None),
    interviewed: Optional[bool] = Query(None),
    non_interviewed_expired: Optional[bool] = Query(None),
    pending_interviews: Optional[bool] = Query(None),
):
    if current_user != "admin":
        raise HTTPException(status_code=403, detail="Access denied")

    return await admin_service.admin_dashboard_filters(
        current_user,
        db,
        skill,
        interviewed,
        non_interviewed_expired,
        pending_interviews,
    )


# Create Admin
@router.post(
    "/create-admin", response_model=AdminResponse, status_code=status.HTTP_201_CREATED
)
async def create_admin(
    admin_data: AdminCreate,
    current_user: User = Depends(role_dependency),
    db: Session = Depends(get_db),
):
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Access denied")
    return await admin_service.create_admin(admin_data, db)


# Delete Admin
@router.delete("/delete-admin/{admin_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_admin(
    admin_id: int,
    current_user: User = Depends(role_dependency),
    db: Session = Depends(get_db),
):
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Access denied")
    await admin_service.delete_admin(admin_id, db)


# Update Admin
@router.put("/update-admin/{admin_id}", response_model=AdminResponse)
async def update_admin(
    admin_id: int,
    admin_data: AdminUpdate,
    current_user: User = Depends(role_dependency),
    db: Session = Depends(get_db),
):
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Access denied")
    return await admin_service.update_admin(admin_id, admin_data, db)


# Get All Admins
@router.get("/all-admins")
async def get_all_admins(current_user: User = Depends(role_dependency), db: Session = Depends(get_db)):
    admins = await admin_service.get_all_admins(db)
    return JSONResponse(content=admins)
