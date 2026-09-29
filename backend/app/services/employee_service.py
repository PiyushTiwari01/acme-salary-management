import math

from sqlalchemy.orm import Session

from app.models.employee import Employee
from app.repositories.employee_repository import EmployeeRepository
from app.schemas.employee import EmployeeCreate, EmployeeUpdate


class EmployeeService:

    def __init__(self, db: Session):
        self.repository = EmployeeRepository(db)

    def get_employee(self, employee_id: int):

        employee = self.repository.get_by_id(
            employee_id
        )

        if not employee:
            raise ValueError(
                "Employee not found"
            )

        return employee

    def create_employee(
        self,
        data: EmployeeCreate
    ):

        existing_code = (
            self.repository.get_by_code(
                data.employee_code
            )
        )

        if existing_code:
            raise ValueError(
                "Employee code already exists"
            )

        existing_email = (
            self.repository.get_by_email(
                data.email
            )
        )

        if existing_email:
            raise ValueError(
                "Email already exists"
            )

        employee = Employee(
            **data.model_dump()
        )

        return self.repository.create(
            employee
        )

    def update_employee(
        self,
        employee_id: int,
        data: EmployeeUpdate
    ):

        employee = self.get_employee(
            employee_id
        )

        updates = data.model_dump(
            exclude_unset=True
        )

        for field, value in updates.items():
            setattr(
                employee,
                field,
                value
            )

        return self.repository.create(
            employee
        )

    def delete_employee(
        self,
        employee_id: int
    ):

        employee = self.get_employee(
            employee_id
        )

        self.repository.delete(
            employee
        )

        return True

    def search_employees(
        self,
        search: str | None,
        country: str | None,
        department: str | None,
        page: int,
        page_size: int
    ):

        employees, total = (
            self.repository.search(
                search=search,
                country=country,
                department=department,
                page=page,
                page_size=page_size
            )
        )

        total_pages = (
            math.ceil(
                total / page_size
            )
            if total
            else 0
        )

        return {
            "items": employees,
            "total": total,
            "page": page,
            "page_size": page_size,
            "total_pages": total_pages
        }