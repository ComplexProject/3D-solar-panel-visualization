from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/getDummy")

def getDummy():
    return {
        "totalEnergy": 3000,
        "energyFromGrid": 1500,
        "pvProduction": 1000,
        "solarPanels": [
            {"azimuth": 5, "slope": 5},
            {"azimuth": 10, "slope": 10},
            {"azimuth": 15, "slope": 15},
            {"azimuth": 20, "slope": 20},
        ],
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8510, reload=True)
