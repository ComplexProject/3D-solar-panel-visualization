import subprocess
import uvicorn
from fastapi import FastAPI
import os
import json

MATLAB_PORT = int(os.getenv("MATLAB", 1000))
app = FastAPI()

@app.get("/runMatlab")
def runMatlab(azimuth: int, slope: int):
    result = subprocess.run(
        ["octave", "calculation.m", "Pd.mat", "all_ppv.mat", str(azimuth), str(slope)],
        capture_output=True,
        text=True
    )
    
    if result.returncode != 0:
        return {"error": result.stderr}
    
    return {"output": json.loads(result.stdout)}

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=MATLAB_PORT, log_level="info")
