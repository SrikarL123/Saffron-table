/**
 * Frontend DOM & Logic Verification Test
 */
const fs = require('fs');
const path = require('path');
const assert = require('assert');

const ROOT_DIR = path.join(__dirname, '..');
const html = fs.readFileSync(path.join(ROOT_DIR, 'index.html'), 'utf-8');

function testFrontend() {
  console.log('\n--- Testing Frontend Markup & Components ---');

  // Check script tags order
  const dataScriptIdx = html.indexOf('<script src="restaurant-data.js"></script>');
  const mainScriptIdx = html.indexOf('<script>\nconst $=s=>document.querySelector(s)');
  assert(dataScriptIdx !== -1, 'restaurant-data.js script tag must be present');
  assert(mainScriptIdx !== -1, 'main script tag must be present');
  assert(dataScriptIdx < mainScriptIdx, 'restaurant-data.js must load BEFORE inline script');
  console.log('✓ Script order: restaurant-data.js loads before main application logic');

  // Check Outlets DOM structure
  assert(html.includes('id="outlets"'), 'Outlets section must be present');
  assert(html.includes('id="ol"'), 'Outlet container #ol must be present');
  assert(html.includes('Get Directions'), 'Must contain Get Directions label');
  assert(html.includes('https://www.google.com/maps/search/?api=1&query='), 'Must use search query URL');
  assert(html.includes('https://www.google.com/maps?q='), 'Must use Google Maps embed URL');
  assert(html.includes('output=embed'), 'Must request embed output format');
  console.log('✓ Outlets: Google Maps search URLs and embed iframes verified');

  // Check Saffron AI components
  assert(html.includes('id="sc-toggle"'), 'Floating toggle button #sc-toggle must be present');
  assert(html.includes('id="sc-modal"'), 'Chat window #sc-modal must be present');
  assert(html.includes('id="sc-messages"'), 'Messages area #sc-messages must be present');
  assert(html.includes('id="sc-prompts"'), 'Suggested prompts #sc-prompts must be present');
  assert(html.includes('id="sc-form"'), 'Chat form #sc-form must be present');
  assert(html.includes('id="sc-input"'), 'Input element #sc-input must be present');
  assert(html.includes('id="sc-send"'), 'Send button #sc-send must be present');
  assert(html.includes('id="sc-close"'), 'Close button #sc-close must be present');
  console.log('✓ Saffron AI: All core elements and controls present in DOM');

  // Check Suggested Prompts
  const expectedPrompts = [
    'Recommend something for me.',
    'Show vegetarian dishes.',
    'What are your bestsellers?',
    'What offers are available?',
    'Where are your outlets?'
  ];
  expectedPrompts.forEach(p => {
    assert(html.includes(`data-prompt="${p}"`), `Chip for "${p}" must exist`);
  });
  console.log('✓ Saffron AI: All 5 prompt chips verified with exact dataset attributes');

  // Check CSS for mobile responsiveness
  assert(html.includes('@media(max-width:959px)'), 'Mobile responsive breakpoint 959px verified');
  assert(html.includes('@media(max-width:600px)'), 'Mobile responsive breakpoint 600px verified');
  assert(html.includes('safe-area-inset-bottom'), 'Safe area insets handled for modern mobile screens');
  console.log('✓ Styling: Responsive breakpoints and mobile safe area handling verified');

  // Test formatMarkdown function
  const formatMarkdownCode = html.substring(
    html.indexOf('function formatMarkdown(text) {'),
    html.indexOf('// Saffron AI Chat Assistant Controller')
  );
  const formatMarkdown = new Function('text', formatMarkdownCode + '\nreturn formatMarkdown(text);');
  
  const testMd = '**Paneer Butter Masala** (₹300) is *delicious*.\n- Dish 1\n- Dish 2\nVisit #menu or reserve at #contact';
  const parsed = formatMarkdown(testMd);
  assert(parsed.includes('<strong>Paneer Butter Masala</strong>'), 'Markdown bold parsed');
  assert(parsed.includes('<em>delicious</em>'), 'Markdown italic parsed');
  assert(parsed.includes('<ul><li>Dish 1</li><li>Dish 2</li></ul>'), 'Markdown list parsed');
  assert(parsed.includes('<a href="#menu">#menu</a>'), 'Internal link to #menu parsed');
  assert(parsed.includes('<a href="#contact">#contact</a>'), 'Internal link to #contact parsed');
  console.log('✓ Markdown Parser: Bold, italic, bullet lists, prices, and internal anchors verified');

  // Verify chat history deduplication & error isolation
  assert(html.includes('const historyPayload = chatHistory.slice(-8);'), 'Must snapshot history before user message');
  assert(html.includes('history: historyPayload'), 'Must send snapshot as history, separate from message');
  assert(html.includes('renderMessage("assistant", `I apologize: ${errorMsg}`, true);'), 'API errors must not be pushed to chatHistory');
  console.log('✓ Chat History: Single-send message verified & error message isolation verified');

  console.log('\nAll frontend checks passed successfully!\n');
}

testFrontend();
