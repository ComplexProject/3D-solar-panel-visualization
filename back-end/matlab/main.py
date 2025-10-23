import subprocess
import uvicorn
from fastapi import FastAPI
import os

MATLAB = int(os.getenv("MATLAB", 1000))
app = FastAPI()


@app.get("/runMatlab")
def runMatlab():
    result = subprocess.run(
        ["octave", "add_numbers.m","Pd.mat","all_ppv.mat"], 
        capture_output=True, 
        text=True)
    print(result.stdout)
    return result.stdout

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=MATLAB, log_level="info")
