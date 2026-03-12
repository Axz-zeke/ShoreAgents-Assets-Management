
const fetch = require('node-fetch');

async function test() {
  const response = await fetch('http://localhost:3000/api/admin/create-admin', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: 'test-admin@shoreagents.com',
      password: 'TemporaryPassword123!',
      first_name: 'Test',
      last_name: 'Admin',
      employee_id: 'TEST001'
    })
  });
  
  const result = await response.json();
  console.log('Status:', response.status);
  console.log('Result:', JSON.stringify(result, null, 2));
}

test();
