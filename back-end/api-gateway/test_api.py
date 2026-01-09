import io
from fastapi.testclient import TestClient
from unittest.mock import patch

from main import app  # adjust if your file is named differently

client = TestClient(app)


def mock_requests_post(*args, **kwargs):
    """
    Mocks requests.post used inside the endpoint.
    First call returns a weather filename,
    second call returns final result.
    """

    class MockResponse:
        def __init__(self, json_data):
            self._json = json_data
            self.status_code = 200

        def raise_for_status(self):
            pass

        def json(self):
            return self._json

    # Detect first vs second call by payload
    if kwargs.get("data", {}).get("flow") == "python":
        return MockResponse({"filename": "weather.csv"})
    else:
        return MockResponse({"result": "ok"})


@patch("requests.post", side_effect=mock_requests_post)
def test_get_data_success(mock_post):
    file_content = b"timestamp,value\n0,10\n1,20"

    response = client.post(
        "/getData",
        data={
            "latitude": 52.0,
            "longitude": 5.0,
            "year": 2024,
            "maxPower": 1000,
        },
        files={
            "profileDemand": ("demand.csv", file_content, "text/csv"),
        },
    )

    assert response.status_code == 200
    assert response.json() == {"result": "ok"}
    assert mock_post.call_count == 2
