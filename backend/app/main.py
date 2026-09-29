from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.db.database import SessionLocal
from app.models.employee import Employee
from app.db.seed import seed_database

from app.db.database import Base, engine
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

@app.on_event("startup")
def startup_seed():
    db = SessionLocal()

    try:
        employee_count = db.query(Employee).count()

        if employee_count == 0:
            print("Database is empty. Seeding employees...")
            seed_database()
            print("Employee seeding completed.")

        else:
            print(f"Database already contains {employee_count} employees.")

    except Exception as e:
        print(f"Database seed error: {e}")

    finally:
        db.close()

        
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