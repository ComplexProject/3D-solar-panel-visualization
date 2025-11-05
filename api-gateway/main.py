from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import httpx
import uvicorn

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

SERVICES = {
    "DUMMY": "http://dummydata:8510/"
}

@app.get("/dummy")
async def get_dummy():
    async with httpx.AsyncClient() as client:
        response = await client.get(f"{SERVICES['DUMMY']}getDummy")
        return response.json()

@app.get("/")
def root():
    return {"message": "API Gateway is running"}

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8511, reload=True)
