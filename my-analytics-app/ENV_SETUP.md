# Environment Variables Setup

This document describes all environment variables required for each service.

## apps/web/.env.local

Create this file in `apps/web/` (Next.js uses `.env.local`):

```env
# Database URL (Neon Postgres)
# For connection pooling (recommended for serverless): Use Neon's pooler endpoint
# Format: postgresql://user:password@ep-xxx-xxx.region.aws.neon.tech/dbname?sslmode=require
# Or with pgbouncer: postgresql://user:password@ep-xxx-xxx-pooler.region.aws.neon.tech/dbname?sslmode=require
DATABASE_URL=postgresql://user:password@ep-xxx-xxx-pooler.region.aws.neon.tech/dbname?sslmode=require

# Direct URL (optional, for migrations)
# Use direct connection for migrations if using pooled connection above
# DIRECT_URL=postgresql://user:password@ep-xxx-xxx.region.aws.neon.tech/dbname?sslmode=require

# Vanna AI Service URL (FastAPI) - used by API routes
VANNA_API_BASE_URL=http://localhost:8000
```

**Note:**

- The frontend uses relative API routes (`/api/*`), so no `NEXT_PUBLIC_API_BASE` is needed.
- For Neon Postgres, use the pooled connection string for better performance in serverless environments.
- Get your connection string from the Neon dashboard: https://console.neon.tech

## apps/vanna/.env

Create this file in `apps/vanna/`:

```env
# Database URL (Neon Postgres with psycopg2 driver)
# Format: postgresql+psycopg2://user:password@ep-xxx-xxx.region.aws.neon.tech/dbname?sslmode=require
# Can use pooled or direct connection
DATABASE_URL=postgresql+psycopg2://user:password@ep-xxx-xxx.region.aws.neon.tech/dbname?sslmode=require

# Groq API Key (for future LLM integration)
GROQ_API_KEY=dummy

# Server Port (default: 8000)
PORT=8000
```

**Note:** Get your Neon connection string from https://console.neon.tech

## Quick Setup Script

You can create these files manually or use the following commands:

### Windows (PowerShell)

```powershell
# Web (Next.js with API routes)
# Replace with your Neon connection string from https://console.neon.tech
@"
DATABASE_URL=postgresql://user:password@ep-xxx-xxx-pooler.region.aws.neon.tech/dbname?sslmode=require
VANNA_API_BASE_URL=http://localhost:8000
"@ | Out-File -FilePath "apps/web/.env.local" -Encoding utf8

# Vanna
# Replace with your Neon connection string
@"
DATABASE_URL=postgresql+psycopg2://user:password@ep-xxx-xxx.region.aws.neon.tech/dbname?sslmode=require
GROQ_API_KEY=dummy
PORT=8000
"@ | Out-File -FilePath "apps/vanna/.env" -Encoding utf8
```

### macOS/Linux

```bash
# Web (Next.js with API routes)
# Replace with your Neon connection string from https://console.neon.tech
cat > apps/web/.env.local << EOF
DATABASE_URL=postgresql://user:password@ep-xxx-xxx-pooler.region.aws.neon.tech/dbname?sslmode=require
VANNA_API_BASE_URL=http://localhost:8000
EOF

# Vanna
# Replace with your Neon connection string
cat > apps/vanna/.env << EOF
DATABASE_URL=postgresql+psycopg2://user:password@ep-xxx-xxx.region.aws.neon.tech/dbname?sslmode=require
GROQ_API_KEY=dummy
PORT=8000
EOF
```

**Important**: Replace the connection strings above with your actual Neon Postgres connection string from https://console.neon.tech

## Important Notes

### For Neon Postgres:

1. **Get Connection String**:
   - Sign up/login at https://console.neon.tech
   - Create a new project and database
   - Copy the connection string from the dashboard
   - Use the **pooled connection** (recommended) for serverless environments

2. **Connection String Formats**:
   - **Pooled (Recommended)**: `postgresql://user:pass@ep-xxx-xxx-pooler.region.aws.neon.tech/dbname?sslmode=require`
   - **Direct**: `postgresql://user:pass@ep-xxx-xxx.region.aws.neon.tech/dbname?sslmode=require`
   - For migrations, you may need the direct connection URL

3. **SSL Mode**: Neon requires SSL connections, so `?sslmode=require` is included in the connection string.

4. **Connection Pooling**:
   - Use pooled connections for better performance in serverless environments (Next.js API routes)
   - Prisma handles connection pooling automatically with Neon

### General Notes:

1. **Never Commit**: These `.env` files should be in `.gitignore` and never committed to version control.

2. **Production**: In production, use secure methods to manage environment variables (e.g., secrets management, environment variable injection).

3. **Environment Variables**: Use your platform's environment variable management (Vercel, Railway, etc.) for production deployments.

## Verification

After creating the files, verify they exist:

```bash
# Check Web
cat apps/web/.env.local

# Check Vanna
cat apps/vanna/.env
```
