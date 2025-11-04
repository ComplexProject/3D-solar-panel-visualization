FROM python:latest

WORKDIR /app

COPY requirements.txt ./

RUN pip install --upgrade pip
RUN pip install -r requirements.txt

COPY . . 


EXPOSE ${API_PORT}
CMD uvicorn main:app --host 0.0.0.0 --port ${API_PORT} --reload 