from urllib import response
from fastapi.middleware.cors import CORSMiddleware
from fastapi import FastAPI, UploadFile, File
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
def getData(latitude:int, longitude:int,year:int,maxPower:int,profileDemand:UploadFile = File(...),):
    strategy_port = os.getenv("ROUTER_STRATEGY", "8503")
    url= f"http://router-strategy:{strategy_port}/run"    

    params = {
        "flow": "python",
        "azimuth": 1,
        "slope": 1,
        "latit": latitude,
        "longit": longitude,
        "year": year,
    }

    resp = requests.post(url, params=params)
    resp.raise_for_status()
    return resp.json()



@app.get("/")
def root():
    return {"message": "API Gateway is running"}

if __name__ == "__main__":
    port = int(os.getenv("API_PORT", "8501"))
    uvicorn.run(app, host="127.0.0.1", port=port, reload=True)