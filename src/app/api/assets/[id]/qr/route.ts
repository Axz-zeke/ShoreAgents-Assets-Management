import { NextRequest, NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase/admin"

/**
 * POST /api/assets/[id]/qr
 *
 * Generates a QR code for an asset, uploads it to Supabase Storage under
 * `asset-images/qr-codes/<assetTagId>.png`, and stores the public URL in
 * the `image_url` column of the asset row (only when no image already exists).
 *
 * The QR payload encodes:
 *   { type: "asset", id: <uuid>, assetTagId: <assetTagId> }
 *
 * The caller can pass the asset UUID via the request body so we don't need
 * a second DB query:
 *   POST /api/assets/[id]/qr   body: { uuid?: string }
 *
 * [id] is the asset_tag_id (e.g. "PT2021-0001").
 */
export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id: assetTagId } = await params

        // Optionally accept the database UUID from the body (avoids extra DB round-trip)
        let dbUuid: string | undefined
        try {
            const body = await request.json()
            dbUuid = body?.uuid
        } catch {
            // body is optional – ignore parse errors
        }

        // If we don't have the UUID yet, fetch it from the database
        if (!dbUuid) {
            const { data: assetRow, error: fetchError } = await supabaseAdmin
                .from("assets")
                .select("id")
                .eq("asset_tag_id", assetTagId)
                .single()

            if (fetchError || !assetRow) {
                return NextResponse.json({ error: "Asset not found" }, { status: 404 })
            }
            dbUuid = assetRow.id
        }

        // Build the QR payload
        const origin =
            request.headers.get("origin") ||
            request.headers.get("x-forwarded-host") ||
            "https://your-domain.com"

        const qrPayload = JSON.stringify({
            type: "asset",
            id: dbUuid,
            assetTagId,
            url: `${origin}/assets/${assetTagId}`,
        })

        // Fetch QR image from the free qrserver API (500×500, 20px margin)
        const qrApiUrl = `https://api.qrserver.com/v1/create-qr-code/?size=500x500&format=png&margin=20&data=${encodeURIComponent(qrPayload)}`

        const qrResponse = await fetch(qrApiUrl)
        if (!qrResponse.ok) {
            return NextResponse.json(
                { error: "Failed to generate QR code from external service" },
                { status: 502 }
            )
        }

        const qrBuffer = await qrResponse.arrayBuffer()

        // Upload to Supabase Storage: asset-images/qr-codes/<assetTagId>.png
        const storagePath = `qr-codes/${assetTagId}.png`
        const { error: uploadError } = await supabaseAdmin.storage
            .from("asset-images")
            .upload(storagePath, qrBuffer, {
                contentType: "image/png",
                upsert: true, // overwrite if QR is re-generated
            })

        if (uploadError) {
            console.error("QR upload error:", uploadError)
            // Return the external URL as fallback instead of failing completely
            return NextResponse.json({
                success: true,
                qrUrl: qrApiUrl,
                stored: false,
                warning: uploadError.message,
            })
        }

        // Get the public URL
        const { data: publicData } = supabaseAdmin.storage
            .from("asset-images")
            .getPublicUrl(storagePath)

        const qrUrl = publicData?.publicUrl || qrApiUrl

        // Patch the asset: save QR URL to image_url (only if image_url is currently empty)
        // This preserves any manually uploaded asset photo.
        const { data: currentAsset } = await supabaseAdmin
            .from("assets")
            .select("image_url, image_file_name")
            .eq("asset_tag_id", assetTagId)
            .single()

        const shouldPatchImageUrl =
            !currentAsset?.image_url || currentAsset.image_url.trim() === ""

        const updatePayload: Record<string, string> = {
            qr_url: qrUrl,
        }

        if (shouldPatchImageUrl) {
            updatePayload.image_url = qrUrl
            updatePayload.image_file_name = `${assetTagId}.png`
        }

        // We can now update qr_url directly
        const { error: updateError } = await supabaseAdmin
            .from("assets")
            .update(updatePayload)
            .eq("asset_tag_id", assetTagId)

        if (updateError) {
            console.warn("Could not patch asset with QR URL:", updateError.message)
        }

        return NextResponse.json({
            success: true,
            qrUrl,
            assetTagId,
            uuid: dbUuid,
            stored: true,
            patchedImageUrl: shouldPatchImageUrl,
        })
    } catch (error: any) {
        console.error("Error in POST /api/assets/[id]/qr:", error)
        return NextResponse.json(
            { error: "Internal server error", message: error.message },
            { status: 500 }
        )
    }
}

/**
 * GET /api/assets/[id]/qr
 * Returns the existing QR URL for an asset (from image_file_name / image_url).
 */
export async function GET(
    _request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id: assetTagId } = await params

        const { data: asset, error } = await supabaseAdmin
            .from("assets")
            .select("id, asset_tag_id, image_url, image_file_name, qr_url")
            .eq("asset_tag_id", assetTagId)
            .single()

        if (error || !asset) {
            return NextResponse.json({ error: "Asset not found" }, { status: 404 })
        }

        // Determine QR URL: prefer dedicated qr_url field, then image stored under qr-codes/ path
        let qrUrl: string | null = asset.qr_url || null

        if (!qrUrl && asset.image_file_name?.includes(".png")) {
            const { data: storageData } = supabaseAdmin.storage
                .from("asset-images")
                .getPublicUrl(`qr-codes/${assetTagId}.png`)
            qrUrl = storageData?.publicUrl || null
        }
        if (!qrUrl) {
            qrUrl = asset.image_url || null
        }

        return NextResponse.json({
            success: true,
            qrUrl,
            assetTagId,
            uuid: asset.id,
        })
    } catch (error: any) {
        console.error("Error in GET /api/assets/[id]/qr:", error)
        return NextResponse.json(
            { error: "Internal server error", message: error.message },
            { status: 500 }
        )
    }
}
