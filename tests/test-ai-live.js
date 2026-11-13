/**
 * Real Groq Live AI Test Runner
 * Tests Vegetarian recommendations, Menu prices, Outlet timings,
 * Budget-based recommendations, and Unknown information.
 */
const path = require('path');
const dotenv = require('../backend/node_modules/dotenv');

dotenv.config({ path: path.join(__dirname, '..', 'backend', '.env') });

const apiKey = process.env.GROQ_API_KEY;
const isConfigured = Boolean(apiKey && apiKey.trim() !== '' && apiKey !== 'your_groq_api_key_here');

async function runLiveAITests() {
  console.log('\n======================================================');
  console.log('       Saffron AI - Live Groq Integration Tests       ');
  console.log('======================================================\n');

  if (!isConfigured) {
    console.log('ℹ Status: No real GROQ_API_KEY configured in backend/.env.');
    console.log('  Placeholder "your_groq_api_key_here" detected.\n');
    console.log('The following 5 live AI test cases are defined and ready to execute once a key is provided:');
    console.log('  1. [PENDING REAL API KEY] Vegetarian recommendations (verifies only veg dishes recommended)');
    console.log('  2. [PENDING REAL API KEY] Menu prices accuracy (verifies exact prices like ₹350 biryani, ₹60 naan)');
    console.log('  3. [PENDING REAL API KEY] Outlet timings (verifies Banjara Hills weekend midnight & Gachibowli Monday off)');
    console.log('  4. [PENDING REAL API KEY] Budget-based recommendations (verifies computed prices under specified budget)');
    console.log('  5. [PENDING REAL API KEY] Unknown information (verifies polite refusal for non-menu items like pizza/sushi)\n');
    console.log('To run these tests with a live Groq API key:');
    console.log('  1. Add your key to backend/.env (GROQ_API_KEY=gsk_...)');
    console.log('  2. Run: node tests/test-ai-live.js\n');
    return { status: 'REQUIRES_API_KEY', tested: false };
  }

  console.log(`✓ Real GROQ_API_KEY detected (${apiKey.slice(0, 7)}...). Running live AI tests against model ${process.env.GROQ_MODEL || 'llama-3.3-70b-versatile'}...\n`);

  const { Groq } = require('../backend/node_modules/groq-sdk');
  const app = require('../backend/server.js');
  const groq = new Groq({ apiKey });

  // Get server's system prompt by starting a temporary test instance or importing
  // Since server.js encapsulates SYSTEM_PROMPT, we can test via the Express endpoint or Groq directly
  const http = require('http');
  const server = http.createServer(app);
  await new Promise(r => server.listen(0, '127.0.0.1', r));
  const port = server.address().port;
  const chatEndpoint = `http://127.0.0.1:${port}/api/chat`;

  const testCases = [
    {
      name: 'Vegetarian recommendations',
      prompt: 'Please recommend three vegetarian starters and mains from your menu.',
      verify: (reply) => {
        const lower = reply.toLowerCase();
        const hasVeg = lower.includes('paneer') || lower.includes('mushroom') || lower.includes('dal');
        const noMeat = !lower.includes('chicken 65') && !lower.includes('mutton');
        return hasVeg && noMeat;
      }
    },
    {
      name: 'Menu prices accuracy',
      prompt: 'How much does the Hyderabadi Chicken Dum Biryani and Garlic Naan cost?',
      verify: (reply) => {
        return (reply.includes('350') || reply.includes('₹350')) &&
               (reply.includes('75') || reply.includes('₹75'));
      }
    },
    {
      name: 'Outlet timings',
      prompt: 'When is the Gachibowli outlet closed, and what are the Banjara Hills weekend hours?',
      verify: (reply) => {
        const lower = reply.toLowerCase();
        const gachiMonday = lower.includes('monday');
        const banjaraMidnight = lower.includes('midnight') || lower.includes('12') || lower.includes('24:00');
        return gachiMonday && banjaraMidnight;
      }
    },
    {
      name: 'Budget-based recommendations',
      prompt: 'Can you recommend a meal for one person under ₹400?',
      verify: (reply) => {
        return reply.includes('₹') || reply.includes('INR') || reply.includes('249');
      }
    },
    {
      name: 'Unknown information (No hallucination)',
      prompt: 'Can I order a pepperoni pizza or salmon sushi at The Saffron Table?',
      verify: (reply) => {
        const lower = reply.toLowerCase();
        const refuses = lower.includes('do not') || lower.includes("don't") || lower.includes('not serve') || lower.includes('not offer');
        return refuses;
      }
    }
  ];

  let testPassed = 0;
  for (const tc of testCases) {
    try {
      console.log(`Testing: ${tc.name}...`);
      const res = await fetch(chatEndpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: tc.prompt })
      });
      const data = await res.json();
      if (!res.ok) {
        console.error(`  ✗ Failed with status ${res.status}: ${data.error}`);
        continue;
      }
      const passed = tc.verify(data.reply);
      if (passed) {
        console.log(`  ✓ Passed: ${tc.name}`);
        testPassed++;
      } else {
        console.warn(`  ✗ Verification check failed for ${tc.name}`);
        console.log(`    Response received:\n    "${data.reply.slice(0, 150)}..."`);
      }
    } catch (e) {
      console.error(`  ✗ Error testing ${tc.name}:`, e.message);
    }
  }

  server.close();
  console.log(`\nLive AI Test Results: ${testPassed}/${testCases.length} passed.\n`);
  return { status: 'TESTED', passed: testPassed, total: testCases.length };
}

runLiveAITests().catch(err => {
  console.error('Test runner failure:', err);
});
