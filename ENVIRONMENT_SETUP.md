# Environment Setup Guide

## Required Environment Variables

Copy the following to your `.env` file (create it if it doesn't exist):

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://iajjpsiicjecbukyfxvr.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key_here

# Prisma Database Configuration
# Direct connection (for migrations and Prisma Studio)
DATABASE_URL="postgresql://postgres:NRjJ9aliA3NT0k2x@db.iajjpsiicjecbukyfxvr.supabase.co:5432/postgres"

# Direct URL (for Prisma migrations and introspection)
DIRECT_URL="postgresql://postgres:NRjJ9aliA3NT0k2x@db.iajjpsiicjecbukyfxvr.supabase.co:5432/postgres"

# Prisma Configuration
PRISMA_GENERATE_DATAPROXY="false"
```

## Connection Types Explained

### 1. Direct Connection (DATABASE_URL & DIRECT_URL)
- **Use for**: Prisma Studio, migrations, schema introspection
- **Connection**: `postgresql://postgres:NRjJ9aliA3NT0k2x@db.iajjpsiicjecbukyfxvr.supabase.co:5432/postgres`
- **Port**: 5432
- **Limitations**: Limited concurrent connections

### 2. Transaction Pooler (Alternative)
- **Use for**: High-concurrency production applications
- **Connection**: `postgres://postgres:NRjJ9aliA3NT0k2x@db.iajjpsiicjecbukyfxvr.supabase.co:6543/postgres`
- **Port**: 6543
- **Benefits**: Better connection pooling

### 3. Session Pooler (Alternative)
- **Use for**: Serverless environments
- **Connection**: `postgresql://postgres.iajjpsiicjecbukyfxvr:NRjJ9aliA3NT0k2x@aws-1-ap-southeast-1.pooler.supabase.com:5432/postgres`
- **Benefits**: Optimized for serverless functions

## Next Steps

1. **Create your `.env` file** with the variables above
2. **Get your Supabase keys** from your Supabase dashboard:
   - Go to Settings → API
   - Copy the `anon` key for `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - Copy the `service_role` key for `SUPABASE_SERVICE_ROLE_KEY`

3. **Test the connection**:
   ```bash
   npx prisma db pull
   ```

4. **Generate Prisma client**:
   ```bash
   npx prisma generate
   ```

5. **Launch Prisma Studio**:
   ```bash
   npx prisma studio
   ```

## Troubleshooting

- **Connection refused**: Check if your IP is whitelisted in Supabase
- **Authentication failed**: Verify your password is correct
- **Schema not found**: Make sure you're connecting to the right database
- **Prisma Studio not loading**: Check if DATABASE_URL is set correctly

## Security Notes

- Never commit your `.env` file to version control
- The password is already included in the connection string
- Make sure your Supabase project has proper RLS policies enabled

