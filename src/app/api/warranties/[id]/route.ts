import { NextRequest, NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase/admin"

// GET /api/warranties/[id] - single warranty
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params
        const supabase = supabaseAdmin
        const { data, error } = await supabase
            .from("asset_warranties")
            .select("*")
            .eq("id", id)
            .single()

        if (error) return NextResponse.json({ error: error.message }, { status: 404 })
        return NextResponse.json({ success: true, data })
    } catch (error) {
        return NextResponse.json({ error: "Internal server error" }, { status: 500 })
    }
}

// PATCH /api/warranties/[id] - update warranty
export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params
        const supabase = supabaseAdmin
        const body = await request.json()

        // Auto-recalculate status when dates change
        if (body.end_date) {
            const now = new Date()
            const endDate = new Date(body.end_date)
            const daysLeft = Math.ceil((endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
            if (daysLeft < 0) body.status = "expired"
            else if (daysLeft <= 30) body.status = "expiring_soon"
            else body.status = "active"
        }

        const { data, error } = await supabase
            .from("asset_warranties")
            .update({ ...body, updated_at: new Date().toISOString() })
            .eq("id", id)
            .select()
            .single()

        if (error) return NextResponse.json({ error: error.message }, { status: 500 })
        return NextResponse.json({ success: true, data })
    } catch (error) {
        return NextResponse.json({ error: "Internal server error" }, { status: 500 })
    }
}

// DELETE /api/warranties/[id] - delete warranty
export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params
        const supabase = supabaseAdmin
        const { error } = await supabase
            .from("asset_warranties")
            .delete()
            .eq("id", id)

        if (error) return NextResponse.json({ error: error.message }, { status: 500 })
        return NextResponse.json({ success: true })
    } catch (error) {
        return NextResponse.json({ error: "Internal server error" }, { status: 500 })
    }
}
