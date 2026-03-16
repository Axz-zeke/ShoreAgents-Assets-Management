import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { isAdminServer } from '@/lib/user-management-server'

export async function PATCH(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const isAdmin = await isAdminServer()
        if (!isAdmin) {
            return NextResponse.json({ success: false, error: 'Forbidden. Admin access required.' }, { status: 403 })
        }
        const { id } = await params
        const body = await req.json()
        
        // Get old name for cascading
        const { data: oldCategory } = await supabaseAdmin.from('setup_categories').select('name').eq('id', id).single()

        const { data, error } = await supabaseAdmin
            .from('setup_categories')
            .update({ ...body, updated_at: new Date().toISOString() })
            .eq('id', id)
            .select()
            .single()
        if (error) throw error
        
        // Cascade rename to assets if name changed
        if (oldCategory && body.name && oldCategory.name !== body.name) {
            // Trim both for matching but use the provided new name for update
            const oldName = oldCategory.name.trim();
            await supabaseAdmin.from('assets')
                .update({ category: body.name })
                .or(`category.eq."${oldName}",category.eq."${oldName.toUpperCase()}",category.eq."${oldName.toLowerCase()}"`)
        }

        return NextResponse.json({ success: true, data })
    } catch (e: any) {
        return NextResponse.json({ success: false, error: e.message }, { status: 500 })
    }
}

export async function DELETE(
    _: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const isAdmin = await isAdminServer()
        if (!isAdmin) {
            return NextResponse.json({ success: false, error: 'Forbidden. Admin access required.' }, { status: 403 })
        }
        const { id } = await params
        // Get name before deleting to cascade delete
        const { data: oldCategory } = await supabaseAdmin.from('setup_categories').select('name').eq('id', id).single()

        const { error } = await supabaseAdmin.from('setup_categories').delete().eq('id', id)
        if (error) throw error
        
        // Cascade delete (nullify) to assets
        if (oldCategory?.name) {
            const oldName = oldCategory.name.trim();
            await supabaseAdmin.from('assets')
                .update({ category: null })
                .or(`category.eq."${oldName}",category.eq."${oldName.toUpperCase()}",category.eq."${oldName.toLowerCase()}"`)
        }

        return NextResponse.json({ success: true })
    } catch (e: any) {
        return NextResponse.json({ success: false, error: e.message }, { status: 500 })
    }
}
