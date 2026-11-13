const express = require('express');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const dotenv = require('dotenv');
const { Groq } = require('groq-sdk');
const path = require('path');

// Load environment variables from backend/.env
dotenv.config({ path: path.join(__dirname, '.env') });

// Load restaurant data from single source of truth
const restaurantData = require('../restaurant-data.js');
const { CONFIG, CATS, ALL, SIG, OFFERS, REV, FAQ } = restaurantData;

const app = express();
const PORT = process.env.PORT || 5000;
const GROQ_MODEL = process.env.GROQ_MODEL || 'openai/gpt-oss-120b';

// CORS configuration
const corsOrigin = process.env.CORS_ORIGIN || '*';
app.use(cors({
  origin: corsOrigin === '*' ? true : corsOrigin,
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json({ limit: '64kb' }));

// Rate limiter for chat endpoint
const limiterWindowMs = 60 * 1000; // 1 minute
const limiterMax = parseInt(process.env.RATE_LIMIT_PER_MINUTE, 10) || 30;
const chatLimiter = rateLimit({
  windowMs: limiterWindowMs,
  max: limiterMax,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: 'Too many requests from this IP. Please wait a moment before sending another message.'
  }
});

// Build dynamic system prompt using restaurant data
function buildSystemPrompt() {
  const outletsInfo = CONFIG.outlets.map(o => {
    const specialInfo = o.note ? ` Note: ${o.note}.` : '';
    const weeklyOff = o.off === null ? 'None (open 7 days)' : (o.off === 1 ? 'Mondays' : `Day ${o.off}`);
    return `- ${o.name}: Located at ${o.addr}. Hours: ${o.open} to ${o.close}. Weekly off: ${weeklyOff}.${specialInfo} (Fictional demo outlet in ${o.neighbourhood}, Hyderabad)`;
  }).join('\n');

  const menuInfo = Object.entries(CATS).map(([category, items]) => {
    const itemList = items.map(([name, price, isVeg, desc, tag]) => {
      const diet = isVeg ? '[Vegetarian]' : '[Non-Vegetarian]';
      const badge = tag ? ` (${tag})` : '';
      return `  • ${name} ${diet} - ₹${price}${badge}: ${desc}`;
    }).join('\n');
    return `### ${category}:\n${itemList}`;
  }).join('\n\n');

  const offersInfo = OFFERS.map(([name, price, validity, desc]) => {
    const pStr = typeof price === 'number' ? `₹${price}` : price;
    return `- **${name}** (${pStr}): ${desc}. (Valid: ${validity})`;
  }).join('\n');

  const faqInfo = FAQ.map(([q, a]) => `Q: ${q}\nA: ${a}`).join('\n\n');

  return `You are "Saffron AI", the warm, courteous, and knowledgeable culinary concierge for "The Saffron Table", a premium fictional Indian restaurant concept in Hyderabad.

### YOUR ROLE & VOICE
- Welcome guests with refined, gracious Indian hospitality ("Atithi Devo Bhava").
- Keep replies concise, helpful, and beautifully formatted with Markdown (bullet points, bold highlights, itemized prices).
- Never sound robotic or dismissive.

### RESTAURANT KNOWLEDGE BASE (SINGLE SOURCE OF TRUTH)
Restaurant Name: ${CONFIG.name}
Tagline: ${CONFIG.tagline}
Cuisines: Authentic North Indian, South Indian, Biryani, Indo-Chinese, and Continental.
Location: Hyderabad, India (Both outlets are fictional demo locations).

OUTLETS & TIMINGS:
${outletsInfo}

OFFERS & MEAL DEALS:
${offersInfo}

FULL MENU & PRICES:
${menuInfo}

SIGNATURE DISHES:
- Paneer Butter Masala (₹300, Vegetarian, Bestseller)
- Chicken 65 (₹320, Non-Vegetarian, Bestseller)
- Paneer Tikka (₹280, Vegetarian, Bestseller)
- Brownie with Ice Cream (₹220, Vegetarian, Bestseller)
- Kadai Paneer (₹310, Vegetarian)

FREQUENTLY ASKED QUESTIONS:
${faqInfo}

### STRICT OPERATIONAL RULES & GUARDRAILS
1. SOURCE OF TRUTH:
   - Base all answers ONLY on the provided restaurant data.
   - NEVER invent or hallucinate dishes, prices, discounts, ingredients, branches, coordinates, ratings, or policies.
   - Do not invent restaurant history, founding years, or business facts not present in the data.
   - If an item or cuisine is NOT on the menu (e.g. pizza, burgers, sushi, dosas, idli, alcohol/beer/cocktails, pork, beef), politely state that The Saffron Table does not serve it, and suggest an authentic alternative from our actual menu.
2. DIETARY PREFERENCES:
   - When asked for vegetarian options, ONLY recommend items with [Vegetarian] status.
   - When asked for non-vegetarian options, recommend items with [Non-Vegetarian] status.
3. BUDGET RECOMMENDATIONS:
   - When a guest specifies a budget (e.g., "dinner under ₹600" or "meal for two under ₹1000"), calculate combinations using EXACT prices from the menu. Show individual prices and the exact total.
   - Suggest relevant offers (like Lunch Express at ₹249, Couple's Delight at ₹799, or Family Feast at ₹1,299) if they fit the guest's needs.
4. OUTLET & TIMING ENQUIRIES:
   - Always mention our two demo outlets in Hyderabad: Banjara Hills and Gachibowli.
   - Highlight that Banjara Hills is open daily 11:00 AM - 11:00 PM (open till midnight on Fridays & Saturdays) with no weekly off.
   - Highlight that Gachibowli is open 11:00 AM - 10:30 PM and is CLOSED on Mondays.
   - Note that both outlets are illustrative demo locations.
5. RESERVATIONS & BOOKINGS:
   - Help guests plan reservations conversationally by collecting details: Date, Preferred Time (between 11:00 AM and 10:30 PM), Outlet (Banjara Hills or Gachibowli), Number of Guests, and any Seating preferences.
   - Direct them to fill out the "Reserve a Table" form on our website (#contact section).
   - NEVER claim or promise that a reservation is confirmed. Explain that submitting the form sends a request via WhatsApp, and the restaurant team will confirm table availability.
   - NEVER invent a phone number or WhatsApp number.
6. ALLERGENS & INGREDIENT ENQUIRIES:
   - For questions regarding allergens, specific ingredients, or cross-contamination, explain honestly that complete ingredient and allergen details are not specified in the demo restaurant data and must be confirmed directly with restaurant staff before ordering.
   - Do not make unverified claims about kitchen facilities, preparation practices, or allergen handling.
7. ACCURACY & HONESTY:
   - If any information is missing or unknown, state honestly: "I don't have that specific information in my records, but our restaurant team will be delighted to help you directly."`;
}

const SYSTEM_PROMPT = buildSystemPrompt();

// Health Check Endpoint
app.get('/api/health', (req, res) => {
  const isGroqConfigured = Boolean(
    process.env.GROQ_API_KEY &&
    process.env.GROQ_API_KEY.trim() !== '' &&
    process.env.GROQ_API_KEY !== 'your_groq_api_key_here'
  );

  res.json({
    status: 'ok',
    restaurant: CONFIG.name,
    model: GROQ_MODEL,
    groqConfigured: isGroqConfigured,
    timestamp: new Date().toISOString()
  });
});

// Restaurant Info Endpoint
app.get('/api/restaurant-info', (req, res) => {
  res.json({
    name: CONFIG.name,
    outlets: CONFIG.outlets,
    categories: Object.keys(CATS),
    offers: OFFERS,
    faq: FAQ
  });
});

// Chat Endpoint
app.post('/api/chat', chatLimiter, async (req, res) => {
  try {
    const { message, history } = req.body;

    // Validate message
    if (!message || typeof message !== 'string') {
      return res.status(400).json({
        error: 'Message is required and must be a string.'
      });
    }

    const trimmedMessage = message.trim();
    if (trimmedMessage.length === 0) {
      return res.status(400).json({
        error: 'Message cannot be empty.'
      });
    }

    if (trimmedMessage.length > 1000) {
      return res.status(400).json({
        error: 'Message exceeds the maximum limit of 1000 characters.'
      });
    }

    // Check Groq API Key configuration
    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey || apiKey.trim() === '' || apiKey === 'your_groq_api_key_here') {
      return res.status(503).json({
        error: 'Saffron AI is currently undergoing kitchen preparation: GROQ_API_KEY is not configured in backend/.env. Please provide a valid Groq API key to enable live conversations.'
      });
    }

    // Format & validate conversation history (up to last 10 messages)
    const validHistory = [];
    if (Array.isArray(history)) {
      const recentHistory = history.slice(-10);
      for (const entry of recentHistory) {
        if (
          entry &&
          (entry.role === 'user' || entry.role === 'assistant') &&
          typeof entry.content === 'string'
        ) {
          validHistory.push({
            role: entry.role,
            content: entry.content.slice(0, 1000)
          });
        }
      }
    }

    // Ensure the latest message is not duplicated if passed inside history
    if (
      validHistory.length > 0 &&
      validHistory[validHistory.length - 1].role === 'user' &&
      validHistory[validHistory.length - 1].content.trim() === trimmedMessage
    ) {
      validHistory.pop();
    }

    // Initialize Groq client
    const groq = new Groq({ apiKey });

    // Prepare message payload
    const messages = [
      { role: 'system', content: SYSTEM_PROMPT },
      ...validHistory,
      { role: 'user', content: trimmedMessage }
    ];

    const completion = await groq.chat.completions.create({
      model: GROQ_MODEL,
      messages,
      temperature: 0.4,
      max_tokens: 800,
      top_p: 1
    });

    const reply = completion.choices?.[0]?.message?.content ||
      "I apologize, I wasn't able to process that request properly. How else may I assist you with The Saffron Table's menu or outlets?";

    return res.json({
      reply,
      model: completion.model || GROQ_MODEL
    });

  } catch (error) {
    console.error('[Saffron AI Backend Error]:', error.message || error);

    // Specific error statuses
    if (error.status === 401) {
      return res.status(401).json({
        error: 'Authentication failed with the AI service. Please verify that your GROQ_API_KEY in backend/.env is valid.'
      });
    }

    if (error.status === 429) {
      return res.status(429).json({
        error: 'The AI service rate limit has been reached. Please wait a few seconds and try your request again.'
      });
    }

    return res.status(500).json({
      error: 'An unexpected error occurred while consulting Saffron AI. Please try again shortly.'
    });
  }
});

// 404 handler for unknown backend routes
app.use((req, res) => {
  res.status(404).json({ error: 'Endpoint not found.' });
});

// Start server if executed directly
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`[Saffron Table Backend] Server listening on port ${PORT}`);
    console.log(`[Saffron Table Backend] Health endpoint: http://localhost:${PORT}/api/health`);
    console.log(`[Saffron Table Backend] Chat endpoint: http://localhost:${PORT}/api/chat`);
    if (!process.env.GROQ_API_KEY || process.env.GROQ_API_KEY === 'your_groq_api_key_here') {
      console.warn('[Saffron Table Backend] Warning: GROQ_API_KEY is not configured in backend/.env.');
    }
  });
}

module.exports = app;

