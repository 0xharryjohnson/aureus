import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());

const NANSEN_API_KEY = process.env.NANSEN_API_KEY;
const NANSEN_BASE_URL = 'https://api.nansen.ai/api/v1';

if (!NANSEN_API_KEY) {
  console.error('⚠️  NANSEN_API_KEY not found in environment variables');
  process.exit(1);
}

app.use('/api/nansen', async (req, res) => {
  try {
    // Extract endpoint from URL path (everything after /api/nansen/)
    const endpoint = req.path.substring(1); // Remove leading slash
    const url = `${NANSEN_BASE_URL}/${endpoint}`;
    
    console.log(`→ Proxying to Nansen: ${req.method} ${endpoint}`);

    const response = await fetch(url, {
      method: req.method,
      headers: {
        'apiKey': NANSEN_API_KEY,
        'Content-Type': 'application/json',
      },
      body: req.method !== 'GET' ? JSON.stringify(req.body) : undefined,
    });

    const data = await response.json();

    if (!response.ok) {
      console.error(`✗ Nansen API error: ${response.status}`, data);
      return res.status(response.status).json(data);
    }

    console.log(`✓ Success: ${endpoint}`);
    res.json(data);
  } catch (error) {
    console.error('✗ Proxy error:', error);
    res.status(500).json({ error: 'Proxy server error', details: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`\n🚀 Nansen API Proxy running on http://localhost:${PORT}`);
  console.log(`📡 Proxying requests to ${NANSEN_BASE_URL}\n`);
});
