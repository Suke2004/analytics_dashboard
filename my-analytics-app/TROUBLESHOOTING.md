# Troubleshooting Guide

## Common Issues and Solutions

### API Routes Returning 500 Errors

If you see errors like:

```
GET /api/stats 500
GET /api/invoice-trends 500
```

This usually means the database connection is not configured properly.

#### Solution 1: Check Environment Variables

1. **Verify `.env.local` exists** in `apps/web/`:

   ```bash
   # Should contain:
   DATABASE_URL=postgresql://user:password@ep-xxx-xxx-pooler.region.aws.neon.tech/dbname?sslmode=require
   VANNA_API_BASE_URL=http://localhost:8000
   ```

2. **Check your Neon connection string**:
   - Go to https://console.neon.tech
   - Copy your connection string from the dashboard
   - Make sure it includes `?sslmode=require`

#### Solution 2: Generate Prisma Client

```bash
cd apps/web
pnpm prisma generate
```

#### Solution 3: Run Database Migrations

```bash
cd apps/web
pnpm prisma migrate dev --name init
```

If migrations fail, you might need to set `DIRECT_URL` for migrations:

```env
# In apps/web/.env.local
DATABASE_URL=postgresql://user:password@ep-xxx-xxx-pooler.region.aws.neon.tech/dbname?sslmode=require
DIRECT_URL=postgresql://user:password@ep-xxx-xxx.region.aws.neon.tech/dbname?sslmode=require
```

#### Solution 4: Seed the Database

After running migrations:

```bash
cd apps/web
pnpm prisma:seed
```

### React Hydration Errors

If you see hydration errors:

1. **Check browser extensions**: Some extensions (like ad blockers) can modify HTML
2. **Clear browser cache**: Try a hard refresh (Ctrl+Shift+R or Cmd+Shift+R)
3. **Check for client/server mismatches**: Make sure no code uses `Date.now()` or `Math.random()` in components

### "Cannot read properties of undefined" Errors

These are now handled with proper null checks. If you still see them:

1. Check that API routes are working (see above)
2. Check browser console for API error messages
3. Verify database has data (run seed script)

### Database Connection Issues

#### Error: "Can't reach database server"

1. **Check Neon dashboard**: Verify your database is running
2. **Check connection string**: Make sure it's correct and includes SSL mode
3. **Check network**: Ensure you can reach Neon's servers

#### Error: "SSL connection required"

Add `?sslmode=require` to your connection string:

```
DATABASE_URL=postgresql://user:password@host/dbname?sslmode=require
```

#### Error: "Too many connections"

- Use the pooled connection string (with `-pooler` in hostname)
- Neon's pooler handles connection limits automatically

### Prisma Issues

#### Error: "Prisma Client not generated"

```bash
cd apps/web
pnpm prisma generate
```

#### Error: "Migration failed"

1. Check `DATABASE_URL` is set correctly
2. Try using `DIRECT_URL` for migrations:
   ```env
   DIRECT_URL=postgresql://user:password@ep-xxx-xxx.region.aws.neon.tech/dbname?sslmode=require
   ```
3. Check Neon dashboard to ensure database is accessible

#### Error: "Schema not found"

Ensure the schema file exists at `apps/web/prisma/schema.prisma`

### Next.js Issues

#### Error: "Module not found"

```bash
# Reinstall dependencies
pnpm install
```

#### Error: "PostCSS config error"

This should be fixed now. If you still see it:

- Make sure `postcss.config.js` uses ES module syntax (`export default`)
- Check `package.json` has `"type": "module"`

### Quick Diagnostic Checklist

Run these commands to verify setup:

```bash
# 1. Check if .env.local exists
cat apps/web/.env.local

# 2. Generate Prisma client
cd apps/web
pnpm prisma generate

# 3. Check database connection
pnpm prisma db pull

# 4. Run migrations
pnpm prisma migrate dev

# 5. Seed database
pnpm prisma:seed

# 6. Start dev server
pnpm dev
```

### Getting Help

1. **Check server logs**: Look at the terminal where `pnpm dev` is running
2. **Check browser console**: Open DevTools (F12) and check Console tab
3. **Check Network tab**: See what API requests are failing
4. **Verify Neon dashboard**: Check if database is accessible

### Common Error Messages

| Error                                 | Solution                                                 |
| ------------------------------------- | -------------------------------------------------------- |
| `DATABASE_URL is not set`             | Create `.env.local` with database connection string      |
| `Prisma Client not generated`         | Run `pnpm prisma generate`                               |
| `Migration failed`                    | Check connection string, use DIRECT_URL if needed        |
| `500 Internal Server Error`           | Check database connection and Prisma setup               |
| `Hydration error`                     | Check for browser extensions or client/server mismatches |
| `Cannot read properties of undefined` | Check API responses, ensure data is loaded               |

### Still Having Issues?

1. Check the [NEON_SETUP.md](./NEON_SETUP.md) guide
2. Review [SETUP.md](./SETUP.md) for detailed setup instructions
3. Verify all environment variables are set correctly
4. Check that all dependencies are installed: `pnpm install`
