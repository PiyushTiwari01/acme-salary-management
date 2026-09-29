from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.core.config import settings
from app.models.employee import Employee


class AnalyticsService:

    def __init__(self, db: Session):
        self.db = db

    def _normalized_salary_expression(self):

        cases = []

        for currency, rate in settings.exchange_rates.items():

            cases.append(
                (
                    Employee.currency == currency,
                    Employee.annual_salary * rate
                )
            )

        return cases

    def get_summary(self):

        total_employees = self.db.scalar(
            select(func.count(Employee.id))
        ) or 0

        employees = self.db.scalars(
            select(Employee)
        ).all()

        total_payroll = 0.0

        for employee in employees:

            rate = settings.exchange_rates.get(
                employee.currency
            )

            if rate is None:
                continue

            total_payroll += (
                employee.annual_salary * rate
            )

        average_salary = (
            total_payroll / total_employees
            if total_employees
            else 0
        )

        total_countries = self.db.scalar(
            select(
                func.count(
                    func.distinct(Employee.country)
                )
            )
        ) or 0

        return {
            "total_employees": total_employees,

            "total_payroll": round(
                total_payroll,
                2
            ),

            "average_salary": round(
                average_salary,
                2
            ),

            "reporting_currency":
                settings.reporting_currency,

            "total_countries":
                total_countries
        }

    def get_country_summary(self):

        employees = self.db.scalars(
            select(Employee)
        ).all()

        country_data = {}

        for employee in employees:

            rate = settings.exchange_rates.get(
                employee.currency
            )

            if rate is None:
                continue

            normalized_salary = (
                employee.annual_salary * rate
            )

            if employee.country not in country_data:

                country_data[employee.country] = {
                    "employee_count": 0,
                    "total_payroll": 0.0
                }

            country_data[
                employee.country
            ]["employee_count"] += 1

            country_data[
                employee.country
            ]["total_payroll"] += normalized_salary

        result = []

        for country, data in country_data.items():

            average_salary = (
                data["total_payroll"]
                / data["employee_count"]
            )

            result.append({
                "country": country,

                "employee_count":
                    data["employee_count"],

                "average_salary": round(
                    average_salary,
                    2
                ),

                "total_payroll": round(
                    data["total_payroll"],
                    2
                ),

                "currency":
                    settings.reporting_currency
            })

        return sorted(
            result,
            key=lambda x: x["total_payroll"],
            reverse=True
        )

    def get_department_summary(self):

        employees = self.db.scalars(
            select(Employee)
        ).all()

        department_data = {}

        for employee in employees:

            rate = settings.exchange_rates.get(
                employee.currency
            )

            if rate is None:
                continue

            normalized_salary = (
                employee.annual_salary * rate
            )

            if employee.department not in department_data:

                department_data[
                    employee.department
                ] = {
                    "employee_count": 0,
                    "total_payroll": 0.0
                }

            department_data[
                employee.department
            ]["employee_count"] += 1

            department_data[
                employee.department
            ]["total_payroll"] += normalized_salary

        result = []

        for department, data in department_data.items():

            average_salary = (
                data["total_payroll"]
                / data["employee_count"]
            )

            result.append({
                "department": department,

                "employee_count":
                    data["employee_count"],

                "average_salary": round(
                    average_salary,
                    2
                ),

                "total_payroll": round(
                    data["total_payroll"],
                    2
                ),

                "currency":
                    settings.reporting_currency
            })

        return sorted(
            result,
            key=lambda x: x["total_payroll"],
            reverse=True
        )