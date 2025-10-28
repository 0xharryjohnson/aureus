import { Card } from "@/components/ui/card";
import { Coins, Wallet } from "lucide-react";

interface PortfolioHolding {
  chain: string;
  token_address: string;
  token_symbol: string;
  token_name: string;
  balance: string;
  balance_usd: number;
  price_usd: number;
  logo?: string | null;
  native_token?: boolean;
}

interface PortfolioProps {
  holdings: PortfolioHolding[];
  total_value_usd?: number;
}

export function Portfolio({ holdings, total_value_usd }: PortfolioProps) {
  const formatUSD = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value);
  };

  const totalValue = total_value_usd ?? holdings.reduce((sum, h) => sum + h.balance_usd, 0);

  return (
    <div className="space-y-3">
      {/* Summary Card */}
      <Card className="p-4 bg-secondary border-border">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-full bg-accent/10 text-accent">
              <Coins className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Total Portfolio Value</p>
              <p className="text-2xl font-bold text-foreground">{formatUSD(totalValue)}</p>
            </div>
          </div>
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <Wallet className="h-3.5 w-3.5" />
            <span>{holdings.length} tokens</span>
          </div>
        </div>
      </Card>

      {/* Token Holdings */}
      {holdings.map((holding, idx) => (
        <Card key={`${holding.token_address}-${idx}`} className="p-4 bg-secondary border-border hover:bg-secondary/80 transition-colors">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-3 flex-1">
              {holding.logo && (
                <img
                  src={holding.logo}
                  alt={holding.token_symbol}
                  className="w-10 h-10 rounded-full bg-background"
                  onError={(e) => { e.currentTarget.style.display = 'none'; }}
                />
              )}
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <p className="font-bold text-foreground">{holding.token_symbol}</p>
                  {holding.native_token && (
                    <span className="px-2 py-0.5 text-xs rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20">
                      Native
                    </span>
                  )}
                </div>
                <p className="text-xs text-muted-foreground mb-1">{holding.token_name}</p>
                <p className="text-xs text-muted-foreground font-mono">
                  {holding.token_address === '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee'
                    ? 'Native Token'
                    : `${holding.token_address.slice(0, 8)}...${holding.token_address.slice(-6)}`
                  }
                </p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-lg font-bold text-foreground">
                {formatUSD(holding.balance_usd)}
              </p>
              <p className="text-xs text-muted-foreground">
                {parseFloat(holding.balance).toLocaleString(undefined, { maximumFractionDigits: 4 })} {holding.token_symbol}
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
          <p>No token holdings found for this wallet.</p>
          <p className="text-xs mt-2">Only showing tokens with value {'>'} $1</p>
        </div>
      )}
    </div>
  );
}
