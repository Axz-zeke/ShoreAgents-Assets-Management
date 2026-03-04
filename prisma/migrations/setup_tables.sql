-- ============================================================
-- Setup Tables Migration
-- Run this in your Supabase SQL Editor
-- ============================================================

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

-- Locations Table (references sites by name for simplicity)
CREATE TABLE IF NOT EXISTS setup_locations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  site TEXT,  -- name of the site
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

-- Enable Row Level Security (RLS) - adjust policies as needed
ALTER TABLE setup_sites ENABLE ROW LEVEL SECURITY;
ALTER TABLE setup_locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE setup_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE setup_departments ENABLE ROW LEVEL SECURITY;

-- Allow all operations for service role (used by supabaseAdmin)
CREATE POLICY "Service role access" ON setup_sites FOR ALL USING (true);
CREATE POLICY "Service role access" ON setup_locations FOR ALL USING (true);
CREATE POLICY "Service role access" ON setup_categories FOR ALL USING (true);
CREATE POLICY "Service role access" ON setup_departments FOR ALL USING (true);
