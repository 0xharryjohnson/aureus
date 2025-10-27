import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, Users } from "lucide-react";
import { CrossTokenVisualization } from "./CrossTokenVisualization";

interface Wallet {
  address: string;
  pnl_usd_total: number;
  roi_percent: number;
}

interface TokenData {
  address: string;
  symbol: string;
  name: string;
  wallets: Wallet[];
}

interface CrossTokenAnalysisProps {
  tokensData: TokenData[];
}


interface CommonWallet {
  address: string;
  tokens: string[];
  totalPnl: number;
  avgROI: number;
}

export function CrossTokenAnalysis({ tokensData }: CrossTokenAnalysisProps) {
  // Find wallets that appear in multiple tokens' top 10
  const walletMap = new Map<string, { tokens: Set<string>; pnls: number[]; rois: number[] }>();

  tokensData.forEach((tokenData) => {
    const top10 = tokenData.wallets.slice(0, 10);
    top10.forEach((wallet) => {
      if (!walletMap.has(wallet.address)) {
        walletMap.set(wallet.address, { tokens: new Set(), pnls: [], rois: [] });
      }
      const data = walletMap.get(wallet.address)!;
      data.tokens.add(tokenData.symbol);
      data.pnls.push(wallet.pnl_usd_total);
      data.rois.push(wallet.roi_percent);
    });
  });

  // Filter to wallets in 2+ tokens and calculate stats
  const commonWallets: CommonWallet[] = Array.from(walletMap.entries())
    .filter(([_, data]) => data.tokens.size >= 2)
    .map(([address, data]) => ({
      address,
      tokens: Array.from(data.tokens),
      totalPnl: data.pnls.reduce((a, b) => a + b, 0),
      avgROI: data.rois.reduce((a, b) => a + b, 0) / data.rois.length,
    }))
    .sort((a, b) => b.totalPnl - a.totalPnl);

  // Find most profitable common tokens
  const tokenProfits = new Map<string, number>();
  tokensData.forEach((tokenData) => {
    const totalPnl = tokenData.wallets.slice(0, 10).reduce((sum, w) => sum + w.pnl_usd_total, 0);
    tokenProfits.set(tokenData.symbol, totalPnl);
  });

  const topTokens = Array.from(tokenProfits.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  const formatUSD = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  return (
    <div className="space-y-6">
      <CrossTokenVisualization tokensData={tokensData} />

      <Card className="p-6 bg-card border-border">
        <div className="flex items-center gap-2 mb-4">
          <Users className="h-5 w-5 text-accent" />
          <h3 className="text-lg font-bold text-accent">Smart Money Detection</h3>
        </div>
        <p className="text-sm text-muted-foreground mb-4">
          Wallets appearing in top 10 traders across multiple analyzed tokens
        </p>
        
        <div className="space-y-3">
          {commonWallets.slice(0, 10).map((wallet) => (
            <Card key={wallet.address} className="p-4 bg-secondary border-border">
              <div className="flex items-start justify-between mb-2">
                <code className="text-sm font-mono text-foreground">
                  {wallet.address.slice(0, 8)}...{wallet.address.slice(-6)}
                </code>
                <Badge className="bg-accent/20 text-accent border-accent/30">
                  {wallet.tokens.length} tokens
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex flex-wrap gap-1">
                  {wallet.tokens.map((token) => (
                    <Badge key={token} variant="outline" className="text-xs">
                      {token}
                    </Badge>
                  ))}
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-success">{formatUSD(wallet.totalPnl)}</p>
                  <p className="text-xs text-muted-foreground">{wallet.avgROI.toFixed(1)}% avg ROI</p>
                </div>
              </div>
            </Card>
          ))}
          {commonWallets.length === 0 && (
            <p className="text-center text-muted-foreground py-6">
              No common wallets found. Analyze multiple tokens to see patterns.
            </p>
          )}
        </div>
      </Card>

      <Card className="p-6 bg-card border-border">
        <div className="flex items-center gap-2 mb-4">
          <TrendingUp className="h-5 w-5 text-accent" />
          <h3 className="text-lg font-bold text-accent">Top Performing Tokens</h3>
        </div>
        <p className="text-sm text-muted-foreground mb-4">
          Ranked by total P&L of top 10 traders
        </p>

        <div className="space-y-2">
          {topTokens.map(([symbol, pnl], idx) => (
            <div key={symbol} className="flex items-center justify-between p-3 bg-secondary rounded-lg">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-accent/20 flex items-center justify-center">
                  <span className="text-sm font-bold text-accent">#{idx + 1}</span>
                </div>
                <p className="font-bold text-foreground">{symbol}</p>
              </div>
              <p className="text-lg font-bold text-success">{formatUSD(pnl)}</p>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
