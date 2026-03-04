import { NextRequest, NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase/admin"

// GET /api/maintenance/[id] - Fetch single maintenance record
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const supabase = supabaseAdmin
    const { id: maintenanceId } = await params

    const { data: maintenanceRecord, error } = await supabase
      .from("maintenance_records")
      .select("*")
      .eq("id", maintenanceId)
      .single()

    if (error) {
      if (error.code === "PGRST116") {
        return NextResponse.json({ error: "Maintenance record not found" }, { status: 404 })
      }
      console.error("Error fetching maintenance record:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Try to enrich with asset data
    let enrichedRecord = maintenanceRecord
    if (maintenanceRecord && maintenanceRecord.asset_id) {
      try {
        const { data: asset, error: assetError } = await supabase
          .from("assets")
          .select("asset_tag_id, name, description, category, location, site, status")
          .eq("asset_tag_id", maintenanceRecord.asset_id)
          .single()

        if (!assetError && asset) {
          enrichedRecord = {
            ...maintenanceRecord,
            assets: asset
          }
        }
      } catch (enrichError) {
        console.warn("Could not enrich maintenance record with asset data:", enrichError)
        // Continue with basic record if enrichment fails
      }
    }

    return NextResponse.json({
      success: true,
      data: enrichedRecord
    })
  } catch (error) {
    console.error("Error in GET /api/maintenance/[id]:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// PUT /api/maintenance/[id] - Update maintenance record
export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const supabase = supabaseAdmin
    const { id: maintenanceId } = await params
    const body = await request.json()

    // Prepare update data
    const updateData = {
      maintenance_title: body.maintenance_title,
      maintenance_details: body.maintenance_details,
      maintenance_due_date: body.maintenance_due_date,
      maintenance_by: body.maintenance_by,
      status: body.maintenance_status,
      date_completed: body.date_completed,
      maintenance_cost: body.maintenance_cost,
      is_repeating: body.is_repeating === "yes" || body.is_repeating === true,
      updated_at: new Date().toISOString()
    }

    // Remove undefined/null values
    Object.keys(updateData).forEach(key => {
      if (updateData[key as keyof typeof updateData] === undefined || updateData[key as keyof typeof updateData] === null) {
        delete updateData[key as keyof typeof updateData]
      }
    })

    const { data: maintenanceRecord, error } = await supabase
      .from("maintenance_records")
      .update(updateData)
      .eq("id", maintenanceId)
      .select("*")
      .single()

    if (error) {
      if (error.code === "PGRST116") {
        return NextResponse.json({ error: "Maintenance record not found" }, { status: 404 })
      }
      console.error("Error updating maintenance record:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // If status changed to completed, update asset status back to Available
    if (body.maintenance_status === "completed" && maintenanceRecord.asset_id) {
      await supabase
        .from("assets")
        .update({
          status: "Available",
          updated_at: new Date().toISOString()
        })
        .eq("asset_tag_id", maintenanceRecord.asset_id)
    }

    // Try to enrich with asset data
    let enrichedRecord = maintenanceRecord
    if (maintenanceRecord && maintenanceRecord.asset_id) {
      try {
        const { data: asset, error: assetError } = await supabase
          .from("assets")
          .select("asset_tag_id, name, description, category, location, site, status")
          .eq("asset_tag_id", maintenanceRecord.asset_id)
          .single()

        if (!assetError && asset) {
          enrichedRecord = {
            ...maintenanceRecord,
            assets: asset
          }
        }
      } catch (enrichError) {
        console.warn("Could not enrich maintenance record with asset data:", enrichError)
        // Continue with basic record if enrichment fails
      }
    }

    return NextResponse.json({
      success: true,
      data: enrichedRecord
    })
  } catch (error) {
    console.error("Error in PUT /api/maintenance/[id]:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// DELETE /api/maintenance/[id] - Delete maintenance record
export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const supabase = supabaseAdmin
    const { id: maintenanceId } = await params

    // First get the maintenance record to know which asset to update
    const { data: maintenanceRecord, error: fetchError } = await supabase
      .from("maintenance_records")
      .select("asset_id")
      .eq("id", maintenanceId)
      .single()

    if (fetchError) {
      if (fetchError.code === "PGRST116") {
        return NextResponse.json({ error: "Maintenance record not found" }, { status: 404 })
      }
      console.error("Error fetching maintenance record:", fetchError)
      return NextResponse.json({ error: fetchError.message }, { status: 500 })
    }

    // Delete the maintenance record
    const { data: deletedRecord, error } = await supabase
      .from("maintenance_records")
      .delete()
      .eq("id", maintenanceId)
      .select()
      .single()

    if (error) {
      console.error("Error deleting maintenance record:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Update asset status back to Available
    if (maintenanceRecord.asset_id) {
      await supabase
        .from("assets")
        .update({
          status: "Available",
          updated_at: new Date().toISOString()
        })
        .eq("asset_tag_id", maintenanceRecord.asset_id)
    }

    return NextResponse.json({
      success: true,
      message: "Maintenance record deleted successfully",
      data: deletedRecord
    })
  } catch (error) {
    console.error("Error in DELETE /api/maintenance/[id]:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
