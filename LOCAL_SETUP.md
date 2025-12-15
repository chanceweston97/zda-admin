# Local Backend Setup Guide

This guide will help you set up the Medusa backend for local development.

## Prerequisites

1. **PostgreSQL** - Install and running locally
   - Download: https://www.postgresql.org/download/
   - Default port: 5432
   - Create a database: `medusa_db`

2. **Node.js** - v20 or later
   - Download: https://nodejs.org/

3. **Optional: Redis** - For improved performance (not required)
   - Download: https://redis.io/download/

## Setup Steps

### 1. Configure Database

Update `.env` file with your PostgreSQL credentials:

```env
DATABASE_URL=postgresql://username:password@localhost:5432/medusa_db
```

**Common configurations:**

- Default PostgreSQL (username: postgres, no password):
  ```env
  DATABASE_URL=postgresql://postgres@localhost:5432/medusa_db
  ```

- PostgreSQL with password:
  ```env
  DATABASE_URL=postgresql://postgres:your_password@localhost:5432/medusa_db
  ```

- Custom username/password:
  ```env
  DATABASE_URL=postgresql://medusa:medusa@localhost:5432/medusa_db
  ```

**Create the database:**
```sql
-- Connect to PostgreSQL (psql or pgAdmin)
CREATE DATABASE medusa_db;
```

### 2. Configure CORS

Update `.env` with your frontend URLs:

```env
STORE_CORS=http://localhost:8000,http://localhost:3000
ADMIN_CORS=http://localhost:9000
AUTH_CORS=http://localhost:9000,http://localhost:8000,http://localhost:3000
```

Add all frontend URLs you'll use (e.g., if your frontend runs on port 3000, 3001, 8000, etc.)

### 3. Install Dependencies

```bash
cd backend
yarn install
```

### 4. Run Database Migrations

```bash
yarn build
npx medusa db:migrate
```

This creates all necessary database tables.

### 5. Create Admin User

```bash
npx medusa user -e admin@medusa.local -p supersecret
```

**Note:** Change the email and password to your preferences.

### 6. Start the Backend

```bash
yarn dev
```

The backend will start on `http://localhost:9000`

## Access Points

- **Backend API**: http://localhost:9000
- **Admin Panel**: http://localhost:9000/app
- **Store API**: http://localhost:9000/store
- **Admin API**: http://localhost:9000/admin

## Login to Admin Panel

1. Go to: http://localhost:9000/app
2. Use the email/password you created in step 5
3. Default: `admin@medusa.local` / `supersecret`

## Troubleshooting

### Database Connection Error

**Error:** `error: password authentication failed`

**Solution:**
- Check your PostgreSQL username and password in `.env`
- Verify PostgreSQL is running: `pg_isready` or check Services (Windows)
- Verify database exists: `psql -l` (should list `medusa_db`)

### Port Already in Use

**Error:** `Port 9000 is already in use`

**Solution:**
- Change `MEDUSA_BACKEND_URL` in `.env` to use a different port
- Or stop the process using port 9000

### CORS Errors

**Error:** `CORS policy: No 'Access-Control-Allow-Origin' header`

**Solution:**
- Add your frontend URL to `STORE_CORS` in `.env`
- Restart the backend server

### Migrations Failed

**Error:** Migration errors

**Solution:**
```bash
# Reset database (WARNING: deletes all data!)
npx medusa db:reset

# Or manually drop and recreate database
psql -U postgres
DROP DATABASE medusa_db;
CREATE DATABASE medusa_db;
\q

# Then run migrations again
npx medusa db:migrate
```

## Environment Variables Reference

| Variable | Required | Description | Example |
|----------|----------|-------------|---------|
| `DATABASE_URL` | Yes | PostgreSQL connection string | `postgresql://user:pass@localhost:5432/dbname` |
| `MEDUSA_BACKEND_URL` | No | Backend server URL | `http://localhost:9000` |
| `STORE_CORS` | Yes | Frontend URLs (comma-separated) | `http://localhost:3000` |
| `ADMIN_CORS` | Yes | Admin panel URLs | `http://localhost:9000` |
| `AUTH_CORS` | Yes | Authentication allowed URLs | `http://localhost:9000` |
| `JWT_SECRET` | Yes | JWT token secret | Random string |
| `COOKIE_SECRET` | Yes | Cookie encryption secret | Random string |
| `ADMIN_EMAILS` | No | Admin notification emails | `admin@example.com` |
| `REDIS_URL` | No | Redis connection (optional) | `redis://localhost:6379` |

## Next Steps

After backend is running:

1. Set up your frontend to connect to `http://localhost:9000`
2. Get your publishable key from Admin → Settings → API Keys
3. Configure frontend `.env` with backend URL and publishable key

