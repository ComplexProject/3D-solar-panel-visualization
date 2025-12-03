import os
import requests
from .base_strategy import FlowStrategy

class MatlabStrategy(FlowStrategy):
    async def execute(self, payload: dict):
        matlab_port = os.getenv("MATLAB", "8504")
        url = f"http://matlab:{matlab_port}/runMatlab"

        demand_profile_file = payload.get("profileDemand")
        files = {}
        if demand_profile_file:
            file_bytes = await demand_profile_file.read()
            files = {"demandProfile": (demand_profile_file.filename, file_bytes)}

        data = {
            "azimuth": payload["azimuth"],
            "slope": payload["slope"],
            "weatherData": payload["weatherFile"],
            "year": payload["year"]
        }


        resp = requests.post(url, data=data, files=files)
        resp.raise_for_status()
        return resp.json()
