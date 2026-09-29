from datetime import datetime

from pydantic import (
    BaseModel,
    ConfigDict,
    EmailStr,
    Field,
    field_validator,
)


SUPPORTED_CURRENCIES = {
    "USD",
    "INR",
    "GBP",
    "EUR",
    "CAD",
    "AUD",
    "SGD",
    "AED",
}


class EmployeeBase(BaseModel):
    employee_code: str = Field(
        min_length=3,
        max_length=20
    )

    first_name: str = Field(
        min_length=1,
        max_length=100
    )

    last_name: str = Field(
        min_length=1,
        max_length=100
    )

    email: EmailStr

    country: str = Field(
        min_length=2,
        max_length=100
    )

    department: str = Field(
        min_length=2,
        max_length=100
    )

    job_title: str = Field(
        min_length=2,
        max_length=150
    )

    currency: str = Field(
        min_length=3,
        max_length=3
    )

    annual_salary: float = Field(
        gt=0,
        le=100_000_000
    )

    @field_validator(
        "employee_code",
        "first_name",
        "last_name",
        "country",
        "department",
        "job_title"
    )
    @classmethod
    def validate_text_fields(cls, value: str) -> str:

        value = value.strip()

        if not value:
            raise ValueError(
                "Value cannot be empty"
            )

        return value

    @field_validator("currency")
    @classmethod
    def validate_currency(cls, value: str) -> str:

        value = value.strip().upper()

        if value not in SUPPORTED_CURRENCIES:
            raise ValueError(
                f"Unsupported currency: {value}. "
                f"Supported currencies: "
                f"{', '.join(sorted(SUPPORTED_CURRENCIES))}"
            )

        return value

    @field_validator("annual_salary")
    @classmethod
    def validate_salary(cls, value: float) -> float:

        if value <= 0:
            raise ValueError(
                "Annual salary must be greater than 0"
            )

        return round(value, 2)


class EmployeeCreate(EmployeeBase):
    pass


class EmployeeUpdate(BaseModel):

    first_name: str | None = Field(
        default=None,
        min_length=1,
        max_length=100
    )

    last_name: str | None = Field(
        default=None,
        min_length=1,
        max_length=100
    )

    email: EmailStr | None = None

    country: str | None = Field(
        default=None,
        min_length=2,
        max_length=100
    )

    department: str | None = Field(
        default=None,
        min_length=2,
        max_length=100
    )

    job_title: str | None = Field(
        default=None,
        min_length=2,
        max_length=150
    )

    currency: str | None = Field(
        default=None,
        min_length=3,
        max_length=3
    )

    annual_salary: float | None = Field(
        default=None,
        gt=0,
        le=100_000_000
    )

    @field_validator(
        "first_name",
        "last_name",
        "country",
        "department",
        "job_title"
    )
    @classmethod
    def validate_optional_text(
        cls,
        value: str | None
    ) -> str | None:

        if value is None:
            return None

        value = value.strip()

        if not value:
            raise ValueError(
                "Value cannot be empty"
            )

        return value

    @field_validator("currency")
    @classmethod
    def validate_optional_currency(
        cls,
        value: str | None
    ) -> str | None:

        if value is None:
            return None

        value = value.strip().upper()

        if value not in SUPPORTED_CURRENCIES:
            raise ValueError(
                f"Unsupported currency: {value}. "
                f"Supported currencies: "
                f"{', '.join(sorted(SUPPORTED_CURRENCIES))}"
            )

        return value

    @field_validator("annual_salary")
    @classmethod
    def validate_optional_salary(
        cls,
        value: float | None
    ) -> float | None:

        if value is None:
            return None

        if value <= 0:
            raise ValueError(
                "Annual salary must be greater than 0"
            )

        return round(value, 2)


class EmployeeResponse(EmployeeBase):

    id: int

    created_at: datetime

    updated_at: datetime

    model_config = ConfigDict(
        from_attributes=True
    )


class EmployeeListResponse(BaseModel):

    items: list[EmployeeResponse]

    total: int

    page: int

    page_size: int

    total_pages: int