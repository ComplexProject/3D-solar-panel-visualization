from fastapi import FastAPI, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
import shutil

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.post("/sendForm")
async def send_form(
    latitude: float = Form(...),
    longitude: float = Form(...),
    year: int = Form(...),
    azimuthIncrement: float = Form(...),
    slopeIncrement: float = Form(...),
    maxPower: float = Form(...),
    demandProfile: UploadFile = File(...)
):
    with open(f"./{demandProfile.filename}", "wb") as buffer:
        shutil.copyfileobj(demandProfile.file, buffer)
    
    return {
        "max_power": maxPower,
        "latitude": latitude,
        "longitude": longitude,
        "year": year,
        "azimuth_increment": azimuthIncrement,
        "slope_increment": slopeIncrement,
        "file_received": True,
        "filename": demandProfile.filename
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="127.0.0.1", port=8510)