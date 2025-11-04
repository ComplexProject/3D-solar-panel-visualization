from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
import os
import numpy as np
import scipy.io
import pickle
import requests
import time
from datetime import datetime
from concurrent.futures import ThreadPoolExecutor, as_completed
import threading

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # adjust in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

API_PORT = int(os.getenv("API_PORT", 1000))

# ------------------------
# Helper: Save PV and yearly sums as .pkl and .mat (cell array compatible)
# ------------------------
def save_pv_and_year(all_Ppv_data, all_year_sum, azimuth, slope, save_dir="data"):
    os.makedirs(save_dir, exist_ok=True)

    num_slopes = len(all_Ppv_data)
    num_azimuths = len(all_Ppv_data[0])
    all_Ppv_cell = np.empty((num_slopes, num_azimuths), dtype=object)
    all_year_sum_numeric = np.zeros((num_slopes, num_azimuths))

    for s in range(num_slopes):
        for a in range(num_azimuths):
            hourly = all_Ppv_data[s][a]
            if isinstance(hourly, np.ndarray):
                hourly_array = np.array(hourly, dtype=float)
            elif isinstance(hourly, list):
                hourly_array = np.array(hourly, dtype=float).reshape(-1, 1)
            else:
                hourly_array = np.zeros((8760, 1))
            all_Ppv_cell[s, a] = hourly_array
            all_year_sum_numeric[s, a] = float(np.sum(hourly_array))

    # Save as .pkl
    pkl_ppv_file = os.path.join(save_dir, f"all_Ppv_data_azires_{azimuth}_sloperes_{slope}.pkl")
    pkl_year_file = os.path.join(save_dir, f"all_year_sum_azires_{azimuth}_sloperes_{slope}.pkl")
    with open(pkl_ppv_file, "wb") as f:
        pickle.dump(all_Ppv_data, f)
    with open(pkl_year_file, "wb") as f:
        pickle.dump(all_year_sum, f)

    # Save as .mat
    mat_file_ppv = os.path.join(save_dir, f"all_Ppv_data_azires_{azimuth}_sloperes_{slope}.mat")
    mat_file_year = os.path.join(save_dir, f"all_year_sum_azires_{azimuth}_sloperes_{slope}.mat")
    scipy.io.savemat(mat_file_ppv, {"all_Ppv_data": all_Ppv_cell}, do_compression=False)
    scipy.io.savemat(mat_file_year, {"all_year_sum": all_year_sum_numeric}, do_compression=False)

    return {
        "pkl_ppv": pkl_ppv_file,
        "pkl_year": pkl_year_file,
        "mat_ppv": mat_file_ppv,
        "mat_year": mat_file_year
    }

# ------------------------
# Helper: Post file to saveDataFile endpoint
# ------------------------
def post_file_to_saveData(file_path: str, azimuth_res=1, slope_res=1):
    endpoint = "http://savedata:8505/saveDataFile"
    with open(f"data/{file_path}", "rb") as f:
        files = {"file": (os.path.basename(file_path), f, "application/octet-stream")}
        params = {"azimuth_res": azimuth_res, "slope_res": slope_res}
        response = requests.post(endpoint, files=files, params=params)
        response.raise_for_status()
        return response.json()

# ------------------------
# FastAPI Route: Upload Pickle and Save as MATLAB/Octave .mat
# ------------------------
@app.post("/saveDataFile")
async def saveDataFile(file: UploadFile = File(...), azimuth_res: int = 1, slope_res: int = 1):
    try:
        data = pickle.loads(await file.read())
        all_Ppv_data = data.get("all_Ppv_data") if isinstance(data, dict) else None
        all_year_sum = data.get("all_year_sum") if isinstance(data, dict) else None

        if all_Ppv_data is None and isinstance(data, list):
            all_Ppv_data = data

        if all_Ppv_data is None and all_year_sum is None:
            return {"status": "error", "message": "Pickle has neither 'all_Ppv_data' nor 'all_year_sum'"}

        saved_files = save_pv_and_year(all_Ppv_data, all_year_sum, azimuth_res, slope_res)
        return {"status": "success", "saved_files": saved_files}
    except Exception as e:
        return {"status": "error", "message": str(e)}

