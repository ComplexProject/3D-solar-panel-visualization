#!/bin/bash
docker compose down
docker compose build --no-cache
docker compose up

# find / -name "*.mat" 2>/dev/null
