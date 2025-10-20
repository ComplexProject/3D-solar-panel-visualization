from fastapi import FastAPI
import os

app = FastAPI()

@app.get("/getDummy")
def getDummy():
    return {"totalEnergy": 3000,
            "energyFromGrid":1500,
            "pvProduction": 1000,
            "solarPanels":[
                  {"azimuth":5,
                   "slope":5},
                  {"azimuth":10,
                   "slope":10},
                   {"azimuth":15,
                   "slope":15},
                   {"azimuth":20,
                   "slope":20},
                  ]}

if __name__ == "__main__":
	import uvicorn
	uvicorn.run(app, host="127.0.0.1", port=8510)