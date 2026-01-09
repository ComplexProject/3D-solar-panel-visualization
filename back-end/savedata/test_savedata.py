import os
import io
import pytest
from fastapi.testclient import TestClient
from main import app  # adjust if your savedata file is named differently

client = TestClient(app)

# ------------------------
# Helpers
# ------------------------
def create_fake_file(name="testfile.mat", content=b"fake data"):
    return io.BytesIO(content), name

# ------------------------
# Test POST /saveDataFile
# ------------------------
def test_saveDataFile(tmp_path):
    # Override /app/data path to tmp_path for test isolation
    os.makedirs(tmp_path, exist_ok=True)
    test_file, filename = create_fake_file()
    
    response = client.post(
        "/saveDataFile",
        files={"file": (filename, test_file)},
        data={"year": 2019, "azimuth_res": 10, "slope_res": 20}
    )
    assert response.status_code == 200 or response.status_code == 204

    # Check file exists
    saved_file = tmp_path / "2019" / filename
    # Actually in app it uses /app/data/2019, so just check existence inside app
    assert os.path.exists(f"/app/data/2019/{filename}")

# ------------------------
# Test GET /getFile
# ------------------------
def test_getFile_existing(tmp_path):
    os.makedirs("/app/data/2019", exist_ok=True)
    test_file_path = "/app/data/2019/test_get.mat"
    with open(test_file_path, "wb") as f:
        f.write(b"hello world")

    response = client.get("/getFile", params={"filename": "test_get.mat", "year": 2019})
    assert response.status_code == 200
    assert response.content == b"hello world"

def test_getFile_missing():
    response = client.get("/getFile", params={"filename": "nonexistent.mat", "year": 2019})
    assert response.status_code == 404
    json_data = response.json()
    assert json_data["status"] == "error"
    assert "not found" in json_data["message"]

def test_getFile_empty_filename():
    response = client.get("/getFile", params={"filename": "", "year": 2019})
    assert response.status_code == 400
    json_data = response.json()
    assert json_data["status"] == "error"

# ------------------------
# Test GET /listSavedFiles
# ------------------------
def test_listSavedFiles(tmp_path):
    os.makedirs("/app/data", exist_ok=True)
    # create some .mat files
    filenames = ["a.mat", "b.mat", "c.txt"]
    for f in filenames:
        with open(f"/app/data/{f}", "wb") as file:
            file.write(b"123")
    
    response = client.get("/listSavedFiles")
    assert response.status_code == 200
    json_data = response.json()
    assert "saved_files" in json_data
    assert "a.mat" in json_data["saved_files"]
    assert "b.mat" in json_data["saved_files"]
    assert "c.txt" not in json_data["saved_files"]

# ------------------------
# Test GET /checkFile
# ------------------------
def test_checkFile_existing(tmp_path):
    path = "/app/data/2019/existing.mat"
    os.makedirs("/app/data/2019", exist_ok=True)
    with open(path, "wb") as f:
        f.write(b"hi")

    response = client.get("/checkFile", params={"filename": path})
    assert response.status_code == 200
    assert response.json()["exists"] is True

def test_checkFile_missing():
    response = client.get("/checkFile", params={"filename": "/app/data/2019/missing.mat"})
    assert response.status_code == 200
    assert response.json()["exists"] is False
