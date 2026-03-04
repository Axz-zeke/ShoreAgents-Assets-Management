const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

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
    console.log('Finalizing Network Equipment Separation...');

    try {
        // 1. Rename all variants of NETWORK DEVICE to Network Equipment
        console.log('Unifying Network Device categories...');
        const { data: networkData, error: networkError } = await supabase
            .from('assets')
            .update({ category: 'Network Equipment' })
            .or('category.ilike.NETWORK DEVICE,category.ilike.NETWORK EQUIPMENT')
            .select();

        if (networkError) console.error('Error renaming network devices:', networkError.message);
        else console.log(`Updated ${networkData?.length || 0} existing network entries.`);

        // 2. Move specific items from IT Equipment
        const keywords = ['SWITCH', 'ROUTER', 'SERVER', 'UPS', 'FIREWALL', 'ACCESS POINT', 'NUC', 'CABINET', 'RACK'];
        console.log('Retrieving IT assets for deep scan...');

        const { data: itAssets, error: itError } = await supabase
            .from('assets')
            .select('id, name, sub_category, category')
            .or('category.ilike.IT Equipment,category.ilike.IT EQUIPMENT');

        if (itError) throw itError;

        let moveCount = 0;
        for (const asset of itAssets) {
            const searchStr = `${asset.name} ${asset.sub_category}`.toUpperCase();
            if (keywords.some(kw => searchStr.includes(kw))) {
                const { error: moveError } = await supabase
                    .from('assets')
                    .update({ category: 'Network Equipment' })
                    .eq('id', asset.id);

                if (!moveError) {
                    moveCount++;
                    console.log(`[Moved] ${asset.name} to Network Equipment`);
                }
            }
        }

        console.log(`\nOperation completed successfully! Total assets moved: ${moveCount}`);
    } catch (err) {
        console.error('Operation failed:', err.message);
    }
}

main();
