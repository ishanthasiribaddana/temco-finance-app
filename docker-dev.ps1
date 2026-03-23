# =============================================================================
# Finance App - Docker Development Helper Script (PowerShell)
# =============================================================================
# Usage:
#   .\docker-dev.ps1 up      # Start local environment
#   .\docker-dev.ps1 down    # Stop local environment
#   .\docker-dev.ps1 logs    # View logs
#   .\docker-dev.ps1 build   # Rebuild containers
# =============================================================================

param(
    [Parameter(Position=0)]
    [string]$Command = "up"
)

$BASE = "docker-compose.base.yml"
$LOCAL = "docker-compose.local.yml"
$ENV_FILE = ".env.local"

if (-not (Test-Path $ENV_FILE)) {
    Copy-Item ".env.local.example" $ENV_FILE -ErrorAction SilentlyContinue
    Write-Host "Created $ENV_FILE from template" -ForegroundColor Yellow
}

switch ($Command) {
    "up" {
        Write-Host "Starting Finance App local environment..." -ForegroundColor Green
        docker-compose -f $BASE -f $LOCAL --env-file $ENV_FILE up -d
    }
    "down" {
        Write-Host "Stopping Finance App..." -ForegroundColor Yellow
        docker-compose -f $BASE -f $LOCAL --env-file $ENV_FILE down
    }
    "logs" {
        docker-compose -f $BASE -f $LOCAL --env-file $ENV_FILE logs -f
    }
    "build" {
        Write-Host "Rebuilding containers..." -ForegroundColor Cyan
        docker-compose -f $BASE -f $LOCAL --env-file $ENV_FILE up -d --build
    }
    "clean" {
        Write-Host "Cleaning and rebuilding..." -ForegroundColor Red
        docker-compose -f $BASE -f $LOCAL --env-file $ENV_FILE down -v
        docker-compose -f $BASE -f $LOCAL --env-file $ENV_FILE up -d --build
    }
    "ps" {
        docker-compose -f $BASE -f $LOCAL --env-file $ENV_FILE ps
    }
    default {
        Write-Host "Usage: .\docker-dev.ps1 [up|down|logs|build|clean|ps]"
    }
}
