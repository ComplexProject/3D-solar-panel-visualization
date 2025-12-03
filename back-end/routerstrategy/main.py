from fastapi import FastAPI, HTTPException, UploadFile, File, Form
from strategies import MatlabStrategy, PythonStrategy
import os

app = FastAPI()

strategies = {
    "matlab": MatlabStrategy(),
    "python": PythonStrategy(),
}

@app.post("/run")
async def run_flow(
    flow: str = Form(...),
    azimuth: int = Form(...),
    slope: int = Form(...),
    latitude: float = Form(...),
    longitude: float = Form(...),
    year: int = Form(...),
    profileDemand: UploadFile = File(None),
    weatherFile: str = Form(""), 
):
    if not flow:
        raise HTTPException(status_code=400, detail="Missing 'flow' parameter")

    strategy = strategies.get(flow)
    if not strategy:
        raise HTTPException(status_code=400, detail=f"Unknown flow '{flow}'")

    payload = {
        "flow": flow,
        "azimuth": azimuth,
        "slope": slope,
        "latitude": latitude,
        "longitude": longitude,
        "year": year,
        "profileDemand": profileDemand,
        "weatherFile": weatherFile
    }

    return await  strategy.execute(payload)