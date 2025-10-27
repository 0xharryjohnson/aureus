import { Card } from "@/components/ui/card";
import { TrendingUp, TrendingDown } from "lucide-react";

interface Trade {
  token_address: string;
  token_name: string;
  token_symbol: string;
  pnl_usd: number;
  roi_percent: number;
}

interface TradeHistoryProps {
  trades: Trade[];
}

export function TradeHistory({ trades }: TradeHistoryProps) {
  const formatUSD = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  return (
    <div className="space-y-3">
      {trades.map((trade, idx) => (
        <Card key={`${trade.token_address}-${idx}`} className="p-4 bg-secondary border-border">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <p className="font-bold text-foreground">{trade.token_symbol}</p>
                {trade.pnl_usd >= 0 ? (
                  <TrendingUp className="h-4 w-4 text-success" />
                ) : (
                  <TrendingDown className="h-4 w-4 text-destructive" />
                )}
              </div>
              <p className="text-xs text-muted-foreground mb-1">{trade.token_name}</p>
              <p className="text-xs text-muted-foreground font-mono">
                {trade.token_address.slice(0, 8)}...{trade.token_address.slice(-6)}
              </p>
            </div>
            <div className="text-right">
              <p className={`text-lg font-bold ${trade.pnl_usd >= 0 ? 'text-success' : 'text-destructive'}`}>
                {formatUSD(trade.pnl_usd)}
              </p>
              <p className={`text-sm ${(trade.roi_percent || 0) >= 0 ? 'text-success' : 'text-destructive'}`}>
                {trade.roi_percent != null ? `${trade.roi_percent.toFixed(2)}%` : '0%'} ROI
              </p>
            </div>
          </div>
        </Card>
      ))}
      {trades.length === 0 && (
        <div className="text-center py-12 text-muted-foreground">
          <p>No trade history available</p>
        </div>
      )}
    </div>
  );
}
