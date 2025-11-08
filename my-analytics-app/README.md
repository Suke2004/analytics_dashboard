# Analytics Dashboard - Full-Stack Monorepo

A production-grade monorepo using Turborepo containing:

- **apps/web**: Next.js 14 full-stack app with API routes, analytics dashboard, and Prisma ORM
- **apps/vanna**: FastAPI Python service for "Chat with Data"
- **apps/data**: Dataset and seed scripts

## 🏗️ Project Structure

```
analytics-app/
├── apps/
│   ├── web/        → Next.js 14 full-stack app (TypeScript, Tailwind, shadcn/ui, Recharts, Prisma, API Routes)
│   ├── vanna/      → FastAPI backend (Python) for AI-powered SQL generation
│   └── data/       → Dataset + seed scripts
├── packages/       → Shared packages
├── turbo.json      → Turborepo configuration
└── package.json    → Root package.json
```

## 🚀 Getting Started

> **Quick Start?** See [QUICKSTART.md](./QUICKSTART.md) for a 5-minute setup guide.

### Prerequisites

- Node.js >= 18
- **Neon Postgres** (serverless PostgreSQL) - Sign up at https://console.neon.tech
- Python 3.8+ (for vanna service)
- pnpm (package manager)

### Setup

> For detailed setup instructions, see [SETUP.md](./SETUP.md)

1. **Install dependencies:**

   ```bash
   pnpm install
   ```

2. **Set up Neon Postgres database:**
   - Sign up at https://console.neon.tech
   - Create a new project and database
   - Copy your connection string from the dashboard
   - See [NEON_SETUP.md](./NEON_SETUP.md) for detailed instructions

3. **Configure environment variables:**

   See [ENV_SETUP.md](./ENV_SETUP.md) for details on creating environment files.

4. **Set up database schema:**

   ```bash
   cd apps/web
   pnpm prisma generate
   pnpm prisma migrate dev --name init
   ```

5. **Seed the database:**

   ```bash
   cd apps/web
   pnpm prisma:seed
   ```

6. **Set up Python dependencies (for vanna):**
   ```bash
   cd apps/vanna
   pip install -r requirements.txt
   ```

## 🏃 Running the Project

### Development Mode

Run all services in parallel:

```bash
pnpm dev
```

This will start:

- **Web** (with API routes): http://localhost:3000
- **Vanna**: http://localhost:8000

### Run Individual Services

```bash
# Web (includes API routes)
cd apps/web
pnpm dev

# Vanna
cd apps/vanna
pnpm dev
# Or: uvicorn main:app --reload --port 8000
```

## 📁 Apps Overview

### apps/web

Next.js 14 full-stack application with:

- App Router (pages and API routes)
- TypeScript
- TailwindCSS + shadcn/ui components
- Recharts for data visualization
- Prisma ORM with PostgreSQL
- API Routes (Next.js API endpoints):
  - `GET /api/stats` - Overview statistics
  - `GET /api/invoice-trends` - Invoice trends over time
  - `GET /api/vendors/top10` - Top 10 vendors
  - `GET /api/category-spend` - Spend by category
  - `GET /api/cash-outflow` - Cash outflow trends
  - `GET /api/invoices` - Invoices with search/sort
  - `GET /api/invoices/[id]` - Single invoice details
  - `POST /api/chat-with-data` - Forward queries to Vanna AI
  - `GET /api/health` - Health check
- Pages:
  - `/dashboard` - Analytics dashboard with charts and tables
  - `/chat` - Chat with Data interface

### apps/vanna

FastAPI Python service for:

- Natural language to SQL conversion
- Query execution on PostgreSQL
- Returns SQL and results

**Endpoints:**

- `GET /health` - Health check
- `POST /query` - Process natural language query

## 🗄️ Database Schema

- **Vendor** - Vendor information
- **Customer** - Customer information
- **Invoice** - Invoice records
- **LineItem** - Invoice line items
- **Payment** - Payment records

See `apps/web/prisma/schema.prisma` for full schema.

## 🧪 Development

### Build

```bash
pnpm build
```

### Lint

```bash
pnpm lint
```

### Type Check

```bash
pnpm check-types
```

## 📚 Documentation

- **[NEON_SETUP.md](./NEON_SETUP.md)** - Neon Postgres setup guide (start here!)
- **[SETUP.md](./SETUP.md)** - Detailed setup instructions and troubleshooting
- **[ENV_SETUP.md](./ENV_SETUP.md)** - Environment variables configuration guide
- **[QUICKSTART.md](./QUICKSTART.md)** - Quick start guide
- **[PROJECT_ANALYSIS.md](./PROJECT_ANALYSIS.md)** - Comprehensive project analysis and summary
- **[apps/data/README.md](./apps/data/README.md)** - Data structure and seed script documentation

## 📝 Notes

- The seed script processes `apps/data/Analytics_Test_Data.json`
- Vanna AI uses mock SQL generation (integrate Groq API for production)
- All services support hot reload in development mode
- CORS is enabled for development (configure properly for production)
- **Important:** You must create `.env` files for each service (see `ENV_SETUP.md`)

## 🔮 TODO

- [ ] Integrate Groq API in vanna service for better SQL generation
- [ ] Add authentication and authorization
- [ ] Add query caching
- [ ] Add unit and integration tests
- [ ] Set up CI/CD pipeline
- [ ] Add Docker configuration
- [ ] Improve error handling and validation
- [ ] Add rate limiting
- [ ] Add logging and monitoring

## 📄 License

MIT
