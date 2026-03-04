// Setup tables migration using Prisma's $executeRawUnsafe
// Run with: node --experimental-vm-modules scripts/create-setup-tables.cjs

const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function run() {
    try {
        console.log('🔧 Creating setup tables...')

        await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS setup_sites (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        name TEXT NOT NULL,
        description TEXT,
        address TEXT,
        apt_suite TEXT,
        city TEXT,
        state TEXT,
        zip TEXT,
        country TEXT,
        is_active BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      )
    `)
        console.log('   ✅ setup_sites created')

        await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS setup_locations (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        name TEXT NOT NULL,
        description TEXT,
        site TEXT,
        floor TEXT,
        room TEXT,
        is_active BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      )
    `)
        console.log('   ✅ setup_locations created')

        await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS setup_categories (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        name TEXT NOT NULL,
        description TEXT,
        is_active BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      )
    `)
        console.log('   ✅ setup_categories created')

        await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS setup_departments (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        name TEXT NOT NULL,
        description TEXT,
        manager TEXT,
        budget_code TEXT,
        is_active BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      )
    `)
        console.log('   ✅ setup_departments created')

        // Disable RLS on all tables
        await prisma.$executeRawUnsafe(`ALTER TABLE setup_sites DISABLE ROW LEVEL SECURITY`)
        await prisma.$executeRawUnsafe(`ALTER TABLE setup_locations DISABLE ROW LEVEL SECURITY`)
        await prisma.$executeRawUnsafe(`ALTER TABLE setup_categories DISABLE ROW LEVEL SECURITY`)
        await prisma.$executeRawUnsafe(`ALTER TABLE setup_departments DISABLE ROW LEVEL SECURITY`)
        console.log('   ✅ RLS disabled on all setup tables')

        console.log('\n🎉 Migration complete! All setup tables are ready.')
    } catch (error) {
        console.error('❌ Migration failed:', error.message)
        process.exit(1)
    } finally {
        await prisma.$disconnect()
    }
}

run()
