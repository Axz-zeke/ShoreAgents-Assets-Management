import { NextRequest, NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase/admin"

// GET /api/maintenance - Fetch all maintenance records
export async function GET(request: NextRequest) {
  try {
    const supabase = supabaseAdmin

    // Get search params
    const { searchParams } = new URL(request.url)
    const assetId = searchParams.get("asset_id")
    const status = searchParams.get("status")
    const limit = searchParams.get("limit")
    const offset = searchParams.get("offset")

    // Build query - try with join first, fallback to basic select if relationship doesn't exist
    let query = supabase
      .from("maintenance_records")
      .select("*")
      .order("created_at", { ascending: false })

    // Apply filters
    if (assetId) {
      query = query.eq("asset_id", assetId)
    }

    if (status) {
      query = query.eq("status", status)
    }

    // Add pagination
    if (limit) {
      query = query.limit(parseInt(limit))
    }
    if (offset) {
      query = query.range(parseInt(offset), parseInt(offset) + (parseInt(limit || "50") - 1))
    }

    const { data: maintenanceRecords, error } = await query

    if (error) {
      console.error("Error fetching maintenance records:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // If we have maintenance records, try to enrich them with asset data
    let enrichedRecords = maintenanceRecords
    if (maintenanceRecords && maintenanceRecords.length > 0) {
      try {
        // Get asset IDs from maintenance records
        const assetIds = maintenanceRecords.map(record => record.asset_id)

        // Fetch asset data
        const { data: assets, error: assetsError } = await supabase
          .from("assets")
          .select("asset_tag_id, name, description, category, location, site")
          .in("asset_tag_id", assetIds)

        if (!assetsError && assets) {
          // Create a map of assets by ID
          const assetMap = assets.reduce((map, asset) => {
            map[asset.asset_tag_id] = asset
            return map
          }, {} as Record<string, any>)

          // Enrich maintenance records with asset data
          enrichedRecords = maintenanceRecords.map(record => ({
            ...record,
            assets: assetMap[record.asset_id] || null
          }))
        }
      } catch (enrichError) {
        console.warn("Could not enrich maintenance records with asset data:", enrichError)
        // Continue with basic records if enrichment fails
      }
    }

    return NextResponse.json({
      success: true,
      data: enrichedRecords,
      count: enrichedRecords?.length || 0
    })
  } catch (error) {
    console.error("Error in GET /api/maintenance:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// POST /api/maintenance - Create new maintenance record
export async function POST(request: NextRequest) {
  try {
    const supabase = supabaseAdmin
    const body = await request.json()

    // Validate required fields
    const requiredFields = ["asset_ids", "maintenance_title", "maintenance_by", "maintenance_due_date"]
    for (const field of requiredFields) {
      if (!body[field]) {
        return NextResponse.json({ error: `Missing required field: ${field}` }, { status: 400 })
      }
    }

    const results = []
    const errors = []

    // Create maintenance record for each asset
    for (const assetId of body.asset_ids) {
      try {
        // Prepare maintenance record data
        const maintenanceData = {
          asset_id: assetId,
          maintenance_title: body.maintenance_title,
          maintenance_details: body.maintenance_details || "",
          maintenance_due_date: body.maintenance_due_date,
          maintenance_by: body.maintenance_by,
          status: body.maintenance_status || "scheduled",
          priority: body.priority || "medium",
          service_type: body.service_type || "routine",
          attachment_filename: body.attachment_filename || "",
          date_completed: body.date_completed || null,
          maintenance_cost: body.maintenance_cost || 0,
          is_repeating: body.is_repeating === "yes",
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }

        const { data: maintenanceRecord, error: maintenanceError } = await supabase
          .from("maintenance_records")
          .insert([maintenanceData])
          .select()
          .single()

        if (maintenanceError) {
          console.error(`Error creating maintenance record for asset ${assetId}:`, maintenanceError)
          errors.push({ assetId, error: maintenanceError.message })
          continue
        }

        // Update asset status to "Maintenance"
        const { error: assetUpdateError } = await supabase
          .from("assets")
          .update({
            status: "Maintenance",
            updated_at: new Date().toISOString()
          })
          .eq("asset_tag_id", assetId)

        if (assetUpdateError) {
          console.error(`Error updating asset status for ${assetId}:`, assetUpdateError)
          errors.push({ assetId, error: `Failed to update asset status: ${assetUpdateError.message}` })
        } else {
          results.push(maintenanceRecord)
        }
      } catch (error) {
        console.error(`Error processing asset ${assetId}:`, error)
        errors.push({ assetId, error: error instanceof Error ? error.message : "Unknown error" })
      }
    }

    if (results.length === 0) {
      return NextResponse.json({
        error: "Failed to create any maintenance records",
        details: errors
      }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      data: results,
      created: results.length,
      errors: errors.length > 0 ? errors : undefined
    }, { status: 201 })
  } catch (error) {
    console.error("Error in POST /api/maintenance:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
