from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routers import resume, candidate, interview, jobs, application, admin, prompts
from config import settings
from middleware import role_dependency

app = FastAPI()

# add_middleware(role_dependency)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Define API version
API_VERSION = "v1"

# Include routers with versioning
app.include_router(resume.router, prefix=f"/api/{API_VERSION}/resume", tags=["resume"])
app.include_router(candidate.router, prefix=f"/api/{API_VERSION}", tags=["candidate"])
app.include_router(interview.router, prefix=f"/api/{API_VERSION}/interview", tags=["interview"])
app.include_router(jobs.router, prefix=f"/api/{API_VERSION}", tags=["jobs"])
app.include_router(
    application.router, prefix=f"/api/{API_VERSION}", tags=["application"]
)
app.include_router(admin.router, prefix=f"/api/{API_VERSION}", tags=["admin"])
app.include_router(prompts.router, prefix="/api", tags=["prompts"])


@app.get("/")
async def root():
    return {"message": "Welcome to the EDVENITY API"}


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host="127.0.0.1", port=8000)
