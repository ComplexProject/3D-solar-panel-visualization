FROM python:3.11-slim

WORKDIR /app

COPY requirements.txt ./

RUN pip install --upgrade pip && \
    pip install -r requirements.txt

COPY . .

ENV API_PORT=${API_PORT}
EXPOSE ${API_PORT}

CMD ["sh", "-c", "uvicorn main:app --host 0.0.0.0 --port ${API_PORT:-8501} --reload"]
