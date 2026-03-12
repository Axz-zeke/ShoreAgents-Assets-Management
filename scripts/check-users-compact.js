
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

function getEnv(key) {
  const env = fs.readFileSync('.env', 'utf8');
  const match = env.match(new RegExp(`^${key}=(.*)$`, 'm'));
  return match ? match[1].trim().replace(/^"(.*)"$/, '$1') : null;
}

const supabaseUrl = getEnv('NEXT_PUBLIC_SUPABASE_URL');
const supabaseServiceKey = getEnv('SUPABASE_SERVICE_ROLE_KEY');
const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function check() {
  const { data: users } = await supabase.from('users').select('id, user_type');
  console.log('PUBLIC.USERS:', users?.length || 0);
  users?.forEach(u => console.log(`ID: ${u.id}, Role: ${u.user_type}`));

  const { data: auth } = await supabase.auth.admin.listUsers();
  console.log('\nAUTH.USERS:', auth?.users?.length || 0);
  auth?.users?.forEach(u => console.log(`ID: ${u.id}, Email: ${u.email}`));
}
check();
