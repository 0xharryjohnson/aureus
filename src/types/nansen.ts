export interface NansenPnLLeaderboardEntry {
  address: string;
  pnl_usd_realised: number;
  pnl_usd_unrealised: number;
  pnl_usd_total: number;
  roi_percent: number;
  winrate_percent: number;
  num_trades: number;
  volume_usd: number;
  holding_usd: number;
  avg_entry_price: number;
  avg_exit_price: number;
}

export interface NansenAddressPnLSummary {
  address: string;
  pnl_usd_realised: number;
  pnl_usd_unrealised: number;
  pnl_usd_total: number;
  roi_percent: number;
  winrate_percent: number;
  num_trades: number;
  top_tokens: Array<{
    token_address: string;
    token_name: string;
    token_symbol: string;
    pnl_usd: number;
    roi_percent: number;
  }>;
}

export interface NansenPortfolioHolding {
  chain: string;
  token_address: string;
  token_symbol: string;
  token_name: string;
  balance: string;
  balance_usd: number;
  price_usd: number;
}

export interface NansenPnLLeaderboardRequest {
  chain: string;
  token_address: string;
  date: {
    from?: string;
    to?: string;
  };
  pagination?: {
    limit?: number;
    offset?: number;
  };
  filters?: {
    pnl_usd_realised?: { min?: number; max?: number };
    pnl_usd_total?: { min?: number; max?: number };
    holding_usd?: { min?: number; max?: number };
  };
}

export interface NansenAddressPnLRequest {
  address: string | string[];
  date?: {
    from?: string;
    to?: string;
  };
}
