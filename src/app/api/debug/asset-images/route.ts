import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

// GET /api/debug/asset-images - Debug asset images in database
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    // Get all assets with image fields
    const { data: assets, error } = await supabase
      .from('assets')
      .select('asset_tag_id, name, image_url, image_file_name, created_at, updated_at')
      .order('created_at', { ascending: false })
      .limit(10) // Get latest 10 assets

    if (error) {
      console.error("Error fetching assets for debug:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ 
      success: true, 
      data: assets,
      message: `Found ${assets?.length || 0} assets with image data`
    })
  } catch (error) {
    console.error("Error in debug endpoint:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
