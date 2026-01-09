# start_and_test.ps1
<#
.SYNOPSIS
    Starts Docker containers, waits for healthchecks, runs tests, and attaches to logs.
#>

# Ensure errors stop the script
$ErrorActionPreference = "Stop"

# List of services to test
$containers = @("back-end-api-gateway-1", "matlab", "python", "routerstrategy", "savedata")

Write-Host "=== Starting all containers in detached mode ==="
docker compose up -d

# Optional: wait for containers to be healthy
Write-Host "=== Waiting for containers to become healthy (up to 30s) ==="
foreach ($c in $containers) {
    $maxWait = 30
    $waited = 0
    while ($waited -lt $maxWait) {
        $status = docker inspect --format='{{.State.Health.Status}}' $c 2>$null
        if ($status -eq "healthy" -or $status -eq "") { break }
        Start-Sleep -Seconds 1
        $waited++
    }
    if ($status -ne "healthy" -and $status -ne "") {
        Write-Warning "$c did not report healthy status after $maxWait seconds"
    } else {
        Write-Host "$c is healthy or no healthcheck defined"
    }
}

# Run tests in each container
Write-Host "=== Running tests in all containers ==="
foreach ($c in $containers) {
    Write-Host "`n===== Running tests in $c ====="
    docker exec -it $c pytest -v
    if ($LASTEXITCODE -ne 0) {
        Write-Error "Tests failed in $c. Exiting script."
        exit 1
    }
}

Write-Host "`n=== All tests completed successfully! ==="

# Attach to live logs
Write-Host "`n=== Attaching to container logs (Ctrl+C to stop) ==="
docker compose logs -f