# ------------------------
# FastAPI Route: Compute PV Data via PVGIS API
# ------------------------
@app.get("/getData")
def getData(
    azimuth: int,
    slope: int,
    latit: float,
    longit: float,
    year: int
):
    combined_file = f"combined_azires_{azimuth}_sloperes_{slope}.pkl"

    # Early return if file exists
    if os.path.exists(combined_file):
        with open(combined_file, "rb") as f:
            combined_data = pickle.load(f)

        num_slopes = len(combined_data["all_Ppv_data"])
        num_azimuths = len(combined_data["all_Ppv_data"][0])
        all_Ppv_cell = np.empty((num_slopes, num_azimuths), dtype=object)
        all_year_sum_numeric = np.zeros((num_slopes, num_azimuths))

        for s in range(num_slopes):
            for a in range(num_azimuths):
                hourly = combined_data["all_Ppv_data"][s][a]
                all_Ppv_cell[s, a] = np.asarray(hourly, dtype=float)
                all_year_sum_numeric[s, a] = float(combined_data["all_year_sum"][s][a])

        return {
            "hourly_shape": all_Ppv_cell.shape,
            "yearly_sum_shape": all_year_sum_numeric.shape,
            "yearly_sum": all_year_sum_numeric.tolist()
        }

    # ------------------------
    # Simulation Parameters
    # ------------------------
    messages = "on"
    request_timer = "on"
    C = datetime.now()
    RunIDString = f"{C.year}-{C.month}-{C.day}-{C.hour}:{C.minute}:{C.second}"

    azimuth_array = np.arange(-90, 91, azimuth)
    slope_array = np.arange(0, 91, slope)

    num_azimuths = len(azimuth_array)
    num_slopes = len(slope_array)

    all_Ppv_data = [[None for _ in azimuth_array] for _ in slope_array]
    all_year_sum = [[None for _ in azimuth_array] for _ in slope_array]

    # ------------------------
    # PVGIS API function
    # ------------------------
    def PV_get_pvgis_data(lat, lon, startyear, endyear, slope, azimuth, power_wp=1000):
        base_url = "https://re.jrc.ec.europa.eu/api/v5_2/seriescalc?"
        query = (
            f"lat={lat:.6f}&lon={lon:.6f}&startyear={startyear}&endyear={endyear}"
            f"&angle={slope:.1f}&aspect={azimuth:.1f}&pvtechchoice=crystSi"
            f"&peakpower={power_wp/1000:.3f}&pvcalculation=1&loss=14&outputformat=json"
        )
        response = requests.get(base_url + query)
        data = response.json()
        if isinstance(data, list):
            data = data[0]
        return data

    # ------------------------
    # Worker function for parallel requests
    # ------------------------
    lock = threading.Lock()

    def worker(s, a, slope_val, azimuth_val):
        data = PV_get_pvgis_data(latit, longit, year, year, slope_val, azimuth_val)
        hourly = data.get("outputs", {}).get("hourly", None)

        if not isinstance(hourly, list):
            hourly = [[0]] * 8760  # fallback empty array

        if "P" in hourly[0]:
            P_array = np.array([h["P"] for h in hourly], dtype=float).reshape(-1, 1)
        elif "P_ac" in hourly[0]:
            P_array = np.array([h["P_ac"] for h in hourly], dtype=float).reshape(-1, 1)
        else:
            P_array = np.zeros((8760, 1))

        if P_array.shape[0] < 8760:
            P_array = np.pad(P_array, ((0, 8760 - P_array.shape[0]), (0, 0)), mode="constant")
        elif P_array.shape[0] > 8760:
            P_array = P_array[:8760, :]

        with lock:
            all_Ppv_data[s][a] = P_array
            all_year_sum[s][a] = float(np.sum(P_array))

    # ------------------------
    # Run parallel PVGIS requests
    # ------------------------
    tasks = [(s, a, slope_array[s], azimuth_array[a]) for s in range(num_slopes) for a in range(num_azimuths)]
    max_workers = 30

    with ThreadPoolExecutor(max_workers=max_workers) as executor:
        futures = [executor.submit(worker, s, a, slope_val, azimuth_val) for (s, a, slope_val, azimuth_val) in tasks]
        for future in as_completed(futures):
            future.result()

    # ------------------------
    # Save results as .pkl and .mat
    # ------------------------
    combined_data = {"all_Ppv_data": all_Ppv_data, "all_year_sum": all_year_sum}
    with open(combined_file, "wb") as f:
        pickle.dump(combined_data, f)

    save_pv_and_year(all_Ppv_data, all_year_sum, azimuth, slope)
    post_file_to_saveData(f"all_Ppv_data_azires_{azimuth}_sloperes_{slope}.mat", azimuth_res=azimuth, slope_res=slope)

    # Return shapes for verification
    all_Ppv_cell = np.empty((num_slopes, num_azimuths), dtype=object)
    all_year_sum_numeric = np.zeros((num_slopes, num_azimuths))
    for s in range(num_slopes):
        for a in range(num_azimuths):
            all_Ppv_cell[s, a] = np.asarray(all_Ppv_data[s][a], dtype=float)
            all_year_sum_numeric[s, a] = all_year_sum[s][a]

    return {
        "hourly_shape": all_Ppv_cell.shape,
        "yearly_sum_shape": all_year_sum_numeric.shape,
        "yearly_sum": all_year_sum_numeric.tolist()
    }

# ------------------------
# Main
# ------------------------
if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="127.0.0.1", port=API_PORT)
