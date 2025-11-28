import os
import requests
from .base_strategy import FlowStrategy

class MatlabStrategy(FlowStrategy):
    def execute(self, payload: dict):
        matlab_port = os.getenv("MATLAB", "8504")
        url = f"http://matlab:{matlab_port}/runMatlab"

        params = {
            "azimuth": payload["azimuth"],
            "slope": payload["slope"],
            "demandProfile": payload["demandProfile"],
            "weatherData": payload["weatherFile"],
        }

        resp = requests.get(url, params=params)
        resp.raise_for_status()
        return resp.json()
