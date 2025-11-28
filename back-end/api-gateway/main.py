from urllib import response
from fastapi import FastAPI, HTTPException, Request, Response
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import os
import uvicorn
import httpx

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Router Strategy Service URL
ROUTER_STRATEGY_URL = os.getenv("ROUTER_STRATEGY_URL", "http://routerstrategy:8502")

@app.post("/run")
async def run_flow(payload: dict):
    """
    Forward requests to the router strategy service.
    """
    try:
        async with httpx.AsyncClient() as client:
            response = await client.post(
                f"{ROUTER_STRATEGY_URL}/run",
                json=payload,
                timeout=300.0  # 5 minute timeout for long-running operations
            )
            response.raise_for_status()
            return response.json()
    except httpx.HTTPStatusError as e:
        raise HTTPException(status_code=e.response.status_code, detail=e.response.text)
    except httpx.RequestError as e:
        raise HTTPException(status_code=503, detail=f"Router strategy service unavailable: {str(e)}")

# @app.get("/dummy")
# async def get_dummy():
#     async with httpx.AsyncClient() as client:
#         response = await client.get(f"{SERVICES['DUMMY']}getDummy")
#         return response.json()

# @app.get("/python/{path:path}")
# async def get_python(path: str):
#     async with httpx.AsyncClient() as client:
#         response = await client.get(f"{SERVICES['PYTHON']}{path}")
#         return response.json()

@app.get("/")
def root():
    return {"message": "API Gateway is running"}

if __name__ == "__main__":
    port = int(os.getenv("API_PORT", "8501"))
    uvicorn.run(app, host="0.0.0.0", port=port, reload=True)