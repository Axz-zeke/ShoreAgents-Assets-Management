import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase/admin'

export async function GET() {
    try {
        const { data, error } = await supabaseAdmin
            .from('setup_locations')
            .select('*')
            .order('name', { ascending: true })
        if (error) {
            console.warn('setup_locations table error:', error.message)
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
        const { name, description, site, floor, room } = body
        if (!name || !site) return NextResponse.json({ success: false, error: 'Name and Site are required' }, { status: 400 })

        const { data, error } = await supabaseAdmin
            .from('setup_locations')
            .insert([{ name, description, site, floor, room, is_active: true }])
            .select()
            .single()
        if (error) throw error
        return NextResponse.json({ success: true, data })
    } catch (e: any) {
        return NextResponse.json({ success: false, error: e.message }, { status: 500 })
    }
}
