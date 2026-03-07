import { NextRequest, NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase/admin"
import { createClient } from "@/lib/supabase/server"
import { isAdminServer } from "@/lib/user-management-server"
import { z } from "zod"

const assetSchema = z.object({
  name: z.string().min(1, "Asset name is required"),
  asset_tag_id: z.string().min(1, "Asset Tag ID is required"),
  description: z.string().optional(),
  category: z.string().optional(),
  sub_category: z.string().optional(),
  location: z.string().optional(),
  site: z.string().optional(),
  status: z.enum(["Available", "In Use", "Move", "Reserved", "Disposed", "Maintenance"]).optional().default("Available"),
  cost: z.number().optional().default(0),
  purchase_date: z.string().optional().nullable(),
  date_acquired: z.string().optional().nullable(),
  assigned_to: z.string().optional().nullable(),
  assigned_to_id: z.string().uuid().optional().nullable(),
  department: z.string().optional(),
  brand: z.string().optional(),
  model: z.string().optional(),
  serial_number: z.string().optional(),
  manufacturer: z.string().optional(),
  notes: z.string().optional(),
  floor: z.string().optional(),
  condition: z.string().optional(),
  transfer_method: z.string().optional(),
  authorized_by: z.string().optional(),
  asset_type: z.string().optional(),
  image_url: z.string().optional(),
  image_file_name: z.string().optional(),
  qr_url: z.string().optional()
})

export const dynamic = "force-dynamic"

// GET /api/assets - Fetch all assets
export async function GET(request: NextRequest) {
  try {
    const supabaseSession = await createClient();
    const { data: { user } } = await supabaseSession.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const supabase = supabaseAdmin

    // Get search params
    const { searchParams } = new URL(request.url)
    const search = searchParams.get("search")
    const status = searchParams.get("status")
    const category = searchParams.get("category")
    const department = searchParams.get("department")
    const limit = searchParams.get("limit")
    const offset = searchParams.get("offset")

    // Build query
    let query = supabase
      .from("assets")
      .select("*")
      .order("created_at", { ascending: false })

    // Apply filters
    if (search) {
      query = query.or(`name.ilike.%${search}%,description.ilike.%${search}%,asset_tag_id.ilike.%${search}%`)
    }

    if (status) {
      query = query.eq("status", status)
    }

    if (category) {
      query = query.eq("category", category)
    }

    if (department) {
      query = query.eq("department", department)
    }

    // Add pagination
    if (limit) {
      query = query.limit(parseInt(limit))
    }
    if (offset) {
      query = query.range(parseInt(offset), parseInt(offset) + (parseInt(limit || "50") - 1))
    }

    const { data: assets, error } = await query

    if (error) {
      console.error("Error fetching assets:", error)
      return NextResponse.json({ error: error.message, details: error }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      data: assets,
      count: assets?.length || 0
    })
  } catch (error: any) {
    console.error("Error in GET /api/assets:", error)
    return NextResponse.json({ error: "Internal server error", message: error.message, stack: error.stack }, { status: 500 })
  }
}

// POST /api/assets - Create new asset
export async function POST(request: NextRequest) {
  try {
    const isAdmin = await isAdminServer();
    if (!isAdmin) {
      return NextResponse.json({ error: 'Forbidden. Admin access required.' }, { status: 403 });
    }

    const supabase = supabaseAdmin
    const body = await request.json()

    // Validate with Zod
    const result = assetSchema.safeParse(body)
    if (!result.success) {
      return NextResponse.json({
        error: "Validation error",
        details: result.error.issues.map(i => i.message).join(", ")
      }, { status: 400 })
    }

    const validatedData = result.data

    // Prepare asset data
    const assetData = {
      ...validatedData,
      // Ensure specific fields if needed
    }

    const { data: asset, error } = await supabase
      .from("assets")
      .insert([assetData])
      .select()
      .single()

    if (error) {
      console.error("Error creating asset:", error)

      // Handle specific database errors
      if (error.code === '23505' && error.message.includes('asset_tag_id_key')) {
        return NextResponse.json({
          error: `Asset ID "${assetData.asset_tag_id}" already exists. Please use a different Asset ID.`
        }, { status: 409 })
      }

      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      data: asset
    }, { status: 201 })
  } catch (error) {
    console.error("Error in POST /api/assets:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
