# The Saffron Table 🍽️

A modern, responsive restaurant website built for **The Saffron Table**, a fictional premium dining restaurant. The website provides an elegant browsing experience with menu exploration, outlet information, table reservations, WhatsApp enquiries, and an AI-powered restaurant assistant.

## 🌐 Features

- **Responsive Design** – Optimized for desktop, tablet, and mobile devices.
- **Homepage** – Premium restaurant presentation with hero section and prominent actions.
- **Menu Section** – Browse restaurant dishes, categories, and prices.
- **About Section** – Restaurant information and dining experience.
- **Gallery** – Visual showcase of the restaurant and dining spaces.
- **Multiple Outlets** – Information and Google Maps integration for Banjara Hills and Gachibowli demo outlets.
- **Call & WhatsApp Integration** – Direct calling and WhatsApp enquiry options.
- **Table Reservations** – Reservation and party enquiry forms.
- **Saffron AI** – AI-powered chatbot for menu recommendations, pricing, outlet timings, and restaurant-related questions.
- **Mobile Contact Bar** – Sticky Call, WhatsApp, and Reserve actions for mobile visitors.

## 🛠️ Technology Stack

| Component | Technology |
|---|---|
| Frontend | HTML5, CSS3, JavaScript |
| Backend | Node.js, Express.js |
| AI Integration | Groq API |
| AI Model | `openai/gpt-oss-120b` (configurable) |
| Maps | Google Maps Embed |
| Hosting | Vercel (Frontend), Render (Backend) |

## 📁 Project Structure

```text
saffron-table-site/
│
├── index.html
├── css/
├── js/
├── assets/
│   ├── hero/
│   ├── about/
│   ├── menu/
│   └── gallery/
│
├── backend/
│   ├── server.js
│   ├── package.json
│   ├── package-lock.json
│   ├── .env.example
│   └── ...
│
├── tests/
│   ├── test-suite.js
│   ├── test-frontend.js
│   ├── test-api-live.js
│   └── test-ai-live.js
│
├── package-dist.js
├── .gitignore
└── README.md
```

*Note: The actual folder and file names may vary slightly depending on the project version.*

## 🚀 Getting Started

### Prerequisites

Install the following:

