
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

async function promoteAdmin() {
  const userId = 'e5c86fb7-1611-4362-9421-a4edb3806996';
  console.log('Promoting user to admin:', userId);
  
  const { data, error } = await supabase
    .from('users')
    .insert([{ id: userId, user_type: 'admin' }])
    .select();
    
  if (error) {
    if (error.code === '23505') {
       console.log('User already exists, updating...');
       const { data: updateData, error: updateError } = await supabase
         .from('users')
         .update({ user_type: 'admin' })
         .eq('id', userId)
         .select();
       if (updateError) console.error('Update error:', updateError);
       else console.log('Update success:', updateData);
    } else {
      console.error('Insert error:', error);
    }
  } else {
    console.log('Insert success:', data);
  }
}

promoteAdmin();
