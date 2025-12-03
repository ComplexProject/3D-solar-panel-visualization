import os
import requests
from .base_strategy import FlowStrategy

class PythonStrategy(FlowStrategy):
    async def execute(self, payload: dict):
        python_port = os.getenv("PYTHON", "8503")
        url = f"http://python:{python_port}/getData"

        params = {
            "azimuth": 1,
            "slope": 1,
            "latit": payload["latitude"],
            "longit": payload["longitude"],
            "year": payload["year"],
        }

        resp = requests.get(url, params=params)

        return resp.json()
