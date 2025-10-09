FROM python:latest

WORKDIR /app

COPY requirements.txt ./

RUN pip install --upgrade pip
RUN pip install -r requirements.txt

COPY . . 


EXPOSE ${SAVED_DATA}
CMD uvicorn main:app --host 0.0.0.0 --port ${SAVED_DATA} --reload