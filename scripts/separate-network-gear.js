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
    console.log('Scanning assets...');

    // Just fetch FIRST 100 assets to see their categories
    const { data: assets, error } = await supabase
        .from('assets')
        .select('id, name, category, sub_category')
        .limit(100);

    if (error) {
        console.error(error);
        return;
    }

    const itAssets = assets.filter(a => (a.category || '').toUpperCase().includes('IT'));
    console.log(`Found ${itAssets.length} assets with "IT" in category:`);
    itAssets.forEach(a => console.log(` - [${a.category}] ${a.name} (${a.sub_category})`));

    const networkAssets = assets.filter(a => (a.category || '').toUpperCase().includes('NETWORK'));
    console.log(`\nFound ${networkAssets.length} assets with "NETWORK" in category:`);
    networkAssets.forEach(a => console.log(` - [${a.category}] ${a.name} (${a.sub_category})`));
}

main();
