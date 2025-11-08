# Quick Start Guide

Get the Analytics Dashboard running in 5 minutes!

## Prerequisites Check

```bash
# Check Node.js version (>= 18)
node --version

# Check Python (>= 3.8)
python --version

# Check pnpm
pnpm --version
```

**Note**: You'll need a Neon Postgres account. Sign up at https://console.neon.tech

## Step 1: Install Dependencies

```bash
pnpm install
```

## Step 2: Set Up Neon Postgres Database

1. **Sign up for Neon**: Go to https://console.neon.tech and create an account

2. **Create a Project**:
   - Create a new project
   - Choose a region
   - Create a database (or use the default)

3. **Get Connection String**:
   - Copy the connection string from the Neon dashboard
   - Use the **pooled connection** (recommended) for serverless
   - Format: `postgresql://user:password@ep-xxx-xxx-pooler.region.aws.neon.tech/dbname?sslmode=require`

4. **See [NEON_SETUP.md](./NEON_SETUP.md)** for detailed instructions

## Step 3: Create Environment Files

### Quick Setup (Copy and paste into terminal)

**Windows (PowerShell):**

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

**macOS/Linux:**

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

**⚠️ Important:**

- Replace connection strings with your actual Neon Postgres connection string
- Get your connection string from https://console.neon.tech
- Use the pooled connection (with `-pooler` in hostname) for better performance
- See [NEON_SETUP.md](./NEON_SETUP.md) for detailed setup instructions

## Step 4: Initialize Database

```bash
cd apps/web

# Generate Prisma Client
pnpm prisma generate

# Run migrations
pnpm prisma migrate dev --name init

# Seed database
pnpm prisma:seed
```

## Step 5: Install Python Dependencies

```bash
cd apps/vanna

# Create virtual environment (recommended)
python -m venv venv

# Activate virtual environment
# Windows:
venv\Scripts\activate
# macOS/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt
```

## Step 6: Start Services

### Option 1: Run All Together (Recommended)

**Terminal 1 - Web (includes API routes):**

```bash
cd apps/web
pnpm dev
```

**Terminal 2 - Vanna:**

```bash
cd apps/vanna
pnpm dev
```

## Step 7: Verify Everything Works

1. **Check Web API:** http://localhost:3000/api/health
   - Should return: `{"status":"ok"}`

2. **Check Vanna:** http://localhost:8000/health
   - Should return: `{"status":"ok"}`

3. **Check Web:** http://localhost:3000
   - Should show the home page

4. **Visit Dashboard:** http://localhost:3000/dashboard
   - Should show analytics dashboard with charts

5. **Visit Chat:** http://localhost:3000/chat
   - Should show "Chat with Data" interface

## 🎉 You're Done!

The application should now be running. Try these:

- **Dashboard:** View analytics, charts, and invoice tables
- **Chat:** Ask questions like "What is the total spend?" or "Show me top 10 vendors"

## Troubleshooting

### Database Connection Error

- Verify DATABASE_URL in `apps/web/.env.local` matches your Neon connection string
- Check that `?sslmode=require` is included in the connection string
- Verify your Neon database is accessible from https://console.neon.tech
- Ensure you're using the correct connection string (pooled vs direct)

### Port Already in Use

- Change PORT in `.env` files
- Update `NEXT_PUBLIC_API_BASE` in web `.env.local` if API port changes

### Python/Pip Issues

- Use `python3` and `pip3` if `python` doesn't work
- Ensure virtual environment is activated
- On Windows, you may need to install `psycopg2-binary` separately

### Prisma Issues

- Run `pnpm prisma generate` after schema changes (in `apps/web`)
- Check `DATABASE_URL` in `apps/web/.env.local`
- Verify migrations: `pnpm prisma migrate status` (in `apps/web`)

## Next Steps

- Read [SETUP.md](./SETUP.md) for detailed setup instructions
- Read [PROJECT_ANALYSIS.md](./PROJECT_ANALYSIS.md) for project overview
- Read [ENV_SETUP.md](./ENV_SETUP.md) for environment variable details

## Need Help?

Check the documentation:

- [README.md](./README.md) - Project overview
- [SETUP.md](./SETUP.md) - Detailed setup guide
- [ENV_SETUP.md](./ENV_SETUP.md) - Environment variables
- [PROJECT_ANALYSIS.md](./PROJECT_ANALYSIS.md) - Project analysis
