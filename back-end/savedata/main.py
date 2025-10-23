from fastapi import FastAPI, UploadFile, File
from fastapi.responses import JSONResponse, FileResponse
import numpy as np
import scipy.io
import pickle
import os

SAVE_DATA = int(os.getenv("SAVE_DATA", 1000))
app = FastAPI()

import os
import numpy as np
import scipy.io
import pickle

def save_pickle_to_mat_cells(data, azimuth_res=1, slope_res=1, save_dir="/app/data"):
    """
    Converts a loaded pickle object to .mat files with cell arrays for PV data.
    This ensures MATLAB/Octave can safely use cellfun on it.
    """
    if not isinstance(data, (dict, list)):
        raise ValueError("Data must be a dict or list")

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
        raise ValueError("Pickle has neither 'all_Ppv_data' nor 'all_year_sum'")

    os.makedirs(save_dir, exist_ok=True)
    saved_files = {}

    # --- Save all_Ppv_data as cell array ---
    if all_Ppv_data is not None:
        # Convert numeric array or list of lists to object array (cell array)
        if isinstance(all_Ppv_data, (list, np.ndarray)):
            all_Ppv_cell = np.empty(len(all_Ppv_data), dtype=object)
            for i, row in enumerate(all_Ppv_data):
                all_Ppv_cell[i] = row
        else:
            all_Ppv_cell = np.array([all_Ppv_data], dtype=object)

        mat_file_ppv = os.path.join(
            save_dir, f"all_Ppv_data_azires_{azimuth_res}_sloperes_{slope_res}.mat"
        )
        scipy.io.savemat(mat_file_ppv, {"all_Ppv_data": all_Ppv_cell}, do_compression=False)
        saved_files["ppv_mat"] = mat_file_ppv

    # --- Save all_year_sum as numeric array (optional) ---
    if all_year_sum is not None:
        all_year_sum_np = np.array(all_year_sum, dtype=np.float64)
        mat_file_year = os.path.join(
            save_dir, f"all_year_sum_azires_{azimuth_res}_sloperes_{slope_res}.mat"
        )
        scipy.io.savemat(mat_file_year, {"all_year_sum": all_year_sum_np}, do_compression=False)
        saved_files["year_mat"] = mat_file_year

    return saved_files


@app.post("/saveDataFile")
async def saveDataFile(file: UploadFile = File(...), azimuth_res: int = 1, slope_res: int = 1):
    try:
        data = pickle.loads(await file.read())
        saved_files = save_pickle_to_mat_cells(data, azimuth_res, slope_res)
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
