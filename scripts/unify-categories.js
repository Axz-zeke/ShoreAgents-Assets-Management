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
    console.log('Unifying all categories to UPPERCASE...');

    const { data: assets, error: fetchError } = await supabase
        .from('assets')
        .select('id, category');

    if (fetchError || !assets) {
        console.error('Error fetching assets:', fetchError);
        return;
    }

    let updateCount = 0;
    for (const asset of assets) {
        if (!asset.category) continue;

        const unifiedCategory = asset.category.toUpperCase().trim();
        if (asset.category !== unifiedCategory) {
            const { error: updateError } = await supabase
                .from('assets')
                .update({ category: unifiedCategory })
                .eq('id', asset.id);

            if (!updateError) {
                updateCount++;
            }
        }
    }

    console.log(`Unified ${updateCount} categories to UPPERCASE.`);

    // Final count check
    const { data: finalStats } = await supabase.from('assets').select('category');
    const counts = {};
    finalStats.forEach(a => {
        const c = a.category || 'Empty';
        counts[c] = (counts[c] || 0) + 1;
    });
    console.log('Final Unified Counts:', counts);
}

main();
