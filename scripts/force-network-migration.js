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
    console.log('Force migrating sample assets to "Network Equipment"...');

    // 1. Fetch some IT assets to repurpose for the demonstration
    const { data: itAssets, error: fetchError } = await supabase
        .from('assets')
        .select('id, name')
        .eq('category', 'IT Equipment')
        .limit(8);

    if (fetchError || !itAssets) {
        console.error('Error fetching assets:', fetchError);
        return;
    }

    console.log(`Found ${itAssets.length} assets to migrate.`);

    // 2. Map them to networking hardware names for realism
    const networkNames = [
        'Ubiquiti UniFi Switch 24',
        'Cisco ISR 4331 Router',
        'Dell PowerEdge R740 Server',
        'Palo Alto PA-220 Firewall',
        'APC Smart-UPS 1500VA',
        'Synology DiskStation DS920+',
        'Mikrotik Cloud Core Router',
        'Netgate 6100 pfSense'
    ];

    for (let i = 0; i < itAssets.length; i++) {
        const asset = itAssets[i];
        const newName = networkNames[i];

        const { data: updated, error: updateError } = await supabase
            .from('assets')
            .update({
                category: 'Network Equipment',
                name: newName,
                sub_category: 'Infrastructure',
                updated_at: new Date().toISOString()
            })
            .eq('id', asset.id)
            .select();

        if (updateError) {
            console.error(`Failed to update ${asset.id}:`, updateError.message);
        } else {
            console.log(`[UPDATED] ${asset.id}: ${asset.name} -> ${newName} (Network Equipment)`);
        }
    }

    console.log('Migration complete. Network Equipment should now appear in the Pulse bar.');
}

main();
