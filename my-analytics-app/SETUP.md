# Setup Guide

This guide will help you set up the Analytics Dashboard project from scratch.

## Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** >= 18
- **Neon Postgres** (serverless PostgreSQL) - Sign up at https://console.neon.tech
- **Python** 3.8+ (for vanna service)
- **pnpm** (package manager) - Install via `npm install -g pnpm`

## Step 1: Clone and Install Dependencies

```bash
# Navigate to the project directory
cd my-analytics-app

# Install all dependencies
pnpm install
```

## Step 2: Set Up Neon Postgres Database

1. **Create Neon Account and Database:**
   - Go to https://console.neon.tech
   - Sign up or log in
   - Create a new project
   - Create a database (or use the default one)

2. **Get Connection String:**
   - Copy the connection string from the Neon dashboard
   - Use the **pooled connection** (recommended) for serverless environments
   - Format: `postgresql://user:password@ep-xxx-xxx-pooler.region.aws.neon.tech/dbname?sslmode=require`

3. **See [NEON_SETUP.md](./NEON_SETUP.md)** for detailed Neon setup instructions

## Step 3: Configure Environment Variables

### For Web (apps/web)

Create `apps/web/.env.local`:

```env
# Neon Postgres - Pooled Connection (recommended)
DATABASE_URL=postgresql://user:password@ep-xxx-xxx-pooler.region.aws.neon.tech/dbname?sslmode=require

# Optional: Direct connection for migrations
# DIRECT_URL=postgresql://user:password@ep-xxx-xxx.region.aws.neon.tech/dbname?sslmode=require

VANNA_API_BASE_URL=http://localhost:8000
```

**Note:**

- Replace the connection string with your actual Neon connection string from https://console.neon.tech
- Use the pooled connection (with `-pooler` in hostname) for better performance in serverless environments
- See [NEON_SETUP.md](./NEON_SETUP.md) for detailed setup instructions

### For Vanna (apps/vanna)

Create `apps/vanna/.env`:

```env
# Neon Postgres - Direct Connection
DATABASE_URL=postgresql+psycopg2://user:password@ep-xxx-xxx.region.aws.neon.tech/dbname?sslmode=require
GROQ_API_KEY=dummy
PORT=8000
```

**Note:** Replace the connection string with your actual Neon connection string from https://console.neon.tech

## Step 4: Set Up Database Schema

```bash
cd apps/web

# Generate Prisma Client
pnpm prisma generate

# Run database migrations
pnpm prisma migrate dev --name init

# Seed the database
pnpm prisma:seed
```

## Step 5: Set Up Python Dependencies (Vanna Service)

```bash
cd apps/vanna

# Create a virtual environment (recommended)
python -m venv venv

# Activate virtual environment
# On Windows:
venv\Scripts\activate
# On macOS/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt
```

## Step 6: Verify Setup

1. **Start the API server:**

   ```bash
   cd apps/api
   pnpm dev
   ```

   Should start on http://localhost:3001

2. **Start the Vanna service:**

   ```bash
   cd apps/vanna
   pnpm dev
   # Or: uvicorn main:app --reload --port 8000
   ```

   Should start on http://localhost:8000

## Step 7: Run All Services Together

Since Turbo doesn't natively support Python, you have two options:

### Option 1: Use Turbo for Node.js services, run Vanna separately

Terminal 1 (Node.js services):

```bash
pnpm dev
```

Terminal 2 (Vanna service):

```bash
cd apps/vanna
pnpm dev
```

### Option 2: Use a process manager like `concurrently`

Install concurrently globally:

```bash
npm install -g concurrently
```

Then run:

```bash
concurrently "pnpm dev" "cd apps/vanna && pnpm dev"
```

## Troubleshooting

### Database Connection Issues

- Verify PostgreSQL is running: `pg_isready`
- Check DATABASE_URL format: `postgresql://user:password@host:port/database`
- Ensure database exists: `psql -l | grep analytics`

### Port Already in Use

- Change ports in `.env` files if 3000, 3001, or 8000 are in use
- Update `NEXT_PUBLIC_API_BASE` in web `.env.local` if API port changes

### Python/Pip Issues

- Use `python3` and `pip3` if `python` doesn't work
- Ensure virtual environment is activated before installing dependencies
- On Windows, you may need to install `psycopg2-binary` separately

### Prisma Issues

- Run `pnpm prisma generate` after schema changes
- Check `DATABASE_URL` in `apps/api/.env`
- Verify database migrations: `pnpm prisma migrate status`

## Next Steps

Once everything is running:

1. Visit http://localhost:3000/dashboard to see the analytics dashboard
2. Visit http://localhost:3000/chat to try the "Chat with Data" feature
3. Check API health: http://localhost:3001/health
4. Check Vanna health: http://localhost:8000/health

## Development Workflow

1. Make changes to any service
2. Services auto-reload in development mode
3. For API changes, Prisma client regenerates automatically
4. For database changes, create a new migration: `pnpm prisma migrate dev`

## Production Deployment

For production:

1. Set `NODE_ENV=production` in environment variables
2. Build all services: `pnpm build`
3. Use production database (update DATABASE_URL)
4. Configure proper CORS origins
5. Set up proper authentication and authorization
6. Use environment-specific configurations
