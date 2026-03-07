import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { createClient } from '@/lib/supabase/server';
import { isAdminServer } from '@/lib/user-management-server';

// GET - Fetch company info
export async function GET() {
  try {
    const supabaseSession = await createClient();
    const { data: { user } } = await supabaseSession.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const supabase = supabaseAdmin;

    // Get the first (and should be only) company info record
    const { data: companyInfo, error } = await supabase
      .from('company_info')
      .select('*')
      .limit(1)
      .maybeSingle();

    if (error) {
      console.error('Error fetching company info from database:', error);
      throw error;
    }

    if (!companyInfo) {
      // Return default values if no company info exists yet
      return NextResponse.json({
        company: "ShoreAgents Assets Inc.",
        organizationType: "Enterprise",
        country: "United States",
        address: "123 Business Street",
        aptSuite: "",
        city: "New York",
        state: "NY",
        postalCode: "10001",
        timezone: "America/New_York",
        currency: "USD",
        logoUrl: null,
      });
    }

    // Convert snake_case to camelCase for frontend
    return NextResponse.json({
      id: companyInfo.id,
      company: companyInfo.company,
      organizationType: companyInfo.organization_type || "",
      country: companyInfo.country || "",
      address: companyInfo.address || "",
      aptSuite: companyInfo.apt_suite || "",
      city: companyInfo.city || "",
      state: companyInfo.state || "",
      postalCode: companyInfo.postal_code || "",
      timezone: companyInfo.timezone || "",
      currency: companyInfo.currency || "",
      logoUrl: companyInfo.logo_url || null,
    });
  } catch (error: any) {
    console.error('Error fetching company info:', error);
    return NextResponse.json(
      {
        error: 'Failed to fetch company information',
        message: error.message,
        details: error
      },
      { status: 500 }
    );
  }
}

// PUT - Update company info
export async function PUT(request: NextRequest) {
  try {
    const isAdmin = await isAdminServer();
    if (!isAdmin) {
      return NextResponse.json({ error: 'Forbidden. Admin access required.' }, { status: 403 });
    }

    const supabase = supabaseAdmin;
    const body = await request.json();

    // Convert camelCase to snake_case for database
    const updateData = {
      company: body.company,
      organization_type: body.organizationType,
      country: body.country,
      address: body.address,
      apt_suite: body.aptSuite,
      city: body.city,
      state: body.state,
      postal_code: body.postalCode,
      timezone: body.timezone,
      currency: body.currency,
      logo_url: body.logoUrl,
      updated_at: new Date().toISOString(),
    };

    // Try to find existing company info to update
    const { data: existingRecords } = await supabase
      .from('company_info')
      .select('id')
      .limit(1);

    let result;
    if (existingRecords && existingRecords.length > 0) {
      // Update existing record
      const { data, error } = await supabase
        .from('company_info')
        .update(updateData)
        .eq('id', existingRecords[0].id)
        .select()
        .single();

      if (error) throw error;
      result = data;
    } else {
      // Create new record
      const { data, error } = await supabase
        .from('company_info')
        .insert([updateData])
        .select()
        .single();

      if (error) throw error;
      result = data;
    }

    // Convert back to camelCase for response
    return NextResponse.json({
      id: result.id,
      company: result.company,
      organizationType: result.organization_type,
      country: result.country,
      address: result.address,
      aptSuite: result.apt_suite,
      city: result.city,
      state: result.state,
      postalCode: result.postal_code,
      timezone: result.timezone,
      currency: result.currency,
      logoUrl: result.logo_url,
    });
  } catch (error: any) {
    console.error('Error updating company info:', error);
    return NextResponse.json(
      { error: 'Failed to update company information', message: error.message },
      { status: 500 }
    );
  }
}





