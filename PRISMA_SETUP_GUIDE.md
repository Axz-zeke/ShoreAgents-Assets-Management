# Prisma Integration Guide

This guide explains how to use Prisma in your Asset Management application alongside your existing Supabase setup.

## What's Been Set Up

### 1. Prisma Installation
- ✅ Installed `prisma` and `@prisma/client` packages
- ✅ Initialized Prisma with `npx prisma init`
- ✅ Created Prisma schema based on your existing database tables

### 2. Database Schema
The Prisma schema includes:
- **User** model (maps to `users` table)
- **Asset** model (maps to `assets` table) 
- **MaintenanceRecord** model (maps to `maintenance_records` table)
- **Enums** for AssetStatus, UserType, and MaintenanceStatus

### 3. Services Created
- `src/lib/prisma.ts` - Prisma client instance
- `src/lib/prisma-asset-service.ts` - Asset operations using Prisma
- `src/lib/prisma-maintenance-service.ts` - Maintenance operations using Prisma
- `src/lib/prisma-user-service.ts` - User operations using Prisma

### 4. API Routes
- `src/app/api/prisma/assets/route.ts` - Asset CRUD operations
- `src/app/api/prisma/assets/stats/route.ts` - Asset statistics

### 5. Example Component
- `src/components/prisma-assets-example.tsx` - React component showing Prisma usage

## Environment Setup

You need to add your Supabase database URL to your `.env` file:

```env
DATABASE_URL="postgresql://username:password@host:port/database?schema=public"
```

For Supabase, this would look like:
```env
DATABASE_URL="postgresql://postgres:[password]@db.[project-ref].supabase.co:5432/postgres"
```

## Usage Examples

### Basic Asset Operations

```typescript
import { prismaAssetService } from '@/lib/prisma-asset-service'
import { AssetStatus } from '@prisma/client'

// Get all assets
const assets = await prismaAssetService.getAssets()

// Get assets with filters
const availableAssets = await prismaAssetService.getAssets({
  status: AssetStatus.Available,
  category: 'Electronics',
  limit: 10
})

// Create a new asset
const newAsset = await prismaAssetService.createAsset({
  asset_tag_id: 'ASSET-001',
  name: 'Laptop Computer',
  status: AssetStatus.Available,
  category: 'Electronics'
})

// Get asset statistics
const stats = await prismaAssetService.getAssetStats()
```

### Direct Prisma Client Usage

```typescript
import { prisma } from '@/lib/prisma'

// Complex queries
const assetsWithMaintenance = await prisma.asset.findMany({
  include: {
    maintenance_records: {
      where: { status: 'scheduled' }
    }
  },
  where: {
    status: 'Available',
    OR: [
      { category: 'Electronics' },
      { department: 'IT' }
    ]
  }
})

// Aggregations
const totalValue = await prisma.asset.aggregate({
  _sum: { cost: true },
  where: { status: 'Available' }
})
```

### React Component Usage

```typescript
// In your React component
const [assets, setAssets] = useState([])

useEffect(() => {
  fetch('/api/prisma/assets')
    .then(res => res.json())
    .then(data => setAssets(data.data))
}, [])
```

## Benefits of Using Prisma

### 1. **Type Safety**
- Auto-generated TypeScript types
- Compile-time error checking
- IntelliSense support

### 2. **Better Developer Experience**
- Intuitive query syntax
- Automatic query optimization
- Built-in connection pooling

### 3. **Advanced Features**
- Complex relationships
- Aggregations and grouping
- Transaction support
- Database introspection

## Migration Strategy

### Option 1: Gradual Migration
- Keep existing Supabase code
- Use Prisma for new features
- Migrate one table at a time

### Option 2: Hybrid Approach
- Use Supabase for Auth and Storage
- Use Prisma for complex database operations
- Keep RLS policies in Supabase

### Option 3: Full Migration
- Replace all Supabase client calls
- Implement separate auth solution
- Migrate all data and relationships

## Next Steps

1. **Set up DATABASE_URL** in your `.env` file
2. **Test the Prisma connection**: `npx prisma db pull`
3. **Try the example API routes** at `/api/prisma/assets`
4. **Use the example component** in your app
5. **Gradually migrate** existing functionality

## Commands Reference

```bash
# Generate Prisma client
npx prisma generate

# Pull schema from existing database
npx prisma db pull

# Create and apply migrations
npx prisma migrate dev

# Open Prisma Studio (database GUI)
npx prisma studio

# Reset database
npx prisma migrate reset
```

## Troubleshooting

### Common Issues:
1. **DATABASE_URL not set** - Add it to your `.env` file
2. **Schema mismatch** - Run `npx prisma db pull` to sync
3. **Type errors** - Run `npx prisma generate` after schema changes
4. **Connection issues** - Check your Supabase connection string

### Getting Help:
- [Prisma Documentation](https://www.prisma.io/docs)
- [Prisma Discord](https://pris.ly/discord)
- [GitHub Issues](https://github.com/prisma/prisma/issues)

