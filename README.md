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

- **Node.js 18+** - [Download here](https://nodejs.org/)
- **Nansen API Key** - For trader analytics and PnL data
  - Sign up at [https://pro.nansen.ai/](https://pro.nansen.ai/)
  - Navigate to API settings to get your key
- **Moralis API Key** - For wallet portfolio balances
  - Sign up at [https://moralis.io/](https://moralis.io/)
  - Create a new project and copy your API key
  - Free tier is sufficient for development

### Installation

```bash
# 1. Clone the repo
git clone https://github.com/yourusername/aureusanalytics.git
cd aureusanalytics

# 2. Install dependencies
npm install

# 3. Set up environment variables
cp .env.example .env
```

Now edit the `.env` file and add your API keys:

```env
# Get your Nansen API key from https://pro.nansen.ai/
NANSEN_API_KEY=your_nansen_key_here

# Get your Moralis API key from https://moralis.io/
MORALIS_API_KEY=your_moralis_key_here
```

**Important:** Don't use quotes around the API keys!

```bash
# 4. Start the app (runs both frontend and backend)
npm run dev
```

The app will start:
- **Backend (Express)** on [http://localhost:3001](http://localhost:3001)
- **Frontend (React)** on [http://localhost:8080](http://localhost:8080)

Open [http://localhost:8080](http://localhost:8080) in your browser to use the app.

---

## How It Works

### Architecture

```
Frontend (React) → Backend Proxy (Express) → Nansen API / Moralis API
  :8080                 :3001
```

The Express server acts as a proxy to:
- Keep your API keys secure (never exposed to the browser)
- Handle CORS issues
- Forward requests to Nansen API (trader analytics, PnL data)
- Forward requests to Moralis API (wallet portfolio balances)

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
- **Data:** Nansen API (trader analytics), Moralis API (wallet balances)
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

1. Set environment variables:
   - `NANSEN_API_KEY=your_key`
   - `MORALIS_API_KEY=your_key`
2. Start command: `node server.js`
3. Update frontend API URL in `src/lib/nansen.ts` to point to your deployed backend

---

## Troubleshooting

**"No API key found in request"**
- Make sure `.env` file exists with both API keys:
  ```
  NANSEN_API_KEY=your_key
  MORALIS_API_KEY=your_key
  ```
- **Don't use quotes** around the API keys
- Restart the backend server: `npm run dev:backend`

**"MORALIS_API_KEY not found"**
- Make sure you've added the Moralis API key to `.env`
- Get your free API key at [https://moralis.io/](https://moralis.io/)
- Restart the backend server

**Port already in use (3001 or 8080)**
- Kill the process: `lsof -ti:3001 | xargs kill` (Mac/Linux)
- Or change ports in `server.js` (line 9) and `vite.config.ts`

**CORS errors**
- Make sure backend server is running on port 3001
- Check `server.js` CORS configuration
- Verify frontend is calling `http://localhost:3001/api/...`

**Portfolio tab shows no data**
- This uses Moralis API - make sure `MORALIS_API_KEY` is set
- Check browser console for API errors
- Verify the wallet has tokens with value > $1

---

## License

MIT License - feel free to fork and modify!

---

## Credits

Built with:
- [Nansen API](https://nansen.ai) - Blockchain analytics and trader intelligence
- [Moralis API](https://moralis.io) - Wallet balance and token data

