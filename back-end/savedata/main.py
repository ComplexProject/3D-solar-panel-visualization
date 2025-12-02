from fastapi import FastAPI, UploadFile, File
from fastapi.responses import JSONResponse, FileResponse
import numpy as np
import scipy.io
import pickle
import os
import shutil

SAVE_DATA = int(os.getenv("SAVE_DATA", 1000))
app = FastAPI()


@app.post("/saveDataFile")
async def saveDataFile(file: UploadFile = File(...), azimuth_res: int = 1, slope_res: int = 1,year =2019):
    os.makedirs(f"data/{year}", exist_ok=True)
    with open(f"/app/data/{year}/{file.filename}", "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
    print("it worked i guess")


@app.get("/getFile")
async def getFile(filename):
    save_dir = "data/"
    file_path = os.path.join(save_dir, filename)
    if not os.path.exists(file_path):
        return {"status": "error", "message": f"File '{filename}' not found"}

    return FileResponse(file_path, media_type='application/octet-stream', filename=filename)

@app.get("/listSavedFiles")
async def list_saved_files():
    save_dir = "/app/data"
    os.makedirs(save_dir, exist_ok=True)
    mat_files = [f for f in os.listdir(save_dir) if f.endswith(".mat")]
    return JSONResponse(content={"saved_files": mat_files})


@app.get("/checkFile")
def checkFile(filename: str):
    path = os.path.join("/app/data", filename)
    return {"exists": os.path.isfile(path)}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=SAVE_DATA, log_level="info")
