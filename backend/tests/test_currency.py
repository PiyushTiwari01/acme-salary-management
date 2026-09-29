from app.services.currency_service import CurrencyService


def test_inr_to_usd():

    result = CurrencyService.convert_to_reporting_currency(
        100000,
        "INR"
    )

    assert result == 1200.00


def test_usd_to_usd():

    result = CurrencyService.convert_to_reporting_currency(
        100000,
        "USD"
    )

    assert result == 100000.00


def test_currency_is_case_insensitive():

    result = CurrencyService.convert_to_reporting_currency(
        100000,
        "inr"
    )

    assert result == 1200.00