
const http = require('http');

const data = JSON.stringify({
  email: 'test-admin@shoreagents.com',
  password: 'TemporaryPassword123!',
  first_name: 'Test',
  last_name: 'Admin',
  employee_id: 'TEST001'
});

const options = {
  hostname: 'localhost',
  port: 3000,
  path: '/api/admin/create-admin',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': data.length
  }
};

const req = http.request(options, (res) => {
  let body = '';
  res.on('data', (chunk) => body += chunk);
  res.on('end', () => {
    console.log('Status:', res.statusCode);
    console.log('Body:', body);
  });
});

req.on('error', (e) => console.error('Error:', e));
req.write(data);
req.end();
