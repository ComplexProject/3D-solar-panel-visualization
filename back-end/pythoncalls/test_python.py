import pytest
import json
import numpy as np
from unittest.mock import patch, MagicMock
from fastapi.testclient import TestClient

from main import app  # adjust if your file is named differently

client = TestClient(app)

# ------------------------
# Fake PVGIS API data
# ------------------------
def fake_pvgis_data(*args, **kwargs):
    """Return fake PVGIS hourly data"""
    hourly = [{"P": i % 100} for i in range(8760)]
    return {"outputs": {"hourly": hourly}}

# ------------------------
# Fake HTTP responses
# ------------------------
class FakeResponse:
    def __init__(self, json_data=None, status_code=200):
        self._json = json_data or {}
        self.status_code = status_code

    def json(self):
        return self._json

    def raise_for_status(self):
        if self.status_code >= 400:
            raise Exception(f"HTTP {self.status_code}")

# ------------------------
# Test /getData endpoint
# ------------------------
@patch("main.post_file_to_saveData")  # Avoid real file POST
@patch("main.requests.get")           # Mock PVGIS API & savedata GET
@patch("main.save_pv")                # Mock save_pv (no real .mat file)
def test_getData(mock_save_pv, mock_requests_get, mock_post_file):
    """
    Test /getData endpoint:
    - mocks PVGIS API
    - mocks savedata GET/POST
    - mocks save_pv file writing
    """

    # ------------------------
    # Mock savedata checkFile and PVGIS
    # ------------------------
    def get_side_effect(url, params=None):
        if "checkFile" in url:
            return FakeResponse({"exists": False})  # pretend file does not exist
        else:
            return FakeResponse(fake_pvgis_data())  # PVGIS API

    mock_requests_get.side_effect = get_side_effect

    # ------------------------
    # Mock save_pv to just return a fake file path
    # ------------------------
    mock_save_pv.return_value = "data/2019/fakefile.mat"

    # ------------------------
    # Mock post_file_to_saveData to avoid reading real file
    # ------------------------
    mock_post_file.return_value = {"status": "ok"}

    # ------------------------
    # Prepare query parameters
    # ------------------------
    params = {
        "azimuth": 10,
        "slope": 20,
        "latit": 52.0,
        "longit": 5.0,
        "year": 2019
    }

    # ------------------------
    # Call the endpoint
    # ------------------------
    response = client.get("/getData", params=params)

    # ------------------------
    # Assertions
    # ------------------------
    assert response.status_code == 200

    json_data = response.json()
    assert "filename" in json_data
    assert json_data["filename"].startswith("all_Ppv_data_azires")

    # PVGIS API should have been called multiple times
    assert mock_requests_get.call_count > 1

    # save_pv should be called once
    mock_save_pv.assert_called_once()

    # post_file_to_saveData should be called once
    mock_post_file.assert_called_once()
