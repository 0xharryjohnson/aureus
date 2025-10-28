const PROXY_URL = 'http://localhost:3001/api/nansen';

/**
 * Core function to interact with Nansen API through local proxy
 */
async function callNansenAPI(endpoint: string, method: string = 'POST', body?: any) {
  try {
    const response = await fetch(`${PROXY_URL}${endpoint}`, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: method !== 'GET' ? JSON.stringify(body) : undefined,
    });

    if (!response.ok) {
      const error = await response.json();
      console.error('Nansen API call failed:', error);
      throw new Error(error.message || 'API call failed');
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Nansen API call failed:', error);
    throw error;
  }
}

// Get token holders
export async function getTokenHolders(
  tokenAddress: string,
  limit: number = 100
) {
  return callNansenAPI('/tgm/holders', 'POST', {
    chain: 'bnb',
    token_address: tokenAddress.toLowerCase(),
    aggregate_by_entity: false,
    label_type: 'all_holders',
    pagination: {
      page: 1,
      per_page: limit,
    },
    filters: {
      value_usd: { min: 50 }
    },
    order_by: [
      { field: 'value_usd', direction: 'DESC' },
    ],
  });
}

// Get PnL leaderboard for a token
export async function getTokenPnLLeaderboard(
  tokenAddress: string,
  options?: {
    dateFrom?: string;
    dateTo?: string;
    limit?: number;
    page?: number;
    minHoldingUsd?: number;
    minRealisedPnl?: number;
    orderBy?: Array<{ field: string; direction: 'ASC' | 'DESC' }>;
  }
) {
  const now = new Date();
  const defaultFrom = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

  const {
    dateFrom = defaultFrom.toISOString().split('T')[0],
    dateTo = now.toISOString().split('T')[0],
    limit = 20,
    page = 1,
    minHoldingUsd = 0,
    minRealisedPnl = 100,
    orderBy = [{ field: 'pnl_usd_total', direction: 'DESC' as const }],
  } = options || {};

  return callNansenAPI('/tgm/pnl-leaderboard', 'POST', {
    chain: 'bnb',
    token_address: tokenAddress.toLowerCase(),
    date: {
      from: dateFrom,
      to: dateTo,
    },
    pagination: {
      page,
      per_page: limit,
    },
    filters: {
      holding_usd: { min: minHoldingUsd },
      pnl_usd_realised: { min: minRealisedPnl },
    },
    order_by: orderBy,
  });
}

// Get wallet PnL summary
export async function getWalletPnLSummary(
  address: string,
  options?: { tokenAddress?: string; dateFrom?: string; dateTo?: string; chain?: string }
) {
  const now = new Date();
  const ninetyDaysAgo = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
  
  const {
    tokenAddress,
    dateFrom = ninetyDaysAgo.toISOString().split('T')[0],
    dateTo = now.toISOString().split('T')[0],
    chain = 'bnb',
  } = options || {};
  
  const body: any = {
    address,
    chain,
    date: {
      from: dateFrom,
      to: dateTo,
    },
  };
  
  if (tokenAddress) {
    body.token_address = tokenAddress.toLowerCase();
  }
  
  const apiRes = await callNansenAPI('/profiler/address/pnl-summary', 'POST', body);

  const summary = {
    address,
    pnl_usd_realised: apiRes?.realized_pnl_usd ?? 0,
    pnl_usd_unrealised: 0,
    pnl_usd_total: (apiRes?.realized_pnl_usd ?? 0),
    roi_percent: ((apiRes?.realized_pnl_percent ?? 0) * 100),
    winrate_percent: ((apiRes?.win_rate ?? 0) * 100),
    num_trades: apiRes?.traded_times ?? 0,
    top_tokens: (apiRes?.top5_tokens ?? []).map((t: any) => ({
      token_address: t.token_address,
      token_name: t.token_symbol ?? t.token_address,
      token_symbol: t.token_symbol ?? '-',
      pnl_usd: t.realized_pnl ?? 0,
      roi_percent: (t.realized_roi ?? 0) * 100,
    })),
  };

  return { data: summary };
}

// Get wallet portfolio using Moralis API (Nansen doesn't support wallet balances reliably)
export async function getWalletPortfolio(address: string) {
  console.log(`[Portfolio] Fetching wallet balances from Moralis for: ${address}`);

  try {
    const response = await fetch(
      `http://localhost:3001/api/moralis/wallets/${address}/tokens?chain=bsc&exclude_spam=true&limit=100&min_pair_side_liquidity_usd=500`
    );

    if (!response.ok) {
      throw new Error(`Moralis API error: ${response.status}`);
    }

    const data = await response.json();
    console.log(`[Portfolio] Moralis response: ${data.result?.length ?? 0} tokens`);

    // Filter tokens with USD value > $1 and map to our format
    const holdings = (data.result ?? [])
      .filter((token: any) => (token.usd_value ?? 0) > 1)
      .map((token: any) => ({
        chain: 'bnb',
        token_address: token.token_address,
        token_symbol: token.symbol,
        token_name: token.name,
        balance: token.balance_formatted,
        balance_usd: token.usd_value,
        price_usd: token.usd_price,
        logo: token.logo || token.thumbnail,
        native_token: token.native_token ?? false,
      }));

    console.log(`[Portfolio] Filtered to ${holdings.length} tokens with value > $1`);

    return {
      data: {
        holdings,
        total_value_usd: holdings.reduce((sum: number, h: any) => sum + h.balance_usd, 0),
      }
    };
  } catch (error) {
    console.error('[Portfolio] Error fetching from Moralis:', error);
    return {
      data: {
        holdings: [],
        total_value_usd: 0,
      }
    };
  }
}

// Get multiple wallets' PnL summaries (processes in batches of 10)
export async function getBatchWalletPnL(addresses: string[]) {
  const now = new Date();
  const ninetyDaysAgo = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
  
  const batchSize = 10;
  const batches = [];
  
  for (let i = 0; i < addresses.length; i += batchSize) {
    const batch = addresses.slice(i, i + batchSize);
    batches.push(
      Promise.all(
        batch.map(address => 
          callNansenAPI('/profiler/address/pnl-summary', 'POST', {
            address,
            chain: 'bnb',
            date: {
              from: ninetyDaysAgo.toISOString().split('T')[0],
              to: now.toISOString().split('T')[0],
            },
          }).catch(err => {
            console.error(`Failed to fetch PnL for ${address}:`, err);
            return null;
          })
        )
      )
    );
  }
  
  const results = await Promise.all(batches);
  const allData = results.flat().filter(r => r !== null).map(r => r.data).flat();
  
  return { data: allData };
}

// Get token metadata
export async function getTokenInfo(tokenAddress: string) {
  const now = new Date();
  const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
  
  return callNansenAPI('/token-screener', 'POST', {
    chains: ['bnb'],
    date: {
      from: oneDayAgo.toISOString(),
      to: now.toISOString(),
    },
    pagination: {
      page: 1,
      per_page: 1,
    },
    filters: {
      token_address: tokenAddress.toLowerCase(),
    },
  });
}
