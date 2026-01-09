import io
import json
from unittest.mock import patch, MagicMock
from fastapi.testclient import TestClient

from main import app  # adjust if your file is named differently

client = TestClient(app)

# Mock response for requests.get
class MockResponse:
    def __init__(self, content=b"weather,data", status_code=200):
        self.content = content
        self.status_code = status_code

@patch("requests.get", return_value=MockResponse())
@patch("subprocess.run")
def test_run_matlab(mock_run, mock_get):
    # Mock subprocess result
    mock_run.return_value = MagicMock(
        returncode=0,
        stdout=json.dumps({"energy": 1234}),
        stderr=""
    )

    # Create a fake CSV file
    demand_file_content = b"time,power\n0,10\n1,20"
    files = {"demandProfile": ("demand.csv", demand_file_content, "text/csv")}

    data = {
        "azimuth": 10,
        "slope": 20,
        "weatherData": "weather.csv",
        "year": 2024
    }

    response = client.post("/runMatlab", data=data, files=files)

    # Check status code
    assert response.status_code == 200

    # Check returned JSON
    assert response.json() == {"output": {"energy": 1234}}

    # Check that requests.get was called correctly
    mock_get.assert_called_once_with(
        "http://savedata:8505/getFile",
        params={"filename": "weather.csv", "year": 2024}
    )

    # Check that subprocess.run was called with correct arguments
    args = mock_run.call_args[0][0]
    assert args[0] == "octave"
    assert "calculation.m" in args
