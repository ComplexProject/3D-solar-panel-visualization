import pickle

# --- Load the pickle file ---
filename = "/home/simon/schoolProgramming/3D-solar-panel-visualization/back-end/pythoncalls/combined_azires_1_sloperes_1.pkl"

with open(filename, "rb") as f:
    data = pickle.load(f)

print("Type of data:", type(data))
print("Available keys:", data.keys())

# --- Read grid increment values (dynamic, just for reference) ---
az_inc = 2
slope_inc = 2

# --- Safely access the PV data ---
ppv_data = data.get("all_Ppv_data")
if ppv_data is None:
    raise ValueError("'all_Ppv_data' key not found in the pickle file")

num_slopes = len(ppv_data)
num_azimuths = len(ppv_data[0])

print(f"Shape info: {num_slopes} slope sets × {num_azimuths} azimuth sets")

# --- Build dynamic slope/azimuth arrays ---
slope_values = [i * slope_inc for i in range(num_slopes)]  # e.g. 0, 2, 4, ...
azimuth_values = [-90 + i * az_inc for i in range(num_azimuths)]  # e.g. -90, -85, -80, ...

# --- Loop dynamically through slope and azimuth indices ---
for s_idx, slope_val in enumerate(slope_values):  # Outer = slope
    for a_idx, azimuth_val in enumerate(azimuth_values):  # Inner = azimuth
        hourly_array = ppv_data[s_idx][a_idx]

        print(f"\n=== Slope {slope_val}° (index {s_idx}), Azimuth {azimuth_val}° (index {a_idx}) ===")
        # If you want to show a few hourly power values
        print("hourly values:", hourly_array)
