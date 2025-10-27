import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Network } from "lucide-react";

interface TokenData {
  address: string;
  symbol: string;
  name: string;
  wallets: Array<{
    address: string;
    pnl_usd_total: number;
  }>;
}

interface CrossTokenVisualizationProps {
  tokensData: TokenData[];
}

interface WalletNode {
  wallet: string;
  tokens: Set<string>;
  totalPnl: number;
}

export function CrossTokenVisualization({ tokensData }: CrossTokenVisualizationProps) {
  // Create wallet nodes that appear in multiple tokens
  const walletMap = new Map<string, WalletNode>();

  tokensData.forEach((tokenData) => {
    const top10 = tokenData.wallets.slice(0, 10);
    top10.forEach((wallet) => {
      if (!walletMap.has(wallet.address)) {
        walletMap.set(wallet.address, {
          wallet: wallet.address,
          tokens: new Set(),
          totalPnl: 0,
        });
      }
      const node = walletMap.get(wallet.address)!;
      node.tokens.add(tokenData.symbol);
      node.totalPnl += wallet.pnl_usd_total;
    });
  });

  // Filter to wallets in 2+ tokens
  const crossWallets = Array.from(walletMap.values())
    .filter(w => w.tokens.size >= 2)
    .sort((a, b) => b.tokens.size - a.tokens.size || b.totalPnl - a.totalPnl)
    .slice(0, 15);

  const formatUSD = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  if (crossWallets.length === 0) {
    return (
      <Card className="p-6 bg-card border-border">
        <div className="flex items-center gap-2 mb-4">
          <Network className="h-5 w-5 text-accent" />
          <h3 className="text-lg font-bold text-accent">Cross-Token Network</h3>
        </div>
        <p className="text-center text-muted-foreground py-6">
          No cross-token patterns detected. Analyze multiple tokens to see wallet overlap.
        </p>
      </Card>
    );
  }

  return (
    <Card className="p-6 bg-card border-border">
      <div className="flex items-center gap-2 mb-4">
        <Network className="h-5 w-5 text-accent" />
        <h3 className="text-lg font-bold text-accent">Cross-Token Network Visualization</h3>
      </div>
      <p className="text-sm text-muted-foreground mb-6">
        Wallets profitable across multiple tokens indicate smart money and strong trading patterns
      </p>

      {/* Network visualization */}
      <div className="space-y-4">
        {crossWallets.map((node, idx) => {
          const tokenCount = node.tokens.size;
          const intensity = Math.min((tokenCount / tokensData.length) * 100, 100);
          
          return (
            <div key={node.wallet} className="relative">
              <Card className="p-4 bg-secondary border-border hover:border-accent/50 transition-all">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <div 
                        className="w-3 h-3 rounded-full"
                        style={{
                          backgroundColor: `hsl(var(--accent))`,
                          opacity: 0.3 + (intensity / 100) * 0.7,
                          boxShadow: `0 0 ${intensity / 10}px hsl(var(--accent))`,
                        }}
                      />
                      <code className="text-xs font-mono text-foreground">
                        {node.wallet.slice(0, 8)}...{node.wallet.slice(-6)}
                      </code>
                      <Badge 
                        className="text-xs"
                        style={{
                          backgroundColor: `hsl(var(--accent) / ${0.2 + (intensity / 100) * 0.3})`,
                          borderColor: `hsl(var(--accent) / ${0.3 + (intensity / 100) * 0.4})`,
                        }}
                      >
                        {tokenCount} tokens
                      </Badge>
                    </div>

                    {/* Connection lines to tokens */}
                    <div className="ml-5 mt-2 space-y-1">
                      {Array.from(node.tokens).map((token) => (
                        <div key={token} className="flex items-center gap-2">
                          <div className="w-8 h-px bg-accent/30" />
                          <Badge variant="outline" className="text-xs">
                            {token}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="text-right">
                    <p className="text-sm text-muted-foreground mb-1">Total P&L</p>
                    <p className="text-lg font-bold text-success">
                      {formatUSD(node.totalPnl)}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {((tokenCount / tokensData.length) * 100).toFixed(0)}% coverage
                    </p>
                  </div>
                </div>
              </Card>

              {/* Connecting line to next node */}
              {idx < crossWallets.length - 1 && (
                <div className="flex justify-center py-1">
                  <div className="w-px h-4 bg-border" />
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Summary stats */}
      <div className="mt-6 pt-6 border-t border-border grid grid-cols-3 gap-4">
        <div className="text-center">
          <p className="text-2xl font-bold text-accent">{crossWallets.length}</p>
          <p className="text-xs text-muted-foreground">Cross-Token Wallets</p>
        </div>
        <div className="text-center">
          <p className="text-2xl font-bold text-accent">
            {Math.max(...crossWallets.map(w => w.tokens.size))}
          </p>
          <p className="text-xs text-muted-foreground">Max Token Overlap</p>
        </div>
        <div className="text-center">
          <p className="text-2xl font-bold text-success">
            {formatUSD(crossWallets.reduce((sum, w) => sum + w.totalPnl, 0))}
          </p>
          <p className="text-xs text-muted-foreground">Combined P&L</p>
        </div>
      </div>
    </Card>
  );
}
