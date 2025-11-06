from urllib import response
from fastapi import FastAPI, HTTPException, Request, Response
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import os
import uvicorn

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

async def proxy(service: str, path: str, request: Request):
    service = service.upper()

    body = await request.json() if request.method != "GET" else dict(request.query_params)
    headers = dict(request.headers)

    return await response.json()

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