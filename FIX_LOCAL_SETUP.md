# Fix: Local Admin UI with Server Database

## Problem
You want to run the Medusa Admin UI locally but connect to your remote server database.

## Solution

### Option 1: Use the Update Script (Recommended)

Run the PowerShell script to update your .env file:

```powershell
.\update-env-for-server-db.ps1
```

The script will ask you for:
- Server IP/Hostname (e.g., 18.191.243.236)
- Database Port (default: 5432)
- Database Username
- Database Password
- Database Name

### Option 2: Manual Update

Edit your `backend/.env` file and update:

```env
# Change from localhost to your server
DATABASE_URL=postgresql://username:password@your-server-ip:5432/database_name

# Keep backend running locally
MEDUSA_BACKEND_URL=http://localhost:9000

# Ensure CORS is set for local admin
STORE_CORS=http://localhost:3000,http://localhost:8000
ADMIN_CORS=http://localhost:9000,http://localhost:7001
AUTH_CORS=http://localhost:9000,http://localhost:8000,http://localhost:3000

# Security secrets (can use server's secrets or different ones)
JWT_SECRET=your_jwt_secret
COOKIE_SECRET=your_cookie_secret

# Admin emails
ADMIN_EMAILS=your-email@example.com
```

**Example:**
```env
DATABASE_URL=postgresql://medusa123:medusa123@18.191.243.236:5432/medusa123
MEDUSA_BACKEND_URL=http://localhost:9000
```

## Important: Server Database Must Allow Remote Connections

### 1. Check PostgreSQL Configuration

On your server, edit `/etc/postgresql/*/main/pg_hba.conf`:

```conf
# Allow connections from your local IP
host    all             all             YOUR_LOCAL_IP/32        md5
# Or allow from anywhere (less secure)
host    all             all             0.0.0.0/0               md5
```

### 2. Check PostgreSQL Listen Address

On your server, edit `/etc/postgresql/*/main/postgresql.conf`:

```conf
listen_addresses = '*'  # Or specific IPs
```

### 3. Restart PostgreSQL

```bash
sudo systemctl restart postgresql
```

### 4. Check Firewall

Make sure port 5432 is open:

```bash
# Check if port is listening
sudo netstat -tlnp | grep 5432

# If using ufw
sudo ufw allow 5432/tcp

# If using iptables
sudo iptables -A INPUT -p tcp --dport 5432 -j ACCEPT
```

## Common Issues

### Connection Refused

**Error:** `connect ECONNREFUSED`

**Solutions:**
- Check server IP is correct
- Check port is correct (5432)
- Check firewall allows connections
- Check PostgreSQL is running on server

### Authentication Failed

**Error:** `password authentication failed`

**Solutions:**
- Verify username and password are correct
- Check pg_hba.conf allows md5 authentication
- Try using `trust` temporarily to test connection

### Database Does Not Exist

**Error:** `database "xxx" does not exist`

**Solutions:**
- Verify database name is correct
- List databases: `psql -l` on server
- Create database if needed: `CREATE DATABASE medusa_db;`

## Testing Connection

Test if you can connect to the server database:

```bash
# Using psql (if installed locally)
psql -h your-server-ip -U username -d database_name

# Or using connection string
psql "postgresql://username:password@your-server-ip:5432/database_name"
```

## Running the Backend

Once .env is configured:

```bash
cd backend
yarn install
yarn build
yarn dev
```

Access admin UI at: **http://localhost:9000/app**

## Notes

- **Don't run migrations locally** - Database is already set up on server
- **Use same JWT_SECRET/COOKIE_SECRET** - If you want to share admin sessions
- **Keep MEDUSA_BACKEND_URL as localhost** - Admin UI runs locally
- **DATABASE_URL points to server** - All data comes from server

