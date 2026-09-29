from fastapi import APIRouter, Depends
from sqlalchemy import func
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.models.employee import Employee


router = APIRouter(
    prefix="/analytics",
    tags=["Analytics"],
)


@router.get("/summary")
def get_salary_summary(
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

    countries_count = (
        db.query(func.count(func.distinct(Employee.country)))
        .scalar()
        or 0
    )

    departments_count = (
        db.query(func.count(func.distinct(Employee.department)))
        .scalar()
        or 0
    )

    currencies_count = (
        db.query(func.count(func.distinct(Employee.currency)))
        .scalar()
        or 0
    )

    return {
        "total_employees": total_employees,
        "average_salary": round(float(average_salary), 2),
        "countries_count": countries_count,
        "departments_count": departments_count,
        "currencies_count": currencies_count,
    }


@router.get("/by-country")
def salary_by_country(
    db: Session = Depends(get_db),
):
    rows = (
        db.query(
            Employee.country.label("country"),
            func.count(Employee.id).label("employee_count"),
            func.avg(Employee.annual_salary).label("average_salary"),
            func.min(Employee.annual_salary).label("minimum_salary"),
            func.max(Employee.annual_salary).label("maximum_salary"),
        )
        .group_by(Employee.country)
        .order_by(func.avg(Employee.annual_salary).desc())
        .all()
    )

    return [
        {
            "country": row.country,
            "employee_count": row.employee_count,
            "average_salary": round(float(row.average_salary), 2),
            "minimum_salary": round(float(row.minimum_salary), 2),
            "maximum_salary": round(float(row.maximum_salary), 2),
        }
        for row in rows
    ]


@router.get("/by-department")
def salary_by_department(
    db: Session = Depends(get_db),
):
    rows = (
        db.query(
            Employee.department.label("department"),
            func.count(Employee.id).label("employee_count"),
            func.avg(Employee.annual_salary).label("average_salary"),
            func.min(Employee.annual_salary).label("minimum_salary"),
            func.max(Employee.annual_salary).label("maximum_salary"),
        )
        .group_by(Employee.department)
        .order_by(func.avg(Employee.annual_salary).desc())
        .all()
    )

    return [
        {
            "department": row.department,
            "employee_count": row.employee_count,
            "average_salary": round(float(row.average_salary), 2),
            "minimum_salary": round(float(row.minimum_salary), 2),
            "maximum_salary": round(float(row.maximum_salary), 2),
        }
        for row in rows
    ]


@router.get("/by-currency")
def salary_by_currency(
    db: Session = Depends(get_db),
):
    rows = (
        db.query(
            Employee.currency.label("currency"),
            func.count(Employee.id).label("employee_count"),
            func.sum(Employee.annual_salary).label("total_payroll"),
            func.avg(Employee.annual_salary).label("average_salary"),
        )
        .group_by(Employee.currency)
        .order_by(Employee.currency)
        .all()
    )

    return [
        {
            "currency": row.currency,
            "employee_count": row.employee_count,
            "total_payroll": round(float(row.total_payroll), 2),
            "average_salary": round(float(row.average_salary), 2),
        }
        for row in rows
    ]