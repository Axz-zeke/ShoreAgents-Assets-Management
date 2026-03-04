// Sub-categories table migration
const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function run() {
    try {
        console.log('🔧 Creating setup_sub_categories table...')

        await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS setup_sub_categories (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        name TEXT NOT NULL,
        description TEXT,
        category TEXT,
        is_active BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      )
    `)
        console.log('   ✅ setup_sub_categories created')

        await prisma.$executeRawUnsafe(`ALTER TABLE setup_sub_categories DISABLE ROW LEVEL SECURITY`)
        console.log('   ✅ RLS disabled on setup_sub_categories')

        console.log('\n🎉 Migration complete!')
    } catch (error) {
        console.error('❌ Migration failed:', error.message)
        process.exit(1)
    } finally {
        await prisma.$disconnect()
    }
}

run()
