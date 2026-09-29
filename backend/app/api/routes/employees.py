from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import or_
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.models.employee import Employee
from app.schemas.employee import (
    EmployeeCreate,
    EmployeeResponse,
    EmployeeUpdate,
    EmployeeListResponse,
)

router = APIRouter(
    prefix="/api/employees",
    tags=["Employees"],
)


@router.get("", response_model=EmployeeListResponse)
def get_employees(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    search: str | None = None,
    country: str | None = None,
    department: str | None = None,
    db: Session = Depends(get_db),
):
    query = db.query(Employee)

    # Search across important employee fields
    if search:
        search_value = f"%{search}%"

        query = query.filter(
            or_(
                Employee.employee_code.ilike(search_value),
                Employee.first_name.ilike(search_value),
                Employee.last_name.ilike(search_value),
                Employee.email.ilike(search_value),
                Employee.job_title.ilike(search_value),
            )
        )

    # Country filter
    if country:
        query = query.filter(Employee.country == country)

    # Department filter
    if department:
        query = query.filter(Employee.department == department)

    total = query.count()

    total_pages = max(
        (total + page_size - 1) // page_size,
        1,
    )

    employees = (
        query
        .order_by(Employee.id)
        .offset((page - 1) * page_size)
        .limit(page_size)
        .all()
    )

    return {
        "items": employees,
        "total": total,
        "page": page,
        "page_size": page_size,
        "total_pages": total_pages,
    }


@router.get(
    "/filters/options"
)
def get_filter_options(
    db: Session = Depends(get_db),
):
    countries = [
        row[0]
        for row in (
            db.query(Employee.country)
            .distinct()
            .order_by(Employee.country)
            .all()
        )
    ]

    departments = [
        row[0]
        for row in (
            db.query(Employee.department)
            .distinct()
            .order_by(Employee.department)
            .all()
        )
    ]

    return {
        "countries": countries,
        "departments": departments,
    }


@router.get(
    "/{employee_id}",
    response_model=EmployeeResponse,
)
def get_employee(
    employee_id: int,
    db: Session = Depends(get_db),
):
    employee = (
        db.query(Employee)
        .filter(Employee.id == employee_id)
        .first()
    )

    if not employee:
        raise HTTPException(
            status_code=404,
            detail="Employee not found",
        )

    return employee


@router.post(
    "",
    response_model=EmployeeResponse,
    status_code=201,
)
def create_employee(
    employee_data: EmployeeCreate,
    db: Session = Depends(get_db),
):
    # Check employee code
    existing_code = (
        db.query(Employee)
        .filter(
            Employee.employee_code
            == employee_data.employee_code
        )
        .first()
    )

    if existing_code:
        raise HTTPException(
            status_code=409,
            detail="Employee code already exists",
        )

    # Check email
    existing_email = (
        db.query(Employee)
        .filter(
            Employee.email
            == employee_data.email
        )
        .first()
    )

    if existing_email:
        raise HTTPException(
            status_code=409,
            detail="Email already exists",
        )

    employee = Employee(
        **employee_data.model_dump()
    )

    db.add(employee)
    db.commit()
    db.refresh(employee)

    return employee


@router.put(
    "/{employee_id}",
    response_model=EmployeeResponse,
)
def update_employee(
    employee_id: int,
    employee_data: EmployeeUpdate,
    db: Session = Depends(get_db),
):
    employee = (
        db.query(Employee)
        .filter(Employee.id == employee_id)
        .first()
    )

    if not employee:
        raise HTTPException(
            status_code=404,
            detail="Employee not found",
        )

    update_data = employee_data.model_dump(
        exclude_unset=True
    )

    # Check email uniqueness
    if "email" in update_data:
        existing_email = (
            db.query(Employee)
            .filter(
                Employee.email
                == update_data["email"],
                Employee.id != employee_id,
            )
            .first()
        )

        if existing_email:
            raise HTTPException(
                status_code=409,
                detail="Email already exists",
            )

    # Apply changes
    for field, value in update_data.items():
        setattr(employee, field, value)

    db.commit()
    db.refresh(employee)

    return employee


@router.delete(
    "/{employee_id}"
)
def delete_employee(
    employee_id: int,
    db: Session = Depends(get_db),
):
    employee = (
        db.query(Employee)
        .filter(Employee.id == employee_id)
        .first()
    )

    if not employee:
        raise HTTPException(
            status_code=404,
            detail="Employee not found",
        )

    db.delete(employee)
    db.commit()

    return {
        "message": "Employee deleted successfully",
        "employee_id": employee_id,
    }