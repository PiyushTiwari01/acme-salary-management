import random

from faker import Faker
from sqlalchemy import delete

from app.db.database import Base, SessionLocal, engine
from app.models.employee import Employee


fake = Faker()
random.seed(42)
Faker.seed(42)


COUNTRIES = [
    ("India", "INR"),
    ("USA", "USD"),
    ("UK", "GBP"),
    ("Germany", "EUR"),
    ("Canada", "CAD"),
    ("Australia", "AUD"),
    ("Singapore", "SGD"),
    ("UAE", "AED")
]


DEPARTMENTS = [
    "Engineering",
    "Sales",
    "Finance",
    "HR",
    "Marketing",
    "Operations",
    "Product",
    "Customer Success"
]


JOB_TITLES = [
    "Software Engineer",
    "Senior Software Engineer",
    "Product Manager",
    "HR Manager",
    "Financial Analyst",
    "Sales Executive",
    "Marketing Specialist",
    "Operations Manager",
    "Customer Success Manager"
]


def generate_salary(currency: str) -> float:

    salary_ranges = {
        "INR": (600000, 4500000),
        "USD": (50000, 250000),
        "GBP": (35000, 180000),
        "EUR": (40000, 190000),
        "CAD": (50000, 200000),
        "AUD": (55000, 210000),
        "SGD": (50000, 220000),
        "AED": (120000, 700000)
    }

    minimum, maximum = salary_ranges[currency]

    return round(
        random.uniform(minimum, maximum),
        2
    )


def seed_database():

    Base.metadata.create_all(bind=engine)

    db = SessionLocal()

    try:
        db.execute(delete(Employee))
        db.commit()

        employees = []

        for index in range(1, 10001):

            country, currency = random.choice(
                COUNTRIES
            )

            first_name = fake.first_name()
            last_name = fake.last_name()

            employee = Employee(
                employee_code=f"EMP{index:05d}",
                first_name=first_name,
                last_name=last_name,
                email=(
                    f"{first_name.lower()}."
                    f"{last_name.lower()}."
                    f"{index}@acme.com"
                ),
                country=country,
                department=random.choice(
                    DEPARTMENTS
                ),
                job_title=random.choice(
                    JOB_TITLES
                ),
                currency=currency,
                annual_salary=generate_salary(
                    currency
                )
            )

            employees.append(employee)

        db.bulk_save_objects(employees)
        db.commit()

        print(
            "Successfully seeded 10,000 employees."
        )

    finally:
        db.close()


if __name__ == "__main__":
    seed_database()