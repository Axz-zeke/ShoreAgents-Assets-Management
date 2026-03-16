require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function checkAsset() {
  const { data, error } = await supabase
    .from('assets')
    .select('*')
    .eq('asset_tag_id', 'FINAL-TEST-001')
    .single();

  console.log('Error:', error);
  console.log('Data:', data);
}

checkAsset();
