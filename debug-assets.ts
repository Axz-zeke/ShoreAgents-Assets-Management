import { supabaseAdmin } from './src/lib/supabase/admin';

async function main() {
    const { data, error } = await supabaseAdmin.from('assets').select('asset_tag_id, status').limit(20);
    if (error) {
        console.error(error);
        process.exit(1);
    }
    console.log(JSON.stringify(data, null, 2));
    process.exit(0);
}

main();
