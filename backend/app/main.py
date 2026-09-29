from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.db.database import Base, engine
from app.models.employee import Employee
from app.api.routes import (
    analytics,
    dashboard,
    employees,
    insigths
)


Base.metadata.create_all(bind=engine)


app = FastAPI(
    title="ACME Salary Management API",
    description=(
        "Employee salary management and "
        "compensation analytics platform"
    ),
    version="1.0.0"
)


app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"]
)


app.include_router(employees.router)
app.include_router(dashboard.router)
app.include_router(analytics.router)
app.include_router(insigths.router)

@app.get("/")
def root():
    return {
        "message": "ACME Salary Management API is running"
    }


@app.get("/health")
def health_check():
    return {
        "status": "healthy"
    }