- [Node.js](https://nodejs.org/)
- npm (included with Node.js)
- A [Groq API key](https://console.groq.com/keys) for the AI assistant.

### 1. Clone the Repository

```bash
git clone YOUR_GITHUB_REPOSITORY_URL
cd saffron-table-site
```

### 2. Install Backend Dependencies

```bash
cd backend
npm install
```

### 3. Configure Environment Variables

Create a `.env` file inside the `backend` folder.

Copy the contents of `.env.example` and configure your credentials.

```env
GROQ_API_KEY=your_groq_api_key
```

Never upload your `.env` file or expose your API key in frontend JavaScript or public repositories.

### 4. Start the Backend

```bash
npm start
```

If no start script is configured, use the entry-point file specified in `backend/package.json`, for example:

```bash
node server.js
```

The backend typically runs at:

```text
http://localhost:5000
```

### 5. Run the Frontend

Open the project in VS Code and use the Live Server extension to launch `index.html`.

Alternatively, use any static web server to serve the project files.

---

## 📞 Configure Call & WhatsApp Numbers

The restaurant's contact information can be changed through the central restaurant configuration.

Locate the phone and WhatsApp fields in the existing configuration file (for example, `restaurant-data.js`).

### 1. Add a Phone Number

Use the international format with the country code.

Example for an Indian number:

```javascript
phone: "+919876543210"
```

The Call button should use the `tel:` protocol:

```html
<a href="tel:+919876543210">Call Us</a>
```

**How it works:**
- On mobile, tapping the button opens the phone dialer with the number ready to call.
- On desktop, it opens a compatible calling application if one is configured.

### 2. Add a WhatsApp Number

WhatsApp links must use the international number format **without the plus sign, spaces, brackets, or hyphens**.

Example:

```javascript
wa: "919876543210"
```

Use the following WhatsApp URL:

```text
https://wa.me/919876543210
```

You can also include a pre-filled message:

```text
https://wa.me/919876543210?text=Hello%2C%20I%20would%20like%20to%20make%20a%20reservation.
```

### 3. Example Contact Configuration

```javascript
const restaurantConfig = {
    phone: "+919876543210",
    wa: "919876543210"
};
```

Use the existing configuration structure in your project rather than creating a duplicate object if these fields already exist.

### 4. Update All Contact Actions

After changing the numbers, verify that the following use the configured contact details:

- Homepage Call button.
- Homepage WhatsApp button.
- Sticky mobile Call button.
- Sticky mobile WhatsApp button.
- Reservation enquiry WhatsApp action.
- Party enquiry WhatsApp action.

**Important:** Replace the example numbers with a valid restaurant contact number before publishing. These examples are fictional. Do not use personal contact details in a public demo.

---

## 🤖 Saffron AI Assistant

Saffron AI is a conversational assistant that helps visitors understand the restaurant's offerings.

### Capabilities

- Recommends vegetarian and non-vegetarian dishes.
- Answers menu and pricing questions.
- Provides outlet information and timings.
- Suggests dishes based on a customer's budget.
- Handles unknown questions cautiously instead of inventing restaurant information.

### Backend Configuration

The assistant communicates with the Node.js backend, which connects to the Groq API.

The API key is stored securely in the backend environment variables.

To change the AI model, update the backend model configuration and ensure the selected model is supported by your Groq account.

## 🧪 Testing

The project includes automated tests for frontend functionality, backend APIs, and AI integration.

Run the tests from the project root:

```bash
node tests/test-suite.js
node tests/test-frontend.js
node tests/test-api-live.js
```

To test the live AI integration, configure a valid Groq API key first:

```bash
node tests/test-ai-live.js
```

The live AI tests check:

1. Vegetarian recommendations.
2. Menu price accuracy.
3. Outlet timings.
4. Budget-based recommendations.
5. Unknown information and hallucination prevention.

## ☁️ Deployment

### Frontend – Vercel

1. Push the project to GitHub.
2. Sign in to [Vercel](https://vercel.com/).
3. Import the GitHub repository.
4. Configure the project as a static website.
5. Deploy the project.
6. Open the generated URL and test the website.

### Backend – Render

1. Sign in to [Render](https://render.com/).
2. Create a new Web Service.
3. Connect the GitHub repository.
4. Set the backend folder as the Root Directory if required by the project structure.
5. Configure the build and start commands.
6. Add `GROQ_API_KEY` under Environment Variables.
7. Deploy the backend.

### Connect Frontend and Backend

After deploying the backend:

1. Copy the public backend URL from Render.
2. Update the frontend API base URL to point to the deployed backend.
3. Ensure the frontend no longer calls `localhost` in production.
4. Configure CORS to allow requests from the deployed frontend domain.
5. Test the Saffron AI assistant on the public website.

## 📦 Create a Distribution ZIP

To generate a clean project ZIP:

```bash
node package-dist.js
```

The packaging script creates:

```text
saffron-table-site-dist.zip
```

The distribution package excludes unnecessary dependencies and sensitive environment files while retaining the required project files and `.env.example`.

## 🔐 Security Notes

- Never commit `.env` files.
- Never expose Groq API keys in frontend code.
- Store production secrets in the hosting provider's environment settings.
- Validate backend requests.
- Use rate limiting on AI endpoints.
- Avoid publishing personal phone numbers or email addresses in demo projects.

## 📌 Project Information

**Project:** The Saffron Table  
**Type:** Responsive Restaurant Website with AI Assistant  
**Purpose:** Restaurant website demonstration and developer internship assessment  
**Frontend:** HTML, CSS, JavaScript  
**Backend:** Node.js and Express  
**AI:** Groq API

---

*The Saffron Table – A modern dining experience, powered by thoughtful design and AI.*
