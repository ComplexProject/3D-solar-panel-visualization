from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import os
import numpy as np
import scipy.io
import requests
from concurrent.futures import ThreadPoolExecutor, as_completed
import threading

PYTHON = int(os.getenv("PYTHON", 8503))
app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # adjust in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ------------------------
# Helper: Save PV as .mat
# ------------------------
def save_pv(all_Ppv_data, azimuth, slope, lat, long, year):
    save_dir = f"data/{year}"
    os.makedirs(save_dir, exist_ok=True)

    num_slopes = len(all_Ppv_data)
    num_azimuths = len(all_Ppv_data[0])
    all_Ppv_cell = np.empty((num_slopes, num_azimuths), dtype=object)

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

    # Force consistent float formatting in filename
    mat_file_ppv = os.path.join(
        save_dir,
        f"all_Ppv_data_azires_{azimuth}_sloperes_{slope}_{lat:.5f}_{long:.5f}.mat"
    )
    scipy.io.savemat(mat_file_ppv, {"all_Ppv_data": all_Ppv_cell}, do_compression=False)
    return mat_file_ppv

# ------------------------
# Helper: Post file to saveDataFile endpoint
# ------------------------
def post_file_to_saveData(file_path: str, azimuth_res=1, slope_res=1, year=2019):
    endpoint = "http://savedata:8505/saveDataFile"
    with open(file_path, "rb") as f:
        files = {"file": (os.path.basename(file_path), f, "application/octet-stream")}
        params = {"azimuth_res": azimuth_res, "slope_res": slope_res, "year": year}
        response = requests.post(endpoint, files=files, params=params)
        response.raise_for_status()
        return response.json()

# ------------------------
# FastAPI Route: Compute PV Data via PVGIS API
# ------------------------
@app.get("/getData")
def getData(azimuth: int, slope: int, latit: float, longit: float, year: int):
    combined_file = f"data/{year}/all_Ppv_data_azires_{azimuth}_sloperes_{slope}_{latit:.5f}_{longit:.5f}.mat"

    # Early return if file exists
    if os.path.exists(combined_file):
        return {"it exists"}
    else:
        print(f"{combined_file} doesn't exist")
    # ------------------------
    # Simulation Parameters
    # ------------------------
    azimuth_array = np.arange(-90, 91, azimuth)
    slope_array = np.arange(0, 91, slope)

    num_azimuths = len(azimuth_array)
    num_slopes = len(slope_array)

    all_Ppv_data = [[None for _ in azimuth_array] for _ in slope_array]

    # ------------------------
    # PVGIS API function
    # ------------------------
    def PV_get_pvgis_data(lat, lon, startyear, endyear, slope_val, azimuth_val, power_wp=1000):
        base_url = "https://re.jrc.ec.europa.eu/api/v5_2/seriescalc?"
        query = (
            f"lat={lat:.6f}&lon={lon:.6f}&startyear={startyear}&endyear={endyear}"
            f"&angle={slope_val:.1f}&aspect={azimuth_val:.1f}&pvtechchoice=crystSi"
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

    # ------------------------
    # Run parallel PVGIS requests
    # ------------------------
    tasks = [(s, a, slope_array[s], azimuth_array[a]) for s in range(num_slopes) for a in range(num_azimuths)]
    max_workers = 10
    with ThreadPoolExecutor(max_workers=max_workers) as executor:
        futures = [executor.submit(worker, s, a, slope_val, azimuth_val) for (s, a, slope_val, azimuth_val) in tasks]
        for future in as_completed(futures):
            future.result()

    # ------------------------
    # Save results as .mat
    # ------------------------

    mat_file = save_pv(all_Ppv_data, azimuth, slope, latit, longit, year)
    post_file_to_saveData(mat_file, azimuth_res=azimuth, slope_res=slope, year=year)

    # Return shapes for verification
    all_Ppv_cell = np.empty((num_slopes, num_azimuths), dtype=object)
    for s in range(num_slopes):
        for a in range(num_azimuths):
            all_Ppv_cell[s, a] = np.asarray(all_Ppv_data[s][a], dtype=float)

    return {"hourly_shape": all_Ppv_cell.shape}

# ------------------------
# Main
# ------------------------
if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="127.0.0.1", port=PYTHON)
