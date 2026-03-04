// Setup tables migration script
// Run with: node scripts/create-setup-tables.mjs

import pg from 'pg'
const { Client } = pg

const DATABASE_URL = 'postgresql://postgres.glhkrapipsocsgzsoise:shoreagentsassets@aws-1-ap-south-1.pooler.supabase.com:5432/postgres'

const client = new Client({ connectionString: DATABASE_URL, ssl: { rejectUnauthorized: false } })

const migrations = `
-- Sites Table
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
);

-- Locations Table
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
);

-- Categories Table
CREATE TABLE IF NOT EXISTS setup_categories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Departments Table
CREATE TABLE IF NOT EXISTS setup_departments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  manager TEXT,
  budget_code TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Disable RLS on these tables so they work with the service role key
ALTER TABLE setup_sites DISABLE ROW LEVEL SECURITY;
ALTER TABLE setup_locations DISABLE ROW LEVEL SECURITY;
ALTER TABLE setup_categories DISABLE ROW LEVEL SECURITY;
ALTER TABLE setup_departments DISABLE ROW LEVEL SECURITY;
`

async function run() {
    try {
        await client.connect()
        console.log('✅ Connected to database')
        await client.query(migrations)
        console.log('✅ All setup tables created successfully!')
        console.log('   - setup_sites')
        console.log('   - setup_locations')
        console.log('   - setup_categories')
        console.log('   - setup_departments')
    } catch (error) {
        console.error('❌ Migration failed:', error.message)
        process.exit(1)
    } finally {
        await client.end()
    }
}

run()
