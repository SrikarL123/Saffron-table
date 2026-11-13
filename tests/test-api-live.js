/**
 * Live Express HTTP Endpoint & Error Handling Test
 */
const http = require('http');
const app = require('../backend/server.js');
const assert = require('assert');

async function testApi() {
  const server = http.createServer(app);

  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
  const port = server.address().port;
  const baseUrl = `http://127.0.0.1:${port}`;
  console.log(`Testing Express Server on ${baseUrl}...`);

  try {
    // 1. Health check
    const healthRes = await fetch(`${baseUrl}/api/health`);
    assert.strictEqual(healthRes.status, 200, 'Health check should return 200');
    const healthData = await healthRes.json();
    assert.strictEqual(healthData.status, 'ok', 'Status should be ok');
    assert.strictEqual(healthData.restaurant, 'The Saffron Table');
    console.log('✓ GET /api/health returned 200 OK with valid JSON');

    // 2. Restaurant info
    const infoRes = await fetch(`${baseUrl}/api/restaurant-info`);
    assert.strictEqual(infoRes.status, 200, 'Info should return 200');
    const infoData = await infoRes.json();
    assert.strictEqual(infoData.name, 'The Saffron Table');
    assert.strictEqual(infoData.outlets.length, 2);
    console.log('✓ GET /api/restaurant-info returned 200 OK');

    // 3. POST /api/chat with empty message (Validation test)
    const emptyMsgRes = await fetch(`${baseUrl}/api/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: '   ' })
    });
    assert.strictEqual(emptyMsgRes.status, 400, 'Empty message should return 400');
    const emptyMsgData = await emptyMsgRes.json();
    assert(emptyMsgData.error.includes('empty'), 'Error message should indicate empty');
    console.log('✓ POST /api/chat with empty message correctly returned 400 Validation Error');

    // 4. POST /api/chat with excessive length > 1000 chars (Validation test)
    const longMsg = 'a'.repeat(1005);
    const longMsgRes = await fetch(`${baseUrl}/api/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: longMsg })
    });
    assert.strictEqual(longMsgRes.status, 400, 'Message > 1000 chars should return 400');
    const longMsgData = await longMsgRes.json();
    assert(longMsgData.error.includes('maximum limit'), 'Error should mention maximum limit');
    console.log('✓ POST /api/chat with >1000 characters correctly returned 400 Length Error');

    // 5. POST /api/chat without valid GROQ_API_KEY (Friendly 503 error test)
    const chatRes = await fetch(`${baseUrl}/api/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: 'What are your bestsellers?' })
    });
    assert.strictEqual(chatRes.status, 503, 'Unconfigured API key should return 503');
    const chatData = await chatRes.json();
    assert(chatData.error.includes('GROQ_API_KEY is not configured'), 'Error should guide user to set GROQ_API_KEY');
    console.log('✓ POST /api/chat without API key correctly returned 503 with friendly setup instructions');

    // 6. POST /api/chat with invalid key (Authentication 401 handling test)
    const origKey = process.env.GROQ_API_KEY;
    try {
      process.env.GROQ_API_KEY = 'gsk_mock_invalid_key_for_testing_1234567890';
      const invalidKeyRes = await fetch(`${baseUrl}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: 'Hello' })
      });
      // Groq returns 401 Unauthorized for fake keys
      assert(invalidKeyRes.status === 401 || invalidKeyRes.status === 500, 'Invalid key should return 401 or fail safely');
      const invalidKeyData = await invalidKeyRes.json();
      assert(invalidKeyData.error, 'Response must contain error property');
      console.log(`✓ POST /api/chat with invalid key correctly handled with status ${invalidKeyRes.status} (${invalidKeyData.error.slice(0, 45)}...)`);
    } finally {
      process.env.GROQ_API_KEY = origKey;
    }

    console.log('\nAll API endpoint and validation tests passed successfully!');
  } finally {
    server.close();
  }
}

testApi().catch((err) => {
  console.error('API test failed:', err);
  process.exit(1);
});
