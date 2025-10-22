from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import os
import numpy as np
import requests
import time
from datetime import datetime
from concurrent.futures import ThreadPoolExecutor, as_completed
import threading
import scipy.io
import pickle
import json

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # adjust in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

API_PORT = os.getenv("API_PORT", 1000)

def post_file_to_saveData(file_path: str, azimuth_res=1, slope_res=1):
    endpoint = "http://savedata:8505/saveDataFile"
    with open(file_path, "rb") as f:
        files = {"file": (os.path.basename(file_path), f, "application/octet-stream")}
        params = {"azimuth_res": azimuth_res, "slope_res": slope_res}
        response = requests.post(endpoint, files=files, params=params)
        response.raise_for_status()
        return response.json()


def save_pv_and_year(all_Ppv_data, all_year_sum, azimuth, slope):
    all_Ppv_file = f"all_Ppv_data_azires_{azimuth}_sloperes_{slope}.pkl"
    with open(all_Ppv_file, "wb") as f:
        pickle.dump(all_Ppv_data, f)
    all_year_file = f"all_year_sum_azires_{azimuth}_sloperes_{slope}.pkl"
    with open(all_year_file, "wb") as f:
        pickle.dump(all_year_sum, f)

    ppv_result = post_file_to_saveData(all_Ppv_file, azimuth_res=azimuth, slope_res=slope)
    year_result = post_file_to_saveData(all_year_file, azimuth_res=azimuth, slope_res=slope)
    print("Savedata results (separate files):", ppv_result, year_result)

