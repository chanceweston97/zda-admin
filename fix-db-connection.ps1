# Quick fix script to update DATABASE_URL to server
param(
    [string]$ServerIP = "18.191.243.236",
    [string]$DBUser = "medusa123",
    [string]$DBPassword = "medusa123",
    [string]$DBName = "medusa123",
    [string]$DBPort = "5432"
)

$envFile = ".env"

if (-not (Test-Path $envFile)) {
    Write-Host "❌ .env file not found!" -ForegroundColor Red
    exit 1
}

Write-Host "🔧 Updating DATABASE_URL to point to server..." -ForegroundColor Cyan
Write-Host "Server: $ServerIP" -ForegroundColor Yellow
Write-Host "Database: $DBName" -ForegroundColor Yellow
Write-Host ""

# Read .env file
$envContent = Get-Content $envFile -Raw

# Replace DATABASE_URL - handle both postgres:// and postgresql://
# Use postgresql:// as it's more standard and compatible
$newDatabaseUrl = "postgresql://${DBUser}:${DBPassword}@${ServerIP}:${DBPort}/${DBName}"

# Replace any existing DATABASE_URL line (commented or not)
$envContent = $envContent -replace '(?m)^(#\s*)?DATABASE_URL=.*', "DATABASE_URL=$newDatabaseUrl"

# Save updated .env
$envContent | Out-File -FilePath $envFile -Encoding utf8 -NoNewline

Write-Host "✅ Updated DATABASE_URL to: postgresql://${DBUser}:***@${ServerIP}:${DBPort}/${DBName}" -ForegroundColor Green
Write-Host ""
Write-Host "⚠️  If connection still fails, check:" -ForegroundColor Yellow
Write-Host "   1. Server database allows remote connections" -ForegroundColor White
Write-Host "   2. Firewall allows port $DBPort from your IP" -ForegroundColor White
Write-Host "   3. Credentials are correct" -ForegroundColor White
Write-Host ""
Write-Host 'Now try: yarn dev' -ForegroundColor Cyan

