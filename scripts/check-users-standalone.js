
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

async function checkUsers() {
  console.log('Using URL:', supabaseUrl);
  
  const { data: users, error } = await supabase.from('users').select('*');
  if (error) {
    console.error('Error fetching public.users:', error);
  } else {
    console.log('\n--- public.users Table ---');
    console.table(users);
  }

  const { data: authUsers, error: authError } = await supabase.auth.admin.listUsers();
  if (authError) {
    console.error('Error fetching auth users:', authError);
  } else {
    console.log('\n--- auth.users (Supabase Auth) ---');
    authUsers.users.forEach(u => {
      console.log(`ID: ${u.id}, Email: ${u.email}`);
    });
  }
}

checkUsers();
