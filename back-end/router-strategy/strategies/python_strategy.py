import os
import requests
from .base_strategy import FlowStrategy

class PythonStrategy(FlowStrategy):
    def execute(self, payload: dict):
        python_port = os.getenv("PYTHON", "8503")
        url = f"http://python:{python_port}/getData"

        params = {
            "azimuth": payload["azimuth"],
            "slope": payload["slope"],
            "latit": payload["lat"],
            "longit": payload["lon"],
            "year": payload["year"],
        }

        resp = requests.get(url, params=params)
        resp.raise_for_status()
        return resp.json()
