const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

// Parse .env manually
const envPath = path.join(__dirname, '..', '.env');
const envContent = fs.readFileSync(envPath, 'utf8');
const env = {};
envContent.split('\n').forEach(line => {
    const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
    if (match) {
        let value = (match[2] || '').trim();
        if (value.startsWith('"') && value.endsWith('"')) value = value.slice(1, -1);
        if (value.startsWith("'") && value.endsWith("'")) value = value.slice(1, -1);
        env[match[1]] = value;
    }
});

const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);

async function main() {
    console.log('Robust Network Equipment migration started...');

    // 1. Unified search for all things networking
    const keywords = ['SWITCH', 'ROUTER', 'SERVER', 'UBIQUITI', 'CISCO', 'FIREWALL', 'UPS', 'RACK', 'NAS', 'PDU', 'PFX'];

    const { data: allAssets, error: fetchError } = await supabase
        .from('assets')
        .select('id, name, category, sub_category, description');

    if (fetchError || !allAssets) {
        console.error('Error fetching assets:', fetchError);
        return;
    }

    let movedCount = 0;
    for (const asset of allAssets) {
        const text = (`${asset.name} ${asset.category} ${asset.sub_category} ${asset.description}`).toUpperCase();
        const isNetworking = keywords.some(kw => text.includes(kw));

        if (isNetworking && asset.category !== 'Network Equipment') {
            const { error: updateError } = await supabase
                .from('assets')
                .update({
                    category: 'Network Equipment',
                    updated_at: new Date().toISOString()
                })
                .eq('id', asset.id);

            if (!updateError) {
                movedCount++;
                console.log(`[MOVED] ${asset.name} to Network Equipment`);
            }
        }
    }

    console.log(`Migration complete. Total assets moved: ${movedCount}`);

    // 2. Final check on counts
    const { data: finalStats } = await supabase.from('assets').select('category');
    const counts = {};
    finalStats.forEach(a => {
        const c = a.category || 'Empty';
        counts[c] = (counts[c] || 0) + 1;
    });
    console.log('Current Counts:', counts);
}

main();
