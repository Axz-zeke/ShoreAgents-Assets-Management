import { NextRequest, NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase/admin"

export const dynamic = "force-dynamic"

// GET /api/assets - Fetch all assets
export async function GET(request: NextRequest) {
  try {
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
    const supabase = supabaseAdmin
    const body = await request.json()

    // Validate required fields
    const requiredFields = ["name", "asset_tag_id"]
    for (const field of requiredFields) {
      if (!body[field]) {
        return NextResponse.json({ error: `Missing required field: ${field}` }, { status: 400 })
      }
    }

    // Prepare asset data
    const assetData = {
      name: body.name,
      description: body.description || "",
      asset_tag_id: body.asset_tag_id,
      category: body.category || "",
      sub_category: body.sub_category || body.subCategory || "",
      location: body.location || "",
      site: body.site || "",
      status: body.status || "Available",
      cost: body.cost || body.value || 0,
      purchase_date: body.purchase_date || body.purchaseDate || null,
      date_acquired: body.date_acquired || body.dateAcquired || null,
      assigned_to: body.assigned_to || body.assignedTo || "",
      department: body.department || "",
      brand: body.brand || "",
      model: body.model || "",
      serial_number: body.serial_number || body.serialNumber || "",
      manufacturer: body.manufacturer || "",
      notes: body.notes || "",
      floor: body.floor || "",
      condition: body.condition || "",
      transfer_method: body.transfer_method || body.transferMethod || "",
      authorized_by: body.authorized_by || body.authorizedBy || "",
      asset_type: body.asset_type || body.assetType || "",
      image_url: body.image_url || body.imageUrl || "",
      image_file_name: body.image_file_name || body.imageFileName || "",
      qr_url: body.qr_url || body.qrUrl || ""
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
