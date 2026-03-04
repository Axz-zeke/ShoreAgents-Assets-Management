const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function testCompanyInfo() {
  try {
    console.log('🔍 Testing Company Info functionality...\n');
    
    // 1. Check if company_info table exists and has data
    const companyInfo = await prisma.company_info.findFirst();
    
    if (companyInfo) {
      console.log('✅ Company info found in database:');
      console.log('   Company:', companyInfo.company);
      console.log('   Organization Type:', companyInfo.organization_type || 'Not set');
      console.log('   Timezone:', companyInfo.timezone || 'Not set');
      console.log('   Currency:', companyInfo.currency || 'Not set');
      console.log('   Logo URL:', companyInfo.logo_url ? 'Set' : 'Not set');
      console.log('   Last Updated:', companyInfo.updated_at);
    } else {
      console.log('⚠️  No company info found in database (this is normal on first run)');
      console.log('   Default data will be created when you save for the first time.');
    }
    
    console.log('\n✅ Database connection successful!');
    console.log('✅ Timezone and Currency fields are ready to use!');
    console.log('\n📝 To test:');
    console.log('   1. Go to /setup/company-info');
    console.log('   2. Click "Edit Company Info"');
    console.log('   3. Change Timezone and Currency');
    console.log('   4. Click "Save Changes"');
    console.log('   5. Refresh the page to see the values persist');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    if (error.code === 'P2021') {
      console.log('\n⚠️  Table does not exist. Run the migration:');
      console.log('   node scripts/run-company-info-migration.js');
    }
  } finally {
    await prisma.$disconnect();
  }
}

testCompanyInfo();





