from fastapi import FastAPI, HTTPException
from strategies import MatlabStrategy, PythonStrategy

app = FastAPI()

strategies = {
    "matlab": MatlabStrategy(),
    "python": PythonStrategy(),
}

@app.post("/run")
def run_flow(payload: dict):
    flow = payload.get("flow")
    if not flow:
        raise HTTPException(status_code=400, detail="Missing 'flow' in payload")

    strategy = strategies.get(flow)
    if not strategy:
        raise HTTPException(status_code=400, detail=f"Unknown flow '{flow}'")

    return strategy.execute(payload)
