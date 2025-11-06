from fastapi import FastAPI, HTTPException, Request, Response
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import httpx, os
import uvicorn
import logging 

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

SERVICES = {
   "PYTHON": f"http://python:{os.getenv('PYTHON', '8503')}/",
    "SAVEDATA": f"http://savedata:{os.getenv('SAVED_DATA', '8505')}/",
    "MATLAB": f"http://matlab:{os.getenv('MATLAB', '8504')}/"
}
# logging all the requests, but idk if we need it 
@app.middleware("http")
async def log_requests(request: Request, call_next):
    logging.info(f"Request: {request.method} {request.url}")
    response = await call_next(request)
    logging.info(f"Response: {response.status_code}")
    return response

async def forward_request(service, path, method, body=None, headers=None):
    timeout = httpx.Timeout(10.0)
    async with httpx.AsyncClient(timeout=timeout) as client:
        response = await client.request(
            method=method.upper(),
            url=f"{SERVICES[service]}{path}",
            headers=headers,
            params=body if method.lower() == "get" else None,
            json=body if method.lower() == "post" else None
        )
        response.raise_for_status()
    content_type = response.headers.get("content-type", "")
    if "application/json" in content_type:
        return JSONResponse(content=response.json())
    # elif "application/octet-stream" in content_type:
    #     return JSONResponse(content=response.content)
    else:
        return Response(content=response.content, media_type=content_type)

@app.api_route("/{service}/{path:path}", methods=["GET", "POST"])
async def proxy(service: str, path: str, request: Request):
    service = service.upper()
    if service not in SERVICES:
        raise HTTPException(status_code=404, detail=f"Unknown service: {service}")

    body = await request.json() if request.method != "GET" else dict(request.query_params)
    headers = dict(request.headers)

    return await forward_request(service, path, request.method, body=body, headers=headers)

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