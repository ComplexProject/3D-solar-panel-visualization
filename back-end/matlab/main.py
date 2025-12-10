from fastapi import FastAPI, UploadFile, Form, File
import subprocess
import uvicorn
import os
import json
import requests
import shutil

MATLAB_PORT = int(os.getenv("MATLAB", 1000))
app = FastAPI()

@app.post("/runMatlab")
async def runMatlab(
    azimuth: int = Form(...),
    slope: int = Form(...),
    weatherData: str = Form(...),
    year: int = Form(...),
    demandProfile: UploadFile = File(...)
):

    tmp_dir = "tmp"
    os.makedirs(tmp_dir, exist_ok=True)
    demand_path = os.path.join(tmp_dir, demandProfile.filename)
    print(demand_path)
    with open(demand_path, "wb") as f:
        f.write(await demandProfile.read())

    BASE_URL = "http://savedata:8505/getFile"
    weather_path = os.path.join(tmp_dir, weatherData)
    response = requests.get(BASE_URL, params={"filename": weatherData, "year": year})
    if response.status_code == 200:
        with open(weather_path, "wb") as f:
            f.write(response.content)
    else:
        return {"error": f"Failed to download file: {response.status_code}"}

    result = subprocess.run(
        ["octave", "--no-gui", "--no-window-system", "calculation.m", demand_path, weather_path, str(azimuth), str(slope)],
        capture_output=True,
        text=True,
        env={**os.environ, "DISPLAY": ""}
    )


    os.remove(demand_path)
    os.remove(weather_path)

    if result.returncode != 0:
        return {"error": result.stderr}

    return {"output": json.loads(result.stdout)}

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=MATLAB_PORT, log_level="info")
