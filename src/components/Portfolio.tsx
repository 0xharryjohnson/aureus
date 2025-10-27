import { Card } from "@/components/ui/card";
import { Coins, Wallet, ArrowDownCircle, ArrowUpCircle, Gift } from "lucide-react";

interface PortfolioHolding {
  chain: string;
  token_address: string;
  token_symbol: string;
  token_name: string;
  balance: string;
  balance_usd: number;
  price_usd: number;
}

interface PortfolioSummary {
  total_value_usd: number;
  total_assets_usd: number;
  total_debts_usd: number;
  total_rewards_usd: number;
  token_count: number;
  protocol_count: number;
}

interface PortfolioProps {
  holdings: PortfolioHolding[];
  summary?: PortfolioSummary | null;
}

export function Portfolio({ holdings, summary }: PortfolioProps) {
  const formatUSD = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value);
  };

  const totalValue = summary?.total_value_usd ?? holdings.reduce((sum, h) => sum + h.balance_usd, 0);

  return (
    <div className="space-y-3">
      <Card className="p-4 bg-secondary border-border">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-full bg-accent/10 text-accent"><Coins className="h-5 w-5" /></div>
            <div>
              <p className="text-xs text-muted-foreground">Total Value</p>
              <p className="text-lg font-bold text-foreground">{formatUSD(totalValue)}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-full bg-success/10 text-success"><ArrowUpCircle className="h-5 w-5" /></div>
            <div>
              <p className="text-xs text-muted-foreground">Assets</p>
              <p className="text-lg font-semibold">{formatUSD(summary?.total_assets_usd ?? 0)}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-full bg-destructive/10 text-destructive"><ArrowDownCircle className="h-5 w-5" /></div>
            <div>
              <p className="text-xs text-muted-foreground">Debts</p>
              <p className="text-lg font-semibold">{formatUSD(summary?.total_debts_usd ?? 0)}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-full bg-primary/10 text-primary"><Gift className="h-5 w-5" /></div>
            <div>
              <p className="text-xs text-muted-foreground">Rewards</p>
              <p className="text-lg font-semibold">{formatUSD(summary?.total_rewards_usd ?? 0)}</p>
            </div>
          </div>
        </div>
        <div className="mt-3 text-xs text-muted-foreground flex items-center gap-4">
          <div className="flex items-center gap-1"><Wallet className="h-3.5 w-3.5" /> {summary?.token_count ?? holdings.length} tokens</div>
          <div className="flex items-center gap-1"><Coins className="h-3.5 w-3.5" /> {summary?.protocol_count ?? 0} protocols</div>
        </div>
      </Card>

      {holdings.map((holding, idx) => (
        <Card key={`${holding.token_address}-${idx}`} className="p-4 bg-secondary border-border">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <p className="font-bold text-foreground">{holding.token_symbol}</p>
              <p className="text-xs text-muted-foreground mb-1">{holding.token_name}</p>
              <p className="text-xs text-muted-foreground font-mono">
                {holding.token_address.slice(0, 8)}...{holding.token_address.slice(-6)}
              </p>
            </div>
            <div className="text-right">
              <p className="text-lg font-bold text-foreground">
                {formatUSD(holding.balance_usd)}
              </p>
              <p className="text-xs text-muted-foreground">
                {parseFloat(holding.balance).toLocaleString()} {holding.token_symbol}
              </p>
              <p className="text-xs text-muted-foreground">
                @ {formatUSD(holding.price_usd)}
              </p>
            </div>
          </div>
        </Card>
      ))}

      {holdings.length === 0 && (
        <div className="text-center py-12 text-muted-foreground">
          <p>No active DeFi protocol positions returned for this wallet.</p>
          <p className="text-xs mt-2">This view shows positions in lending, LPs, and other DeFi protocols. Spot token balances are not included.</p>
        </div>
      )}
    </div>
  );
}
