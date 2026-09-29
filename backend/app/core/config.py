from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    app_name: str = "ACME Salary Management API"
    database_url: str = "sqlite:///./salary_management.db"
    reporting_currency: str = "USD"

    exchange_rates: dict[str, float] = {
        "USD": 1.0,
        "INR": 0.012,
        "GBP": 1.27,
        "EUR": 1.09,
        "CAD": 0.70,
        "AUD": 0.65,
        "SGD": 0.74,
        "AED": 0.272
    }

    class Config:
        env_file = ".env"


settings = Settings()