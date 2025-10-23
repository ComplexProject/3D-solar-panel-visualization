FROM python:3.11-slim-bookworm

WORKDIR /app

RUN apt-get update && \
    apt-get install -y --no-install-recommends \
    octave \
    gnuplot \
    liboctave-dev \
    && apt-get clean && \
    rm -rf /var/lib/apt/lists/*


COPY requirements.txt ./

RUN pip install --upgrade pip
RUN pip install -r requirements.txt

COPY . . 



EXPOSE ${MATLAB}
CMD uvicorn main:app --host 0.0.0.0 --port ${MATLAB} --reload 