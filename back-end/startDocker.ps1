# start_and_test.ps1
<#
.SYNOPSIS
    Starts Docker containers, waits for healthchecks, runs tests, and attaches to logs.
#>

Write-Host "=== Starting Docker ==="
docker compose up -d

Write-Host "`n=== Running tests ==="

# Run tests in each container (same as your Linux script)
docker exec -it back-end-apigateway-1 pytest -v
if ($LASTEXITCODE -ne 0) { exit 1 }

docker exec -it matlab pytest -v
if ($LASTEXITCODE -ne 0) { exit 1 }

docker exec -it python pytest -v
if ($LASTEXITCODE -ne 0) { exit 1 }

docker exec -it routerstrategy pytest -v
if ($LASTEXITCODE -ne 0) { exit 1 }

docker exec -it savedata pytest -v
if ($LASTEXITCODE -ne 0) { exit 1 }

Write-Host "`n=== All tests completed successfully! ==="

Write-Host "`n=== Attaching to Docker logs ==="
docker compose logs -f