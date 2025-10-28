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
const MORALIS_API_KEY = process.env.MORALIS_API_KEY;
const NANSEN_BASE_URL = 'https://api.nansen.ai/api/v1';
const MORALIS_BASE_URL = 'https://deep-index.moralis.io/api/v2.2';

if (!NANSEN_API_KEY) {
  console.error('⚠️  NANSEN_API_KEY not found in environment variables');
  process.exit(1);
}

if (!MORALIS_API_KEY) {
  console.error('❌ MORALIS_API_KEY not found in environment variables');
  process.exit(1);
}

app.use('/api/nansen', async (req, res) => {
  try {
    // Extract endpoint from URL path (everything after /api/nansen/)
    const endpoint = req.path.substring(1); // Remove leading slash
    const url = `${NANSEN_BASE_URL}/${endpoint}`;

    console.log(`\n→ Proxying to Nansen: ${req.method} ${endpoint}`);
    console.log(`  Request body:`, JSON.stringify(req.body, null, 2));

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
    console.log(`  Response structure:`, JSON.stringify({
      keys: Object.keys(data),
      dataType: Array.isArray(data) ? 'array' : typeof data,
      ...(data.balances ? { balancesCount: data.balances?.length } : {}),
      ...(data.protocols ? { protocolsCount: data.protocols?.length } : {}),
      ...(data.summary ? { hasSummary: true } : {}),
      ...(data.data ? { hasDataField: true, dataKeys: Object.keys(data.data || {}) } : {}),
    }, null, 2));

    // Log first item if it's an array or has items
    if (Array.isArray(data) && data.length > 0) {
      console.log(`  First item sample:`, JSON.stringify(data[0], null, 2));
    } else if (data.balances && data.balances.length > 0) {
      console.log(`  First balance sample:`, JSON.stringify(data.balances[0], null, 2));
    } else if (data.protocols && data.protocols.length > 0) {
      console.log(`  First protocol sample:`, JSON.stringify(data.protocols[0], null, 2));
    }

    res.json(data);
  } catch (error) {
    console.error('✗ Proxy error:', error);
    res.status(500).json({ error: 'Proxy server error', details: error.message });
  }
});

// Moralis API proxy endpoint
app.use('/api/moralis', async (req, res) => {
  try {
    const endpoint = req.path.substring(1);
    const url = `${MORALIS_BASE_URL}/${endpoint}${req.url.includes('?') ? req.url.substring(req.url.indexOf('?')) : ''}`;

    console.log(`\n→ Proxying to Moralis: ${req.method} ${endpoint}`);

    const response = await fetch(url, {
      method: req.method,
      headers: {
        'accept': 'application/json',
        'X-API-Key': MORALIS_API_KEY,
      },
    });

    const data = await response.json();

    if (!response.ok) {
      console.error(`✗ Moralis API error: ${response.status}`, data);
      return res.status(response.status).json(data);
    }

    console.log(`✓ Success: ${endpoint} - ${data.result?.length ?? 0} tokens`);
    res.json(data);
  } catch (error) {
    console.error('✗ Moralis proxy error:', error);
    res.status(500).json({ error: 'Proxy server error', details: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`\n🚀 API Proxy running on http://localhost:${PORT}`);
  console.log(`📡 Nansen: ${NANSEN_BASE_URL}`);
  console.log(`📡 Moralis: ${MORALIS_BASE_URL}\n`);
});
