# The Saffron Table — Backend API & Saffron AI Assistant

This is the Express.js backend server powering **Saffron AI**, the AI dining assistant for The Saffron Table. It connects to the Groq API using high-performance models (such as `llama-3.3-70b-versatile` or `llama-3.1-8b-instant`) and provides real-time, grounded restaurant information.

## Features

- **Single Source of Truth**: Dynamically reads restaurant menus, pricing, dietary indicators, outlet timings, offers, and FAQs from `../restaurant-data.js`.
- **Grounded AI Guardrails**: Strict instructions preventing hallucinations about unlisted dishes, prices, discounts, coordinates, or fake confirmation of reservations.
- **Rate Limiting**: Integrated `express-rate-limit` protecting `/api/chat` against spam.
- **Message Validation**: Enforces length restrictions (max 1,000 characters) and validates chat histories.
- **Graceful Error Handling**: Detects missing or invalid Groq API keys, rate limits, and network timeouts with user-friendly error messages.
- **Clean Architecture**: Clean separation between frontend client and backend service.

---

## Prerequisites

- [Node.js](https://nodejs.org/) v18 or higher (Node v20+ recommended).
- A free or paid [Groq Cloud API Key](https://console.groq.com/keys).

---

## Installation & Setup

1. Open a terminal and navigate to the `backend` directory:
   ```bash
   cd backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Configure your environment variables:
   Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```
   (On Windows PowerShell: `Copy-Item .env.example .env`)

4. Open `.env` and add your Groq API key:
   ```env
   PORT=5000
   GROQ_API_KEY=gsk_your_groq_api_key_here
   GROQ_MODEL=llama-3.3-70b-versatile
   RATE_LIMIT_PER_MINUTE=30
   CORS_ORIGIN=*
   ```

---

## Starting the Server

### Production / Standard Mode
```bash
npm start
```

### Development Mode (with auto-reload on Node 18+)
```bash
npm run dev
```

The server will start on `http://localhost:5000`.

---

## API Endpoints

### 1. Health Check
- **GET** `/api/health`
- **Response**:
  ```json
  {
    "status": "ok",
    "restaurant": "The Saffron Table",
    "model": "llama-3.3-70b-versatile",
    "groqConfigured": true,
    "timestamp": "2026-11-13T07:15:00.000Z"
  }
  ```

### 2. Chat with Saffron AI
- **POST** `/api/chat`
- **Headers**: `Content-Type: application/json`
- **Rate Limit**: Default 30 requests/minute per IP
- **Request Body**:
  ```json
  {
    "message": "What vegetarian main course dishes do you recommend?",
    "history": [
      { "role": "user", "content": "Hello" },
      { "role": "assistant", "content": "Namaste! Welcome to The Saffron Table." }
    ]
  }
  ```
- **Response**:
  ```json
  {
    "reply": "For a delightful vegetarian main course, I highly recommend our signature **Paneer Butter Masala** (₹300) or **Kadai Paneer** (₹310) paired with fresh **Butter Naan** (₹60).",
    "model": "llama-3.3-70b-versatile"
  }
  ```

### 3. Restaurant Info
- **GET** `/api/restaurant-info`
- **Response**: Summarized categories, offers, and outlet details.
