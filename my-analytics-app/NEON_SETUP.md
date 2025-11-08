# Neon Postgres Setup Guide

This guide will help you set up the Analytics Dashboard with Neon Postgres (serverless PostgreSQL).

## What is Neon?

Neon is a serverless Postgres database that separates storage and compute, offering:

- **Automatic scaling** - No need to manage database instances
- **Connection pooling** - Built-in pooler for better performance
- **Branching** - Create database branches for testing
- **Free tier** - Generous free tier for development

## Step 1: Create Neon Account and Database

1. **Sign up for Neon**:
   - Go to https://console.neon.tech
   - Sign up or log in with GitHub, Google, or email

2. **Create a Project**:
   - Click "Create Project"
   - Choose a project name (e.g., "analytics-dashboard")
   - Select a region (choose closest to your deployment)
   - Click "Create Project"

3. **Get Connection String**:
   - Once the project is created, you'll see the connection details
   - Copy the connection string (looks like: `postgresql://user:password@ep-xxx-xxx.region.aws.neon.tech/dbname`)
   - You'll see options for:
     - **Connection pooling** (recommended for serverless)
     - **Direct connection** (for migrations)

## Step 2: Configure Connection Strings

### For Next.js App (apps/web/.env.local)

Neon provides two types of connections:

1. **Pooled Connection** (Recommended for serverless):

   ```
   postgresql://user:password@ep-xxx-xxx-pooler.region.aws.neon.tech/dbname?sslmode=require
   ```

   - Use this for `DATABASE_URL` in production and development
   - Better for serverless environments (Next.js API routes)
   - Handles connection pooling automatically

2. **Direct Connection** (For migrations):

   ```
   postgresql://user:password@ep-xxx-xxx.region.aws.neon.tech/dbname?sslmode=require
   ```

   - Use this for `DIRECT_URL` (optional, only if needed for migrations)
   - Required for some Prisma migrations

### For Vanna Service (apps/vanna/.env)

Use the direct connection string:

```
postgresql+psycopg2://user:password@ep-xxx-xxx.region.aws.neon.tech/dbname?sslmode=require
```

## Step 3: Update Environment Variables

### apps/web/.env.local

```env
# Neon Postgres - Pooled Connection (recommended)
DATABASE_URL=postgresql://user:password@ep-xxx-xxx-pooler.region.aws.neon.tech/dbname?sslmode=require

# Optional: Direct connection for migrations
# DIRECT_URL=postgresql://user:password@ep-xxx-xxx.region.aws.neon.tech/dbname?sslmode=require

# Vanna AI Service
VANNA_API_BASE_URL=http://localhost:8000
```

### apps/vanna/.env

```env
# Neon Postgres - Direct Connection
DATABASE_URL=postgresql+psycopg2://user:password@ep-xxx-xxx.region.aws.neon.tech/dbname?sslmode=require

# Groq API Key
GROQ_API_KEY=dummy

# Server Port
PORT=8000
```

## Step 4: Run Migrations

```bash
cd apps/web

# Generate Prisma Client
pnpm prisma generate

# Run migrations (will use DATABASE_URL or DIRECT_URL if set)
pnpm prisma migrate dev --name init

# Seed the database
pnpm prisma:seed
```

## Step 5: Verify Connection

### Test from Next.js App

1. Start the development server:

   ```bash
   cd apps/web
   pnpm dev
   ```

2. Visit http://localhost:3000/api/health
   - Should return: `{"status":"ok"}`

3. Visit http://localhost:3000/api/stats
   - Should return statistics from the database

### Test from Vanna Service

1. Start the Vanna service:

   ```bash
   cd apps/vanna
   pnpm dev
   ```

2. Test the health endpoint:

   ```bash
   curl http://localhost:8000/health
   ```

   - Should return: `{"status":"ok"}`

## Troubleshooting

### Connection Errors

**Error: "Connection refused" or "Connection timeout"**

- Verify your connection string is correct
- Check that SSL mode is set: `?sslmode=require`
- Ensure your IP is allowed (Neon allows all IPs by default)

**Error: "SSL connection required"**

- Add `?sslmode=require` to your connection string
- Neon requires SSL connections

### Migration Issues

**Error: "Migration failed"**

- Try using `DIRECT_URL` for migrations:
  ```env
  DIRECT_URL=postgresql://user:password@ep-xxx-xxx.region.aws.neon.tech/dbname?sslmode=require
  ```
- Some Prisma migrations require direct connections

**Error: "Too many connections"**

- Use the pooled connection string (with `-pooler` in the hostname)
- Pooled connections handle connection limits better

### Prisma Issues

**Error: "Prisma Client not generated"**

- Run: `pnpm prisma generate`
- Ensure `DATABASE_URL` is set correctly

**Error: "Schema not found"**

- Run migrations: `pnpm prisma migrate dev`
- Check that the schema file exists at `apps/web/prisma/schema.prisma`

## Best Practices

1. **Use Pooled Connections**: Always use the pooled connection string for production and serverless environments.

2. **Environment Variables**: Never commit connection strings to version control. Use environment variables.

3. **Connection Limits**: Neon's free tier has connection limits. Use connection pooling to optimize.

4. **SSL**: Always use SSL (`sslmode=require`) for security.

5. **Direct URL for Migrations**: If migrations fail with pooled connection, use `DIRECT_URL` for migrations only.

## Neon Dashboard Features

- **Database Branches**: Create branches for testing (like Git branches)
- **Connection Pooling**: Automatic connection pooling enabled
- **Metrics**: Monitor database performance and usage
- **Backups**: Automatic backups (available on paid plans)
- **Logs**: View query logs and performance metrics

## Resources

- [Neon Documentation](https://neon.tech/docs)
- [Neon Console](https://console.neon.tech)
- [Prisma + Neon Guide](https://www.prisma.io/docs/guides/deployment/deployment-guides/deploying-to-neon)
- [Connection Pooling](https://neon.tech/docs/connect/connection-pooling)

## Next Steps

1. Set up your Neon database
2. Update environment variables
3. Run migrations
4. Seed the database
5. Start developing!

For more help, see:

- [SETUP.md](./SETUP.md) - General setup guide
- [ENV_SETUP.md](./ENV_SETUP.md) - Environment variables guide
- [QUICKSTART.md](./QUICKSTART.md) - Quick start guide
