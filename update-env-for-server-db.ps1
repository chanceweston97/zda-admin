# PowerShell script to update .env for server database connection
# Run: .\update-env-for-server-db.ps1

$envFile = ".env"

if (-not (Test-Path $envFile)) {
    Write-Host "❌ .env file not found!" -ForegroundColor Red
    exit 1
}

Write-Host "📝 Updating .env to use SERVER database..." -ForegroundColor Cyan
Write-Host ""
Write-Host "Please provide your SERVER database details:" -ForegroundColor Yellow

$serverHost = Read-Host "Server IP/Hostname (e.g., 18.191.243.236)"
$serverPort = Read-Host "Database Port [5432]"
if ([string]::IsNullOrWhiteSpace($serverPort)) { $serverPort = "5432" }

$dbUser = Read-Host "Database Username"
$dbPassword = Read-Host "Database Password" -AsSecureString
$dbPasswordPlain = [Runtime.InteropServices.Marshal]::PtrToStringAuto([Runtime.InteropServices.Marshal]::SecureStringToBSTR($dbPassword))
$dbName = Read-Host "Database Name"

# Read current .env
$envContent = Get-Content $envFile -Raw

# Update DATABASE_URL - handle both postgres:// and postgresql://
# Use postgresql:// as it's more standard
$newDatabaseUrl = "postgresql://${dbUser}:${dbPasswordPlain}@${serverHost}:${serverPort}/${dbName}"

# Replace DATABASE_URL (handle commented and uncommented)
$envContent = $envContent -replace '(?m)^(#\s*)?DATABASE_URL=.*', "DATABASE_URL=$newDatabaseUrl"

# Ensure MEDUSA_BACKEND_URL is set to localhost
$envContent = $envContent -replace '(?m)^(#\s*)?MEDUSA_BACKEND_URL=.*', "MEDUSA_BACKEND_URL=http://localhost:9000"

# Ensure CORS settings are set
if ($envContent -notmatch '(?m)^STORE_CORS=') {
    $envContent += "`nSTORE_CORS=http://localhost:3000,http://localhost:8000`n"
}
if ($envContent -notmatch '(?m)^ADMIN_CORS=') {
    $envContent += "ADMIN_CORS=http://localhost:9000,http://localhost:7001`n"
}
if ($envContent -notmatch '(?m)^AUTH_CORS=') {
    $envContent += "AUTH_CORS=http://localhost:9000,http://localhost:8000,http://localhost:3000`n"
}

# Save updated .env
$envContent | Out-File -FilePath $envFile -Encoding utf8 -NoNewline

Write-Host ""
Write-Host "✅ .env updated successfully!" -ForegroundColor Green
Write-Host ""
Write-Host "📋 Updated DATABASE_URL: postgresql://${dbUser}:***@${serverHost}:${serverPort}/${dbName}" -ForegroundColor Cyan
Write-Host ""
Write-Host "⚠️  IMPORTANT: Make sure your server database allows remote connections!" -ForegroundColor Yellow
Write-Host "   - Check PostgreSQL pg_hba.conf allows your IP" -ForegroundColor White
Write-Host "   - Check firewall allows port $serverPort from your IP" -ForegroundColor White
Write-Host ""
Write-Host "📝 Next steps:" -ForegroundColor Cyan
Write-Host "1. yarn install" -ForegroundColor White
Write-Host "2. yarn build" -ForegroundColor White
Write-Host "3. yarn dev" -ForegroundColor White
Write-Host ""
Write-Host "Admin UI will be available at: http://localhost:9000/app" -ForegroundColor Green

