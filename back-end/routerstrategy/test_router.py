import pytest
from unittest.mock import patch, AsyncMock
from fastapi.testclient import TestClient
from main import app  # main.py is the module

client = TestClient(app)

# ------------------------
# Test valid flow with MatlabStrategy
# ------------------------
@patch("strategies.MatlabStrategy.execute", new_callable=AsyncMock)
def test_run_flow_matlab(mock_execute):
    mock_execute.return_value = {"result": "matlab success"}

    data = {
        "flow": "matlab",
        "azimuth": 10,
        "slope": 20,
        "latitude": 52.0,
        "longitude": 5.0,
        "year": 2024,
        "weatherFile": "weather.csv"
    }

    response = client.post("/run", data=data)

    assert response.status_code == 200
    assert response.json() == {"result": "matlab success"}
    mock_execute.assert_awaited_once()

# ------------------------
# Test valid flow with PythonStrategy
# ------------------------
@patch("strategies.PythonStrategy.execute", new_callable=AsyncMock)
def test_run_flow_python(mock_execute):
    mock_execute.return_value = {"result": "python success"}

    data = {
        "flow": "python",
        "azimuth": 15,
        "slope": 30,
        "latitude": 50.0,
        "longitude": 6.0,
        "year": 2025,
        "weatherFile": "weather.csv"
    }

    response = client.post("/run", data=data)

    assert response.status_code == 200
    assert response.json() == {"result": "python success"}
    mock_execute.assert_awaited_once()

# ------------------------
# Test missing flow parameter
# ------------------------
def test_run_flow_missing_flow():
    data = {
        "azimuth": 10,
        "slope": 20,
        "latitude": 52.0,
        "longitude": 5.0,
        "year": 2024,
    }

    response = client.post("/run", data=data)

    assert response.status_code == 422  # FastAPI requires flow form field

# ------------------------
# Test unknown flow
# ------------------------
def test_run_flow_unknown_flow():
    data = {
        "flow": "unknown",
        "azimuth": 10,
        "slope": 20,
        "latitude": 52.0,
        "longitude": 5.0,
        "year": 2024,
    }

    response = client.post("/run", data=data)

    assert response.status_code == 400
    assert response.json() == {"detail": "Unknown flow 'unknown'"}
