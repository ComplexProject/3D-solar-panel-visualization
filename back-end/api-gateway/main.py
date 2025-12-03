from fastapi import FastAPI, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
import requests
import os
import uvicorn

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.post("/getData")
async def getData(
    latitude: float = Form(...),
    longitude: float = Form(...),
    year: int = Form(...),
    maxPower: float = Form(...),
    profileDemand: UploadFile = File(...),
):
    strategy_port = os.getenv("ROUTER_STRATEGY_PORT", "8502")
    url = f"http://routerstrategy:{strategy_port}/run"
    
    
    data = {
        "flow": "python",  
        "azimuth": 1,
        "slope": 1,
        "latitude": latitude,
        "longitude": longitude,
        "year": year,
    }
    
    files = {
        "profileDemand": await profileDemand.read(),
    }
    
    resp = requests.post(url, data=data)
    resp.raise_for_status()
    resp_json =resp.json()
    print(resp_json)
 
    weather_filename = resp_json.get("filename")


    print(weather_filename)
    data = {
        "latitude": latitude,
        "longitude": longitude,
        "year": year,
        "flow": "matlab", 
        "azimuth": 1,
        "slope": 1,
        "weatherFile": resp_json.get("filename"),
    }
    resp = requests.post(url, files=files,data=data)
    return resp.json()

@app.get("/")
def root():
    return {"message": "API Gateway is running"}

if __name__ == "__main__":
    port = int(os.getenv("API_PORT", "8501"))
    uvicorn.run(app, host="0.0.0.0", port=port, reload=True)