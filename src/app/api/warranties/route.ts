import { NextRequest, NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase/admin"

// GET /api/warranties - Fetch all warranty records
export async function GET(request: NextRequest) {
    try {
        const supabase = supabaseAdmin
        const { searchParams } = new URL(request.url)
        const assetId = searchParams.get("asset_id")
        const status = searchParams.get("status")
        const limit = parseInt(searchParams.get("limit") || "100")

        let query = supabase
            .from("asset_warranties")
            .select("*")
            .order("created_at", { ascending: false })
            .limit(limit)

        if (assetId) query = query.eq("asset_id", assetId)
        if (status) query = query.eq("status", status)

        const { data: warranties, error } = await query

        if (error) {
            // If the table doesn't exist yet, return empty with a hint
            if (error.code === "42P01") {
                return NextResponse.json({
                    success: true,
                    data: [],
                    count: 0,
                    hint: "asset_warranties table does not exist yet. Please run the migration SQL."
                })
            }
            console.error("Error fetching warranties:", error)
            return NextResponse.json({ error: error.message }, { status: 500 })
        }

        // Enrich with asset data
        let enriched = warranties || []
        if (enriched.length > 0) {
            const assetIds = [...new Set(enriched.map((w: any) => w.asset_id))]
            const { data: assets } = await supabase
                .from("assets")
                .select("asset_tag_id, name, category, brand, model")
                .in("asset_tag_id", assetIds)

            if (assets) {
                const assetMap = assets.reduce((map: Record<string, any>, a: any) => {
                    map[a.asset_tag_id] = a
                    return map
                }, {})
                enriched = enriched.map((w: any) => ({
                    ...w,
                    asset: assetMap[w.asset_id] || null
                }))
            }
        }

        return NextResponse.json({ success: true, data: enriched, count: enriched.length })
    } catch (error) {
        console.error("Error in GET /api/warranties:", error)
        return NextResponse.json({ error: "Internal server error" }, { status: 500 })
    }
}

// POST /api/warranties - Create a new warranty
export async function POST(request: NextRequest) {
    try {
        const supabase = supabaseAdmin
        const body = await request.json()

        const required = ["asset_id", "provider", "start_date", "end_date", "warranty_type"]
        for (const field of required) {
            if (!body[field]) {
                return NextResponse.json({ error: `Missing required field: ${field}` }, { status: 400 })
            }
        }

        // Auto-calculate status
        const now = new Date()
        const endDate = new Date(body.end_date)
        const daysLeft = Math.ceil((endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))

        let status = "active"
        if (daysLeft < 0) status = "expired"
        else if (daysLeft <= 30) status = "expiring_soon"

        const warrantyData = {
            asset_id: body.asset_id,
            warranty_type: body.warranty_type,
            provider: body.provider,
            contact_info: body.contact_info || null,
            reference_number: body.reference_number || null,
            coverage_details: body.coverage_details || null,
            start_date: body.start_date,
            end_date: body.end_date,
            warranty_cost: body.warranty_cost ? parseFloat(body.warranty_cost) : null,
            status,
            notes: body.notes || null,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
        }

        const { data, error } = await supabase
            .from("asset_warranties")
            .insert([warrantyData])
            .select()
            .single()

        if (error) {
            console.error("Error creating warranty:", error)
            return NextResponse.json({ error: error.message }, { status: 500 })
        }

        return NextResponse.json({ success: true, data }, { status: 201 })
    } catch (error) {
        console.error("Error in POST /api/warranties:", error)
        return NextResponse.json({ error: "Internal server error" }, { status: 500 })
    }
}
