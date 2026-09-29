from app.core.config import settings


class CurrencyService:

    @staticmethod
    def convert_to_reporting_currency(
        amount: float,
        currency: str
    ) -> float:

        currency = currency.upper()

        rate = settings.exchange_rates.get(currency)

        if rate is None:
            raise ValueError(
                f"Unsupported currency: {currency}"
            )

        return round(
            amount * rate,
            2
        )