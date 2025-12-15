#!/bin/bash
# Bash script to create .env file for local development
# Run this script: bash setup-local-env.sh

ENV_FILE=".env"

if [ -f "$ENV_FILE" ]; then
    echo "⚠️  .env file already exists!"
    read -p "Do you want to overwrite it? (y/N) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo "❌ Cancelled. Existing .env file preserved."
        exit
    fi
fi

cat > "$ENV_FILE" << 'EOF'
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
EOF

echo "✅ Created .env file successfully!"
echo ""
echo "📝 Next steps:"
echo "1. Update DATABASE_URL with your PostgreSQL credentials"
echo "2. Update ADMIN_EMAILS with your admin email address(es)"
echo "3. Update email configuration if needed"
echo "4. Run: yarn install"
echo "5. Run: yarn build"
echo "6. Run: npx medusa db:migrate"
echo "7. Run: npx medusa user -e admin@medusa.local -p supersecret"
echo "8. Run: yarn dev"

chmod +x setup-local-env.sh

