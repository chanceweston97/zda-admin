# PowerShell script to create .env file for local development
# Run this script: .\setup-local-env.ps1

$envContent = @"
# Medusa Backend Configuration for Local Development

# Database Configuration (PostgreSQL)
# IMPORTANT: Update DATABASE_URL with your PostgreSQL credentials
# Format: postgresql://username:password@host:port/database_name
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/medusa_db

# Server Configuration
MEDUSA_BACKEND_URL=http://localhost:9000

# CORS Configuration (for local development)
# Add your frontend URLs here
STORE_CORS=http://localhost:8000,http://localhost:3000,http://localhost:3001
ADMIN_CORS=http://localhost:9000,http://localhost:7001
AUTH_CORS=http://localhost:9000,http://localhost:8000,http://localhost:3000,http://localhost:3001

# Security Secrets (change these in production!)
JWT_SECRET=supersecret_jwt_secret_change_in_production
COOKIE_SECRET=supersecret_cookie_secret_change_in_production

# Email Configuration (for admin notifications)
# Add your admin email addresses (comma-separated for multiple)
ADMIN_EMAILS=admin@example.com
EMAIL_SERVER_HOST=mail.privateemail.com
EMAIL_SERVER_PORT=587
EMAIL_SERVER_USER=your-email@yourdomain.com
EMAIL_SERVER_PASSWORD=your-email-password
EMAIL_FROM=your-email@yourdomain.com

# Optional: Redis (for improved performance, optional for local dev)
# Uncomment if you have Redis running locally
# REDIS_URL=redis://localhost:6379
"@

$envFile = ".env"

if (Test-Path $envFile) {
    Write-Host '⚠️  .env file already exists!' -ForegroundColor Yellow
    $overwrite = Read-Host 'Do you want to overwrite it? (y/N)'
    if ($overwrite -ne "y" -and $overwrite -ne "Y") {
        Write-Host '❌ Cancelled. Existing .env file preserved.' -ForegroundColor Red
        exit
    }
}

$envContent | Out-File -FilePath $envFile -Encoding utf8
Write-Host '✅ Created .env file successfully!' -ForegroundColor Green
Write-Host ''
Write-Host '📝 Next steps:' -ForegroundColor Cyan
Write-Host '1. Update DATABASE_URL with your PostgreSQL credentials' -ForegroundColor White
Write-Host '2. Update ADMIN_EMAILS with your admin email address(es)' -ForegroundColor White
Write-Host '3. Update email configuration if needed' -ForegroundColor White
Write-Host '4. Run: yarn install' -ForegroundColor White
Write-Host '5. Run: yarn build' -ForegroundColor White
Write-Host '6. Run: npx medusa db:migrate' -ForegroundColor White
Write-Host '7. Run: npx medusa user -e admin@medusa.local -p supersecret' -ForegroundColor White
Write-Host '8. Run: yarn dev' -ForegroundColor White
Write-Host ""

