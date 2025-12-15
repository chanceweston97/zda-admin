# Quick Fix: Connect Local Admin UI to Server Database

## Current Issue
Your `.env` has:
```
DATABASE_URL=postgres://medusa123:medusa123@localhost:5432/medusa123
```

This points to **localhost** database, but you want to use **server database**.

## Fix

Edit `backend/.env` and change the DATABASE_URL line to point to your server:

**Change from:**
```env
DATABASE_URL=postgres://medusa123:medusa123@localhost:5432/medusa123
```

**Change to (replace with your server details):**
```env
DATABASE_URL=postgresql://username:password@18.191.243.236:5432/database_name
```

**Important:** 
- Use `postgresql://` not `postgres://` (more standard)
- Replace `username`, `password`, and `database_name` with your actual server credentials
- Replace `18.191.243.236` with your actual server IP if different

## Example

If your server database credentials are:
- Server IP: 18.191.243.236
- Username: medusa123
- Password: medusa123
- Database: medusa123

Then use:
```env
DATABASE_URL=postgresql://medusa123:medusa123@18.191.243.236:5432/medusa123
```

## After Updating

1. Save the .env file
2. Restart your backend: `yarn dev`
3. Access admin UI: http://localhost:9000/app

## If Connection Fails

The server database must allow remote connections. On your server, check:

1. **PostgreSQL config** (`/etc/postgresql/*/main/pg_hba.conf`):
   ```
   host    all    all    0.0.0.0/0    md5
   ```

2. **PostgreSQL listen** (`/etc/postgresql/*/main/postgresql.conf`):
   ```
   listen_addresses = '*'
   ```

3. **Firewall**: Allow port 5432
   ```bash
   sudo ufw allow 5432/tcp
   ```

4. **Restart PostgreSQL**:
   ```bash
   sudo systemctl restart postgresql
   ```

