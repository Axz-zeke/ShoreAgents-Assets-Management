import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

// POST /api/assets/image - Upload asset image
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const formData = await request.formData()
    
    const file = formData.get('file') as File
    const filePath = formData.get('filePath') as string
    const bucket = formData.get('bucket') as string || 'asset-images' // Default to asset-images
    
    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }
    
    if (!filePath) {
      return NextResponse.json({ error: 'No file path provided' }, { status: 400 })
    }

    console.log('=== API UPLOAD DEBUG ===')
    console.log('File:', file.name, file.type, file.size)
    console.log('File path:', filePath)
    console.log('Bucket:', bucket)
    console.log('========================')

    // Upload file to Supabase Storage
    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: true // Allow overwriting existing files
      })

    if (error) {
      console.error('Storage upload error:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from(bucket)
      .getPublicUrl(filePath)

    console.log('Upload successful:', {
      path: data.path,
      publicUrl: urlData.publicUrl
    })

    return NextResponse.json({
      success: true,
      data: {
        path: data.path,
        publicUrl: urlData.publicUrl
      }
    })
  } catch (error) {
    console.error("Error in POST /api/assets/image:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// DELETE /api/assets/image - Delete asset image
export async function DELETE(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { searchParams } = new URL(request.url)
    const filePath = searchParams.get('filePath')
    
    if (!filePath) {
      return NextResponse.json({ error: 'No file path provided' }, { status: 400 })
    }

    // Delete file from Supabase Storage
    const { error } = await supabase.storage
      .from('asset-images')
      .remove([filePath])

    if (error) {
      console.error('Storage delete error:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      message: 'Image deleted successfully'
    })
  } catch (error) {
    console.error("Error in DELETE /api/assets/image:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
