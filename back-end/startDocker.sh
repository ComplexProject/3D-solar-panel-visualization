# Starting docker
docker compose up -d
# running tests
docker exec -it back-end-apigateway-1 pytest -v 
docker exec -it matlab pytest -v
docker exec -it python pytest -v 
docker exec -it routerstrategy pytest -v
docker exec -it savedata pytest -v

# Get back the docker CMD
docker compose logs -f
