from fastapi import APIRouter, Depends
from sqlalchemy import func
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.models.employee import Employee


router = APIRouter(
    prefix="/api/dashboard",
    tags=["Dashboard"],
)


@router.get("/summary")
def dashboard_summary(
    db: Session = Depends(get_db),
):
    total_employees = (
        db.query(func.count(Employee.id))
        .scalar()
        or 0
    )

    average_salary = (
        db.query(func.avg(Employee.annual_salary))
        .scalar()
        or 0
    )

    country_count = (
        db.query(func.count(func.distinct(Employee.country)))
        .scalar()
        or 0
    )

    department_count = (
        db.query(func.count(func.distinct(Employee.department)))
        .scalar()
        or 0
    )

    return {
        "total_employees": total_employees,
        "average_salary": round(float(average_salary), 2),
        "country_count": country_count,
        "department_count": department_count,
    }