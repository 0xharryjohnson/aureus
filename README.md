# Aureus Analytics

<div align="center">
  <img src="public/aureus.png" alt="Aureus Analytics" width="200"/>
  
  **BEP-20 Token Intelligence Platform**
  
  Track profitable wallets and discover smart money patterns on Binance Smart Chain.
  
  [![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
</div>

---

## Features

- **Multi-token analysis** - Analyze up to 5 BEP-20 tokens simultaneously
- **Top trader identification** - Find the most profitable wallets for any token
- **Smart money detection** - Track wallets that consistently profit across multiple tokens
- **Wallet analytics** - P&L breakdowns, portfolio holdings, trade history, performance charts
- **Cross-token patterns** - Discover common wallets and trading correlations
- **Export data** - Save results as CSV or JSON

---

## Quick Start

### Prerequisites

- Node.js 18+
- [Nansen API Key](https://pro.nansen.ai/)

### Installation

```bash
# Clone the repo
git clone https://github.com/yourusername/aureusanalytics.git
cd aureusanalytics

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env and add your Nansen API key:
# NANSEN_API_KEY=your_key_here

# Start the app (runs both frontend and backend)
npm run dev
```

Open [http://localhost:8080](http://localhost:8080) in your browser.

---

## How It Works

### Architecture

```
Frontend (React) → Backend Proxy (Express) → Nansen API
  :8080                 :3001
```

The Express server acts as a proxy to:
- Keep your API key secure (never exposed to the browser)
- Handle CORS issues
- Forward requests to Nansen API

### Project Structure

```
aureusanalytics/
├── src/
│   ├── components/     # React components
│   ├── lib/           # API client & utilities
│   ├── pages/         # Page components
│   └── types/         # TypeScript types
├── server.js          # Express proxy server
├── .env.example       # Environment template
└── package.json
```

---

## Tech Stack

- **Frontend:** React 18, TypeScript, Vite, Tailwind CSS, shadcn/ui
- **Backend:** Node.js, Express
- **Data:** Nansen API
- **Charts:** Recharts

---

## Usage

1. Enter a BEP-20 token address (e.g., `0x0A43fC31a73013089DF59194872Ecae4cAe14444` for 4)
2. Click "Analyze" to see top profitable traders
3. Click on any wallet to view detailed analytics
4. Add multiple tokens to find common profitable wallets
5. Export data for further analysis

---

## Development

```bash
# Run both servers
npm run dev

# Run frontend only
npm run dev:frontend

# Run backend only
npm run dev:backend

# Build for production
npm run build

# Lint code
npm run lint
```

---

## Deployment

### Frontend (Vercel/Netlify)

1. Build: `npm run build`
2. Deploy the `dist/` folder

### Backend (Railway/Render recommended)

1. Set environment variable: `NANSEN_API_KEY`
2. Start command: `node server.js`
3. Update frontend API URL in `src/lib/nansen.ts`

---

## Troubleshooting

**"No API key found in request"**
- Make sure `.env` file exists with `NANSEN_API_KEY=your_key`
- No quotes around the API key
- Restart the backend server

**Port already in use**
- Change port in `server.js` (line 4)
- Or kill the process using the port

**CORS errors**
- Make sure backend server is running on port 3001
- Check `server.js` CORS configuration

---

## License

MIT License - feel free to fork and modify!

---

## Credits

Built with [Nansen API](https://nansen.ai) for blockchain analytics.

