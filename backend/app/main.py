from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.db.database import Base, engine, SessionLocal
from app.db.seed import seed_database
from app.models.employee import Employee

from app.api.routes import (
    analytics,
    dashboard,
    employees,
    insigths,
)


# =========================================================
# DATABASE INITIALIZATION
# =========================================================

Base.metadata.create_all(bind=engine)


# =========================================================
# FASTAPI APP
# =========================================================

app = FastAPI(
    title="ACME Salary Management API",
    description=(
        "Employee salary management and "
        "compensation analytics platform"
    ),
    version="1.0.0",
)


# =========================================================
# CORS
# =========================================================

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# =========================================================
# AUTO SEED DATABASE
# =========================================================

@app.on_event("startup")
def startup_seed():
    """
    Automatically seed the database when it is empty.

    This is useful for the Render deployment because
    we don't need to manually open the Render Shell.
    """

    db = SessionLocal()

    try:
        employee_count = db.query(Employee).count()

        print(
            f"Current employee count in database: "
            f"{employee_count}"
        )

        if employee_count == 0:
            print(
                "Database is empty. "
                "Starting employee seed..."
            )

            seed_database()

            # Verify after seeding
            new_count = db.query(Employee).count()

            print(
                f"Employee seeding completed. "
                f"Total employees: {new_count}"
            )

        else:
            print(
                f"Database already contains "
                f"{employee_count} employees. "
                f"Skipping seed."
            )

    except Exception as e:
        print(
            f"Database seed error: {e}"
        )

    finally:
        db.close()


# =========================================================
# ROUTES
# =========================================================

app.include_router(employees.router)
app.include_router(dashboard.router)
app.include_router(analytics.router)
app.include_router(insigths.router)


# =========================================================
# ROOT
# =========================================================

@app.get("/")
def root():
    return {
        "message": "ACME Salary Management API is running"
    }


# =========================================================
# HEALTH CHECK
# =========================================================

@app.get("/health")
def health_check():
    return {
        "status": "healthy"
    }
