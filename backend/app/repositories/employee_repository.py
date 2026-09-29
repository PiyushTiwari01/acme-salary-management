from sqlalchemy import func, or_, select
from sqlalchemy.orm import Session

from app.models.employee import Employee


class EmployeeRepository:

    def __init__(self, db: Session):
        self.db = db

    def get_by_id(self, employee_id: int):
        return self.db.get(Employee, employee_id)

    def get_by_code(self, employee_code: str):
        statement = select(Employee).where(
            Employee.employee_code == employee_code
        )

        return self.db.scalar(statement)

    def get_by_email(self, email: str):
        statement = select(Employee).where(
            Employee.email == email
        )

        return self.db.scalar(statement)

    def create(self, employee: Employee):
        self.db.add(employee)
        self.db.commit()
        self.db.refresh(employee)

        return employee

    def delete(self, employee: Employee):
        self.db.delete(employee)
        self.db.commit()

    def search(
        self,
        search: str | None = None,
        country: str | None = None,
        department: str | None = None,
        page: int = 1,
        page_size: int = 20
    ):

        statement = select(Employee)

        if search:

            search_value = f"%{search}%"

            statement = statement.where(
                or_(
                    Employee.first_name.ilike(
                        search_value
                    ),
                    Employee.last_name.ilike(
                        search_value
                    ),
                    Employee.email.ilike(
                        search_value
                    ),
                    Employee.employee_code.ilike(
                        search_value
                    )
                )
            )

        if country:

            statement = statement.where(
                Employee.country == country
            )

        if department:

            statement = statement.where(
                Employee.department == department
            )

        count_statement = (
            select(func.count())
            .select_from(
                statement.subquery()
            )
        )

        total = self.db.scalar(
            count_statement
        ) or 0

        statement = statement.order_by(
            Employee.id
        )

        statement = statement.offset(
            (page - 1) * page_size
        ).limit(page_size)

        employees = list(
            self.db.scalars(statement).all()
        )

        return employees, total