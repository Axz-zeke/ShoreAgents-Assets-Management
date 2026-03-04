import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase/admin'

export async function GET() {
    try {
        const { data, error } = await supabaseAdmin
            .from('setup_sites')
            .select('*')
            .order('name', { ascending: true })

        if (error) {
            // Table might not exist yet — return empty
            console.warn('setup_sites table error:', error.message)
            return NextResponse.json({ success: true, data: [] })
        }
        return NextResponse.json({ success: true, data: data || [] })
    } catch (e: any) {
        return NextResponse.json({ success: false, error: e.message }, { status: 500 })
    }
}

export async function POST(req: NextRequest) {
    try {
        const body = await req.json()
        const { name, description, address, apt_suite, city, state, zip, country } = body
        if (!name) return NextResponse.json({ success: false, error: 'Name is required' }, { status: 400 })

        const { data, error } = await supabaseAdmin
            .from('setup_sites')
            .insert([{ name, description, address, apt_suite, city, state, zip, country, is_active: true }])
            .select()
            .single()

        if (error) throw error
        return NextResponse.json({ success: true, data })
    } catch (e: any) {
        return NextResponse.json({ success: false, error: e.message }, { status: 500 })
    }
}
