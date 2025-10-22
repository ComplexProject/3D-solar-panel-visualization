from fastapi import FastAPI, UploadFile, File
from fastapi.responses import JSONResponse, FileResponse
import numpy as np
import scipy.io
import pickle
import os

SAVE_DATA = int(os.getenv("SAVE_DATA", 1000))
app = FastAPI()


@app.post("/saveDataFile")
async def saveDataFile(file: UploadFile = File(...), azimuth_res: int = 1, slope_res: int = 1):
    try:
        # Load pickle
        data = pickle.loads(await file.read())

        # Extract arrays
        all_Ppv_data = data.get("all_Ppv_data") if isinstance(data, dict) else None
        all_year_sum = data.get("all_year_sum") if isinstance(data, dict) else None

        # Fallback for list-only pickles
        if all_Ppv_data is None and isinstance(data, list):
            if all(isinstance(row, (list, np.ndarray, int, float)) for row in data):
                all_Ppv_data = data
            else:
                all_year_sum = data

        if all_Ppv_data is None and all_year_sum is None:
            return {"status": "error", "message": "Pickle has neither 'all_Ppv_data' nor 'all_year_sum'"}

        save_dir = "/app/data"
        os.makedirs(save_dir, exist_ok=True)

        saved_files = {}

        # --- Save all_Ppv_data ---
        if all_Ppv_data is not None:
            try:
                # Try converting to numeric array first (fastest)
                all_Ppv_np = np.array(all_Ppv_data, dtype=np.float64)
            except:
                # fallback for irregular nested lists
                all_Ppv_np = np.array(all_Ppv_data, dtype=object)

            mat_file_ppv = os.path.join(save_dir, f"all_Ppv_data_azires_{azimuth_res}_sloperes_{slope_res}.mat")
            scipy.io.savemat(mat_file_ppv, {"all_Ppv_data": all_Ppv_np}, do_compression=False)
            saved_files["ppv_mat"] = mat_file_ppv

        # --- Save all_year_sum ---
        if all_year_sum is not None:
            all_year_sum_np = np.array(all_year_sum, dtype=np.float64)
            mat_file_year = os.path.join(save_dir, f"all_year_sum_azires_{azimuth_res}_sloperes_{slope_res}.mat")
            scipy.io.savemat(mat_file_year, {"all_year_sum": all_year_sum_np}, do_compression=False)
            saved_files["year_mat"] = mat_file_year

        return {"status": "success", **saved_files}

    except Exception as e:
        return {"status": "error", "message": str(e)}



@app.get("/getFile")
async def getFile(filename):
    save_dir = "/app/data"
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


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=SAVE_DATA, log_level="info")