@app.get("/getData")
def getData(
    azimuth: int,
    slope: int,
    ppv_max: int,
    latit: float,
    longit: float,
    year: int
):

    combined_file = f"combined_azires_{azimuth}_sloperes_{slope}.pkl"

    # EARLY RETURN if combined file exists
    if os.path.exists(combined_file):
        print(f">> Combined file already exists: {combined_file}, skipping all computation.")
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
            "yearly_sum": all_year_sum_numeric.tolist(),
        }

    # =========================
    # Simulation Parameters
    # =========================
    messages = "on"
    request_timer = "on"

    C = datetime.now()
    RunIDString = f"{C.year}-{C.month}-{C.day}-{C.hour}:{C.minute}:{C.second}"

    if messages == "on":
        print(f"Run ID: {RunIDString}")
        print("> Start Parameter specification ...")

    azimuth_input = azimuth
    slope_input = slope
    azimuth_res = azimuth
    slope_res = slope
    Ppv_max = ppv_max

    lat = latit
    lon = longit
    startyear = year
    endyear = year
    power_wp = 1000

    if messages == "on":
        print("> Parameter specification complete.")

    # =========================
    # PV Data Initialization
    # =========================
    if messages == "on":
        print("> Start initialisation ...")

    pvcalculation = 1
    output_format = "json"

    azimuth_array = np.arange(-90, 91, azimuth_res)
    slope_array = np.arange(0, 91, slope_res)

    num_azimuths = len(azimuth_array)
    num_slopes = len(slope_array)

    all_Ppv_data = [[None for _ in azimuth_array] for _ in slope_array]
    all_year_sum = [[None for _ in azimuth_array] for _ in slope_array]

    all_Ppv_string = f"all_Ppv_data_azires_{azimuth_res}_sloperes_{slope_res}.pkl"
    all_year_string = f"all_year_sum_azires_{azimuth_res}_sloperes_{slope_res}.pkl"

    taxis = np.arange(1, 8761)  # time axis

    if messages == "on":
        print("> Initialisation complete.")

    # =========================
    # PVGIS API function
    # =========================
    def PV_get_pvgis_data(
        lat, lon, startyear, endyear, slope, azimuth, power_wp, pvcalculation, output_format
    ):
        base_url = "https://re.jrc.ec.europa.eu/api/v5_2/seriescalc?"
        query = (
            f"lat={lat:.6f}&lon={lon:.6f}&startyear={startyear}&endyear={endyear}"
            f"&angle={slope:.1f}&aspect={azimuth:.1f}&pvtechchoice=crystSi"
            f"&peakpower={power_wp/1000:.3f}&pvcalculation={pvcalculation}&loss=14"
            f"&outputformat={output_format}"
        )
        response = requests.get(base_url + query)
        data = response.json()
        if isinstance(data, list):
            data = data[0]
        return data

    # =========================
    # Worker function for parallel calls
    # =========================
    lock = threading.Lock()

    def worker(s, a, slope, azimuth):
        data = PV_get_pvgis_data(
            lat, lon, startyear, endyear, slope, azimuth, power_wp, pvcalculation, output_format
        )
        hourly = data.get("outputs", {}).get("hourly", None)

        if not isinstance(hourly, list) or ("P" not in hourly[0] and "P_ac" not in hourly[0]):
            raise ValueError(f"Malformed PVGIS response for slope {slope}, azimuth {azimuth}")

        if "P" in hourly[0]:
            P_array = np.array([h["P"] for h in hourly], dtype=float).reshape(-1, 1)
        else:
            P_array = np.array([h["P_ac"] for h in hourly], dtype=float).reshape(-1, 1)

        if P_array.shape[0] < 8760:
            P_array = np.pad(P_array, ((0, 8760 - P_array.shape[0]), (0, 0)), mode="constant")
        elif P_array.shape[0] > 8760:
            P_array = P_array[:8760, :]

        with lock:
            all_Ppv_data[s][a] = P_array
            all_year_sum[s][a] = float(np.sum(P_array))

        if messages == "on":
            with lock:
                print(f">> Azimuth: {azimuth}, Slope: {slope}")

    # =========================
    # Request PVGIS Data
    # =========================
    if messages == "on":
        print("> Start requesting data from PV GIS ...")

    if os.path.exists(all_Ppv_string):
        print(">> Simulation data already exists and is therefore not requested again.")

        with open(all_Ppv_string, "rb") as f:
            all_Ppv_data = pickle.load(f)
        with open(all_year_string, "rb") as f:
            all_year_sum = pickle.load(f)

        if messages == "on":
            print("> Data request complete.")

    else:
        if request_timer == "on":
            start_time = time.time()

        tasks = [(s, a, slope_array[s], azimuth_array[a]) for a in range(num_azimuths) for s in range(num_slopes)]
        max_workers = 30  # API limit: 30 calls/sec

        with ThreadPoolExecutor(max_workers=max_workers) as executor:
            futures = []
            for idx, (s, a, slope, azimuth) in enumerate(tasks):
                futures.append(executor.submit(worker, s, a, slope, azimuth))
                if (idx + 1) % 30 == 0:
                    time.sleep(1) 

            for future in as_completed(futures):
                future.result()  

        if request_timer == "on":
            simulation_time = time.time() - start_time
            print(f">>> Requesting the data took {int(simulation_time)} seconds.")



    # =========================
    # Save as Octave/MATLAB-compatible .mat
    # =========================
    num_hours = 8760
    all_Ppv_cell = np.empty((num_slopes, num_azimuths), dtype=object)
    all_year_sum_numeric = np.zeros((num_slopes, num_azimuths))

    for s in range(num_slopes):
        for a in range(num_azimuths):
            hourly = all_Ppv_data[s][a]

            if isinstance(hourly, np.ndarray):
                hourly_array = np.asarray(hourly, dtype=float)
            elif isinstance(hourly, list):
                hourly_array = np.array(hourly, dtype=float).reshape(-1, 1)
            else:
                hourly_array = np.zeros((num_hours, 1))

            if hourly_array.shape[0] < num_hours:
                hourly_array = np.pad(
                    hourly_array, ((0, num_hours - hourly_array.shape[0]), (0, 0)), mode="constant"
                )
            elif hourly_array.shape[0] > num_hours:
                hourly_array = hourly_array[:num_hours, :]

            all_Ppv_cell[s, a] = hourly_array
            all_year_sum_numeric[s, a] = float(np.sum(hourly_array))


    combined_data = {
        "all_Ppv_data": all_Ppv_data,
        "all_year_sum": all_year_sum
    }
    combined_file = f"combined_azires_{azimuth_input}_sloperes_{slope_input}.pkl"
    with open(combined_file, "wb") as f:
        pickle.dump(combined_data, f)
    save_pv_and_year(all_Ppv_data, all_year_sum, azimuth=azimuth_input, slope=slope_input)
    
    post_file_to_saveData(combined_file, azimuth_res=azimuth_input, slope_res=slope_input)
    return {
        "hourly_shape": all_Ppv_cell.shape,
        "yearly_sum_shape": all_year_sum_numeric.shape,
        "yearly_sum": all_year_sum_numeric.tolist(),
    }

if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host="127.0.0.1", port=int(API_PORT))
