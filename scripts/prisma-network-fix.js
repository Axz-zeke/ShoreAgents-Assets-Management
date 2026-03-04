const fs = require('fs');
const path = require('path');
const { PrismaClient } = require('@prisma/client');

// Manual .env parsing
const envPath = path.join(__dirname, '..', '.env');
if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, 'utf8');
    envContent.split('\n').forEach(line => {
        const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
        if (match) {
            let value = (match[2] || '').trim();
            if (value.startsWith('"') && value.endsWith('"')) value = value.slice(1, -1);
            process.env[match[1]] = value;
        }
    });
}

const prisma = new PrismaClient();

async function main() {
    console.log('Recategorizing via Prisma (Manual Env)...');

    // 1. Rename NETWORK DEVICE
    const networkDeviceUpdate = await prisma.assets.updateMany({
        where: {
            category: {
                in: ['NETWORK DEVICE', 'NETWORK EQUIPMENT', 'Network Device']
            }
        },
        data: {
            category: 'Network Equipment'
        }
    });
    console.log(`Renamed ${networkDeviceUpdate.count} legacy network entries.`);

    // 2. Identify by sub_category
    const subCatUpdate = await prisma.assets.updateMany({
        where: {
            sub_category: {
                contains: 'NETWORK',
                mode: 'insensitive'
            },
            category: {
                in: ['IT Equipment', 'IT EQUIPMENT']
            }
        },
        data: {
            category: 'Network Equipment'
        }
    });
    console.log(`Moved ${subCatUpdate.count} assets based on sub_category.`);

    // 3. Identify by name
    const networkKeywords = ['Switch', 'Router', 'Server', 'Firewall', 'UPS', 'Rack', 'PDU', 'Cabinet'];
    let movedByName = 0;
    for (const kw of networkKeywords) {
        const result = await prisma.assets.updateMany({
            where: {
                name: {
                    contains: kw,
                    mode: 'insensitive'
                },
                category: {
                    in: ['IT Equipment', 'IT EQUIPMENT']
                }
            },
            data: {
                category: 'Network Equipment'
            }
        });
        movedByName += result.count;
    }
    console.log(`Moved ${movedByName} assets based on name keywords.`);
}

main()
    .catch(e => console.error(e))
    .finally(() => prisma.$disconnect());
