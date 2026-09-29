from app.schemas.employee import EmployeeCreate


def test_employee_salary_must_be_positive():

    try:
        EmployeeCreate(
            employee_code="TEST001",
            first_name="Test",
            last_name="User",
            email="test@example.com",
            country="India",
            department="Engineering",
            job_title="Software Engineer",
            currency="INR",
            annual_salary=-100
        )

        assert False

    except ValueError:
        assert True


def test_currency_is_normalized():

    employee = EmployeeCreate(
        employee_code="TEST001",
        first_name="Test",
        last_name="User",
        email="test@example.com",
        country="India",
        department="Engineering",
        job_title="Software Engineer",
        currency="inr",
        annual_salary=100000
    )

    assert employee.currency == "INR"


def test_invalid_currency():

    try:
        EmployeeCreate(
            employee_code="TEST001",
            first_name="Test",
            last_name="User",
            email="test@example.com",
            country="India",
            department="Engineering",
            job_title="Software Engineer",
            currency="XYZ",
            annual_salary=100000
        )

        assert False

    except ValueError:
        assert True