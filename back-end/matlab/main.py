import subprocess
import uvicorn
from fastapi import FastAPI
import os
import json
import requests

MATLAB_PORT = int(os.getenv("MATLAB", 1000))
app = FastAPI()

@app.get("/runMatlab")
def runMatlab(azimuth: int, slope: int, demandProfile: str, weatherData:str ):
    BASE_URL = "http://savedata:8505/getFile"

    filename = weatherData
    save_dir = "tmp/"  
    weather_file_path = os.path.join(save_dir, filename)

    response = requests.get(BASE_URL, params={"filename": filename})
    if response.status_code == 200:
        with open(weather_file_path, "wb") as f:
            f.write(response.content)
        print(f"File '{filename}' downloaded to {weather_file_path}")
    else:
        return {"error": f"Failed to download file: {response.status_code}", "details": response.text}

    # try:
    result = subprocess.run(
    ["octave","--no-gui", "calculation.m", "Pd.mat",weather_file_path, str(azimuth), str(slope)],
    capture_output=True,
    text=True
    )
    # finally:
    #     if os.path.exists(weather_file_path):
    #         os.remove(weather_file_path)
    #         print(f" Temporary file '{weather_file_path}' deleted.")

    
    if result.returncode != 0:
        return {"error": result.stderr}
    
    return {"output": json.loads(result.stdout)}

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=MATLAB_PORT, log_level="info")
