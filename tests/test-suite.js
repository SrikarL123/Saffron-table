/**
 * The Saffron Table - Comprehensive Test Suite
 * Tests Phase 1 (Maps & Outlets) and Phase 2 (Saffron AI Backend & Frontend)
 */
const fs = require('fs');
const path = require('path');
const assert = require('assert');

const ROOT_DIR = path.join(__dirname, '..');
const restaurantData = require(path.join(ROOT_DIR, 'restaurant-data.js'));

let passed = 0;
let failed = 0;

function it(desc, fn) {
  try {
    fn();
    console.log(`  ✓ ${desc}`);
    passed++;
  } catch (err) {
    console.error(`  ✗ ${desc}`);
    console.error(`    Error: ${err.message}`);
    failed++;
  }
}

async function runTests() {
  console.log('\n--- 1. Testing Single Source of Truth (restaurant-data.js) ---');
  it('Exports CONFIG, CATS, ALL, SIG, OFFERS, REV, FAQ', () => {
    assert(restaurantData.CONFIG, 'CONFIG is missing');
    assert(restaurantData.CATS, 'CATS is missing');
    assert(restaurantData.ALL, 'ALL is missing');
    assert(restaurantData.SIG, 'SIG is missing');
    assert(restaurantData.OFFERS, 'OFFERS is missing');
    assert(restaurantData.REV, 'REV is missing');
    assert(restaurantData.FAQ, 'FAQ is missing');
  });

  it('Contains both fictional outlets (Banjara Hills and Gachibowli)', () => {
    const outlets = restaurantData.CONFIG.outlets;
    assert.strictEqual(outlets.length, 2, 'Should have exactly 2 outlets');
    assert(outlets[0].name.includes('Banjara Hills'), 'First outlet should be Banjara Hills');
    assert(outlets[1].name.includes('Gachibowli'), 'Second outlet should be Gachibowli');
    assert.strictEqual(outlets[0].real, false, 'Outlet should be marked real: false');
    assert.strictEqual(outlets[1].real, false, 'Outlet should be marked real: false');
  });

  it('Contains menu items across 9 categories with prices and veg indicators', () => {
    const cats = Object.keys(restaurantData.CATS);
    assert.strictEqual(cats.length, 9, 'Should have 9 categories');
    assert(restaurantData.ALL.length > 25, 'Should have over 25 dishes');
    restaurantData.ALL.forEach(item => {
      assert(typeof item.n === 'string' && item.n.length > 0, 'Dish must have a name');
      assert(typeof item.p === 'number' && item.p > 0, `Dish ${item.n} must have a positive price`);
      assert(item.v === 0 || item.v === 1, `Dish ${item.n} must have veg status 0 or 1`);
      assert(typeof item.d === 'string', `Dish ${item.n} must have a description`);
    });
  });

  console.log('\n--- 2. Testing Phase 1: Maps and Outlets in index.html ---');
  const indexHtml = fs.readFileSync(path.join(ROOT_DIR, 'index.html'), 'utf-8');

  it('Preserves both outlet cards with responsive map embeds', () => {
    assert(indexHtml.includes('CONFIG.outlets.map'), 'Outlets should be dynamically rendered from CONFIG');
    assert(indexHtml.includes('class="map"'), 'Must have .map container');
    assert(indexHtml.includes('loading="lazy"'), 'Map iframe must have loading="lazy"');
    assert(indexHtml.includes('output=embed'), 'Must use free embed URL without paid API key');
  });

  it('Includes clearly visible Get Directions links using Google Maps search URLs', () => {
    assert(indexHtml.includes('https://www.google.com/maps/search/?api=1&query='), 'Must use Google Maps search URL for directions');
    assert(indexHtml.includes('Get Directions'), 'Must have clearly visible "Get Directions" button text');
    assert(indexHtml.includes('rel="noopener"'), 'Must have rel="noopener" on external link');
    assert(indexHtml.includes('target="_blank"'), 'Must open in target="_blank"');
  });

  it('Clearly labels both outlets as demo locations', () => {
    assert(indexHtml.includes('Demo Outlet'), 'Must label outlets as Demo');
    assert(indexHtml.includes('Demo Notice:'), 'Must show a demo notice explaining fictional coordinates');
  });

  it('Displays opening hours, regular hours, weekly closing days and special timings', () => {
    assert(indexHtml.includes("Today's Hours"), "Must display Today's Hours");
    assert(indexHtml.includes("Regular Hours"), "Must display Regular Hours");
    assert(indexHtml.includes("Weekly Off"), "Must display Weekly Off");
    assert(indexHtml.includes("Special Timings"), "Must display Special Timings");
  });

  console.log('\n--- 3. Testing Phase 2: Saffron AI Frontend in index.html ---');
  it('Includes floating chat button with accessible attributes', () => {
    assert(indexHtml.includes('id="sc-toggle"'), 'Must include #sc-toggle button');
    assert(indexHtml.includes('aria-label="Open Saffron AI assistant"'), 'Must have aria-label for accessibility');
    assert(indexHtml.includes('aria-expanded="false"'), 'Must have aria-expanded attribute');
    assert(indexHtml.includes('aria-controls="sc-modal"'), 'Must have aria-controls attribute');
  });

  it('Includes modern chat modal matching visual identity with welcome message and typing indicator', () => {
    assert(indexHtml.includes('id="sc-modal"'), 'Must include #sc-modal element');
    assert(indexHtml.includes('role="dialog"'), 'Must have role="dialog"');
    assert(indexHtml.includes('id="sc-messages"'), 'Must include #sc-messages container');
    assert(indexHtml.includes('id="sc-form"'), 'Must include #sc-form');
    assert(indexHtml.includes('id="sc-input"'), 'Must include #sc-input');
    assert(indexHtml.includes('id="sc-send"'), 'Must include #sc-send button');
    assert(indexHtml.includes('sc-typing'), 'Must include typing indicator logic');
    assert(indexHtml.includes('Namaste!'), 'Must include warm welcome greeting');
  });

  it('Includes all 5 required suggested prompt chips', () => {
    const requiredPrompts = [
      'Recommend something for me.',
      'Show vegetarian dishes.',
      'What are your bestsellers?',
      'What offers are available?',
      'Where are your outlets?'
    ];
    requiredPrompts.forEach(prompt => {
      assert(indexHtml.includes(prompt), `Must include suggested prompt: "${prompt}"`);
    });
  });

  it('Includes keyboard support (Escape to close, Enter to send)', () => {
    assert(indexHtml.includes('e.key === "Escape"'), 'Must support Escape key to close modal');
    assert(indexHtml.includes('formEl.onsubmit'), 'Must support Enter key to send via form submit');
  });

  it('Preserves chat history while avoiding duplication and error pollution', () => {
    assert(indexHtml.includes('const historyPayload = chatHistory.slice(-8)'), 'Must snapshot history before adding latest message');
    assert(indexHtml.includes('renderMessage("user", trimmed)'), 'Must render user message separately');
    assert(indexHtml.includes('renderMessage("assistant", `I apologize: ${errorMsg}`, true)'), 'Error messages must not be added to chatHistory');
    assert(indexHtml.includes('chatHistory.push({ role: "assistant", content: data.reply })'), 'Only genuine replies pushed to chatHistory');
  });

  console.log('\n--- 4. Testing Backend Server Structure & Endpoints ---');
  const serverPath = path.join(ROOT_DIR, 'backend', 'server.js');
  assert(fs.existsSync(serverPath), 'backend/server.js must exist');

  const app = require(serverPath);
  it('Exports Express app instance', () => {
    assert(app && typeof app.use === 'function', 'Must export valid Express app');
  });

  it('Has Rate Limiting configured', () => {
    const serverCode = fs.readFileSync(serverPath, 'utf-8');
    assert(serverCode.includes('express-rate-limit'), 'Must use express-rate-limit');
    assert(serverCode.includes('RATE_LIMIT_PER_MINUTE'), 'Must respect rate limit env variable');
  });

  it('Validates input message length, type, and deduplicates history', () => {
    const serverCode = fs.readFileSync(serverPath, 'utf-8');
    assert(serverCode.includes('trimmedMessage.length > 1000'), 'Must limit messages to 1000 characters');
    assert(serverCode.includes("trimmedMessage.length === 0"), 'Must reject empty messages');
    assert(serverCode.includes("validHistory.pop()"), 'Must deduplicate if client sends latest message in history');
  });

  it('System prompt contains accurate knowledge without unsupported 2014 or allergen claims', () => {
    const serverCode = fs.readFileSync(serverPath, 'utf-8');
    assert(serverCode.includes('STRICT OPERATIONAL RULES & GUARDRAILS'), 'Must contain strict guardrails');
    assert(serverCode.includes('NEVER invent or hallucinate'), 'Must explicitly forbid inventing menu items');
    assert(serverCode.includes('Atithi Devo Bhava'), 'Must embrace gracious Indian hospitality');
    assert(serverCode.includes('NEVER claim or promise that a reservation is confirmed'), 'Must enforce reservation rules');
    assert(serverCode.includes('NEVER invent a phone number'), 'Must forbid inventing phone numbers');
    // Ensure unsupported claims are NOT present
    assert(!serverCode.includes('established in 2014'), 'Must not claim established in 2014 in system prompt');
    assert(!serverCode.includes('kitchen that handles dairy, nuts, and gluten'), 'Must not make unverified claims about kitchen allergen handling');
    assert(serverCode.includes('ALLERGENS & INGREDIENT ENQUIRIES'), 'Must have specific allergen guidance directing to staff');
  });

  console.log('\n=======================================');
  console.log(`Results: ${passed} passed, ${failed} failed`);
  console.log('=======================================\n');

  if (failed > 0) {
    process.exit(1);
  }
}

runTests().catch(err => {
  console.error('Test execution failed:', err);
  process.exit(1);
});
