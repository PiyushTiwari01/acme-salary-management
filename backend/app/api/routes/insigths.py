import re

from fastapi import APIRouter, Depends
from sqlalchemy import func
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.models.employee import Employee


router = APIRouter(
    prefix="/api/insights",
    tags=["HR Insights"],
)


@router.post("/ask")
def ask_hr_question(
    question: str,
    db: Session = Depends(get_db),
):
    q = question.lower().strip()

    total_employees = (
        db.query(func.count(Employee.id))
        .scalar()
        or 0
    )

    if "how many employees" in q or "number of employees" in q:
        return {
            "question": question,
            "answer": f"ACME currently has {total_employees:,} employees.",
            "type": "employee_count",
        }

    if "average salary" in q and "india" in q:
        result = (
            db.query(func.avg(Employee.annual_salary))
            .filter(Employee.country == "India")
            .scalar()
        )

        return {
            "question": question,
            "answer": (
                f"The average salary in India is "
                f"{float(result):,.2f} INR."
                if result
                else "No salary data found for India."
            ),
            "type": "average_salary",
        }

    if "average salary" in q:
        result = (
            db.query(func.avg(Employee.annual_salary))
            .scalar()
            or 0
        )

        return {
            "question": question,
            "answer": (
                f"The average annual salary is "
                f"{float(result):,.2f} "
                f"across the available salary records. "
                f"Because employees are paid in multiple currencies, "
                f"this figure should not be interpreted as a single "
                f"converted global payroll value."
            ),
            "type": "average_salary",
        }

    department_match = re.search(
        r"in\s+([a-zA-Z &]+)",
        q,
    )

    if "employees" in q and department_match:
        department = department_match.group(1).strip()

        result = (
            db.query(func.count(Employee.id))
            .filter(
                func.lower(Employee.department)
                == department.lower()
            )
            .scalar()
            or 0
        )

        return {
            "question": question,
            "answer": (
                f"{department.title()} has "
                f"{result:,} employees."
            ),
            "type": "department_count",
        }

    return {
        "question": question,
        "answer": (
            "I can answer questions about employee count, "
            "average salary, country-level salary data, "
            "and department-level salary data."
        ),
        "type": "unsupported",
    }