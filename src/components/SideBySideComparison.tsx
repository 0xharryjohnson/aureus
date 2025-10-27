import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Copy, Check } from "lucide-react";
import { useState } from "react";
import { toast } from "@/hooks/use-toast";

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

interface SideBySideComparisonProps {
  tokensData: TokenData[];
}

export function SideBySideComparison({ tokensData }: SideBySideComparisonProps) {
  const [copiedAddress, setCopiedAddress] = useState<string | null>(null);

  // Get all unique wallets across all tokens
  const allWalletAddresses = new Set<string>();
  tokensData.forEach(token => {
    token.wallets.forEach(wallet => allWalletAddresses.add(wallet.address));
  });

  // Find which wallets appear in multiple tokens
  const walletAppearances = new Map<string, Set<string>>();
  tokensData.forEach(token => {
    token.wallets.forEach(wallet => {
      if (!walletAppearances.has(wallet.address)) {
        walletAppearances.set(wallet.address, new Set());
      }
      walletAppearances.get(wallet.address)!.add(token.symbol);
    });
  });

  const commonWallets = Array.from(walletAppearances.entries())
    .filter(([_, tokens]) => tokens.size > 1)
    .map(([address]) => address);

  const formatUSD = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const copyAddress = async (address: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await navigator.clipboard.writeText(address);
      setCopiedAddress(address);
      toast({
        title: "Copied!",
        description: "Wallet address copied to clipboard",
      });
      setTimeout(() => setCopiedAddress(null), 2000);
    } catch (err) {
      toast({
        title: "Failed to copy",
        description: "Could not copy address to clipboard",
        variant: "destructive",
      });
    }
  };

  if (tokensData.length === 0) {
    return (
      <Card className="p-6 bg-card border-border">
        <p className="text-center text-muted-foreground">No tokens analyzed yet</p>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {commonWallets.length > 0 && (
        <Card className="p-4 bg-accent/10 border-accent/30">
          <div className="flex items-center gap-2">
            <Badge className="bg-accent text-accent-foreground">
              🎯 {commonWallets.length} Smart Money Wallets
            </Badge>
            <p className="text-sm text-muted-foreground">
              Found in multiple tokens - strong cross-token performance
            </p>
          </div>
        </Card>
      )}

      <div className="grid gap-4" style={{ gridTemplateColumns: `repeat(${tokensData.length}, 1fr)` }}>
        {tokensData.map((token) => (
          <Card key={token.address} className="p-4 bg-card border-border">
            <div className="mb-4 pb-3 border-b border-border">
              <h3 className="font-bold text-accent text-lg">{token.symbol}</h3>
              <p className="text-xs text-muted-foreground truncate" title={token.name}>
                {token.name}
              </p>
            </div>

            <div className="space-y-2">
              {token.wallets.slice(0, 10).map((wallet, idx) => {
                const isCommon = commonWallets.includes(wallet.address);
                const tokenCount = walletAppearances.get(wallet.address)?.size || 1;
                
                return (
                  <div
                    key={wallet.address}
                    className={`p-2 rounded-lg transition-all ${
                      isCommon 
                        ? 'bg-accent/20 border border-accent/40 shadow-sm' 
                        : 'bg-secondary border border-transparent'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1 mb-1">
                          <Badge variant="outline" className="text-xs px-1">
                            #{idx + 1}
                          </Badge>
                          {isCommon && (
                            <Badge className="text-xs px-1 bg-accent/30 text-accent border-accent/50">
                              {tokenCount}x
                            </Badge>
                          )}
                        </div>
                        <code className="text-[10px] font-mono text-foreground block truncate">
                          {wallet.address.slice(0, 6)}...{wallet.address.slice(-4)}
                        </code>
                        <div className="mt-1 flex items-center gap-1">
                          <button
                            onClick={(e) => copyAddress(wallet.address, e)}
                            className="p-0.5 hover:bg-accent/20 rounded transition-colors"
                          >
                            {copiedAddress === wallet.address ? (
                              <Check className="h-3 w-3 text-success" />
                            ) : (
                              <Copy className="h-3 w-3 text-muted-foreground" />
                            )}
                          </button>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-xs font-bold text-success">
                          {formatUSD(wallet.pnl_usd_total)}
                        </p>
                        <p className="text-[10px] text-muted-foreground">
                          {wallet.roi_percent.toFixed(1)}%
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>
        ))}
      </div>

      {commonWallets.length > 0 && (
        <Card className="p-4 bg-card border-border">
          <h4 className="text-sm font-bold mb-3 text-accent">Cross-Token Summary</h4>
          <div className="space-y-2">
            {commonWallets.slice(0, 10).map((address) => {
              const tokens = walletAppearances.get(address)!;
              return (
                <div key={address} className="flex items-center justify-between p-2 bg-secondary rounded-lg">
                  <div className="flex items-center gap-2">
                    <code className="text-xs font-mono">{address.slice(0, 8)}...{address.slice(-6)}</code>
                    <button
                      onClick={(e) => copyAddress(address, e)}
                      className="p-1 hover:bg-accent/20 rounded transition-colors"
                    >
                      {copiedAddress === address ? (
                        <Check className="h-3 w-3 text-success" />
                      ) : (
                        <Copy className="h-3 w-3 text-muted-foreground" />
                      )}
                    </button>
                  </div>
                  <div className="flex gap-1">
                    {Array.from(tokens).map(symbol => (
                      <Badge key={symbol} variant="outline" className="text-xs">
                        {symbol}
                      </Badge>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      )}
    </div>
  );
}
