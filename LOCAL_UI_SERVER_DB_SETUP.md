# Local Admin UI with Server Database Setup

This guide helps you run the Medusa Admin UI locally while connecting to your remote server database.

## Configuration

Your `.env` file needs:
- **DATABASE_URL**: Point to your server database
- **MEDUSA_BACKEND_URL**: Local backend URL (http://localhost:9000)
- **CORS settings**: For local admin access

## Example .env Configuration

```env
# Database: Connect to REMOTE SERVER database
DATABASE_URL=postgresql://username:password@your-server-ip:5432/medusa_db

# Backend: Run locally
MEDUSA_BACKEND_URL=http://localhost:9000

# CORS: Allow local admin access
STORE_CORS=http://localhost:8000,http://localhost:3000
ADMIN_CORS=http://localhost:9000,http://localhost:7001
AUTH_CORS=http://localhost:9000,http://localhost:8000,http://localhost:3000

# Security (can use same secrets as server, or different)
JWT_SECRET=your_jwt_secret
COOKIE_SECRET=your_cookie_secret

# Admin emails
ADMIN_EMAILS=admin@example.com

# Email (optional for local dev)
EMAIL_SERVER_HOST=mail.privateemail.com
EMAIL_SERVER_PORT=587
EMAIL_SERVER_USER=your-email@yourdomain.com
EMAIL_SERVER_PASSWORD=your-password
EMAIL_FROM=your-email@yourdomain.com
```

## Important Notes

1. **Database Connection**: Make sure your server database allows remote connections
   - Check PostgreSQL `pg_hba.conf` allows your IP
   - Check firewall allows port 5432

2. **Don't Run Migrations**: Since you're using the server DB, don't run `npx medusa db:migrate` locally (it's already migrated on server)

3. **Same Secrets**: You might want to use the same JWT_SECRET and COOKIE_SECRET as your server to share sessions

## Steps to Run

1. **Update .env** with server database URL
2. **Install dependencies**: `yarn install`
3. **Build**: `yarn build`
4. **Start**: `yarn dev`

The admin UI will be available at: http://localhost:9000/app

