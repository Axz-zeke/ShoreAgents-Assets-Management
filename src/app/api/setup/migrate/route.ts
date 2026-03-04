import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase/admin'

export async function GET() {
    const results: Record<string, string> = {}

    const tables = [
        {
            name: 'setup_sites',
            sql: `
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
      `
        },
        {
            name: 'setup_locations',
            sql: `
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
      `
        },
        {
            name: 'setup_categories',
            sql: `
        CREATE TABLE IF NOT EXISTS setup_categories (
          id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
          name TEXT NOT NULL,
          description TEXT,
          is_active BOOLEAN DEFAULT TRUE,
          created_at TIMESTAMPTZ DEFAULT NOW(),
          updated_at TIMESTAMPTZ DEFAULT NOW()
        );
      `
        },
        {
            name: 'setup_departments',
            sql: `
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
      `
        },
    ]

    for (const table of tables) {
        try {
            const { error } = await supabaseAdmin.rpc('exec_sql', { sql: table.sql })
            if (error) {
                // Try via raw query as fallback
                results[table.name] = `error: ${error.message}`
            } else {
                results[table.name] = 'created'
            }
        } catch (e: any) {
            results[table.name] = `exception: ${e.message}`
        }
    }

    return NextResponse.json({ success: true, results })
}
