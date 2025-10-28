import { Card } from "@/components/ui/card";
import { PnLLeaderboardEntry } from "@/types/analytics";
import { TrendingUp, Copy, Check } from "lucide-react";
import { useState } from "react";
import { toast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { ExportButton } from "./ExportButton";
import { Badge } from "@/components/ui/badge";

interface WalletListProps {
  wallets: PnLLeaderboardEntry[];
  onSelectWallet: (address: string) => void;
  selectedForExport?: Set<string>;
  onToggleExport?: (address: string) => void;
}

export function WalletList({ wallets, onSelectWallet, selectedForExport = new Set(), onToggleExport }: WalletListProps) {
  const [copiedAddress, setCopiedAddress] = useState<string | null>(null);

  const exportData = Array.from(selectedForExport).map(address => {
    const wallet = wallets.find(w => w.address === address);
    return wallet ? {
      address: wallet.address,
      pnl_usd_total: wallet.pnl_usd_total,
      pnl_usd_realised: wallet.pnl_usd_realised,
      pnl_usd_unrealised: wallet.pnl_usd_unrealised,
      roi_percent: wallet.roi_percent,
    } : null;
  }).filter(Boolean);

  const formatUSD = (value?: number) => {
    const v = typeof value === 'number' ? value : 0;
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(v);
  };

  const formatPercent = (value?: number) => {
    const v = typeof value === 'number' ? value : 0;
    return `${v > 0 ? '+' : ''}${v.toFixed(2)}%`;
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

  return (
    <Card className="p-6 bg-card/50 backdrop-blur border-border/50">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-accent glow-text">Top Profitable Traders</h2>
        {onToggleExport && (
          <ExportButton 
            data={exportData} 
            filename="selected-wallets"
            disabled={selectedForExport.size === 0}
          />
        )}
      </div>

      <div className="space-y-3 max-h-[600px] overflow-y-auto scrollbar-thin">
        {wallets.map((wallet, index) => (
          <Card
            key={wallet.address}
            className="p-4 bg-secondary border-border hover:border-accent/50 transition-all"
          >
            <div className="flex items-start gap-3">
              <div 
                className="flex-1 cursor-pointer"
                onClick={() => onSelectWallet(wallet.address)}
              >
                <div className="flex items-center gap-2 mb-2">
                  <Badge variant="outline" className="text-xs bg-accent/10 text-accent border-accent/30">
                    #{index + 1}
                  </Badge>
                  <code className="text-xs font-mono text-muted-foreground">
                    {wallet.address.slice(0, 10)}...{wallet.address.slice(-8)}
                  </code>
                  <button
                    onClick={(e) => copyAddress(wallet.address, e)}
                    className="p-1 hover:bg-accent/20 rounded transition-colors"
                  >
                    {copiedAddress === wallet.address ? (
                      <Check className="h-3 w-3 text-success" />
                    ) : (
                      <Copy className="h-3 w-3 text-muted-foreground" />
                    )}
                  </button>
                </div>

                {/* Show tokens this wallet traded */}
                {(wallet as any).tokens && (wallet as any).tokens.length > 0 && (
                  <div className="flex flex-wrap gap-1 mb-2">
                    {(wallet as any).tokens.map((token: string) => (
                      <Badge
                        key={token}
                        variant="outline"
                        className="text-xs bg-blue-500/10 text-blue-400 border-blue-500/30"
                      >
                        {token}
                      </Badge>
                    ))}
                  </div>
                )}

                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="h-4 w-4 text-success" />
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Total P&L</p>
                      <span className={`text-lg font-bold ${wallet.pnl_usd_total >= 0 ? 'text-success' : 'text-destructive'}`}>
                        {formatUSD(wallet.pnl_usd_total)}
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-col">
                    <p className="text-muted-foreground text-xs mb-1">ROI</p>
                    <span className={`font-semibold ${wallet.roi_percent >= 0 ? 'text-success' : 'text-destructive'}`}>
                      {formatPercent(wallet.roi_percent)}
                    </span>
                  </div>
                </div>
              </div>

              {onToggleExport && (
                <div className="flex items-center">
                  <Checkbox
                    checked={selectedForExport.has(wallet.address)}
                    onCheckedChange={() => onToggleExport(wallet.address)}
                    onClick={(e) => e.stopPropagation()}
                  />
                </div>
              )}
            </div>
          </Card>
        ))}
      </div>
    </Card>
  );
}
