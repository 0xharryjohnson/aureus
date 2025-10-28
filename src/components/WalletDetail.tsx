import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { X, TrendingUp, DollarSign, Wallet as WalletIcon, Copy, Check } from "lucide-react";
import { getWalletPnLSummary, getWalletPortfolio } from "@/lib/nansen";
import { AddressPnLSummary, PortfolioHolding } from "@/types/analytics";
import { toast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import { TradeHistory } from "./TradeHistory";
import { Portfolio } from "./Portfolio";
import { PnLChart } from "./charts/PnLChart";
import { PortfolioChart } from "./charts/PortfolioChart";

interface WalletDetailProps {
  address: string;
  onClose: () => void;
}

export function WalletDetail({ address, onClose }: WalletDetailProps) {
  const [loading, setLoading] = useState(true);
  const [pnlSummary, setPnlSummary] = useState<AddressPnLSummary | null>(null);
  const [portfolio, setPortfolio] = useState<PortfolioHolding[]>([]);
  const [totalValue, setTotalValue] = useState<number>(0);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    loadWalletData();
  }, [address]);

  const loadWalletData = async () => {
    setLoading(true);
    try {
      const now = new Date();
      const dateTo = now.toISOString().split('T')[0];
      const dateFrom = new Date(now.getTime() - 180 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

      const [pnlData, portfolioData] = await Promise.all([
        getWalletPnLSummary(address, { dateFrom, dateTo }),
        getWalletPortfolio(address).catch(() => ({ data: { holdings: [], total_value_usd: 0 } })),
      ]);

      setPnlSummary(pnlData.data);
      setPortfolio(portfolioData.data?.holdings || []);
      setTotalValue(portfolioData.data?.total_value_usd || 0);
    } catch (error) {
      console.error('Failed to load wallet data:', error);
      toast({
        title: "Error",
        description: "Failed to load wallet data. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const copyAddress = async () => {
    try {
      await navigator.clipboard.writeText(address);
      setCopied(true);
      toast({
        title: "Copied!",
        description: "Wallet address copied to clipboard",
      });
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      toast({
        title: "Failed to copy",
        description: "Could not copy address to clipboard",
        variant: "destructive",
      });
    }
  };

  const formatUSD = (value: number | string) => {
    const num = typeof value === 'string' ? parseFloat(value) : value;
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(num);
  };

  return (
    <Card className="p-6 bg-card border-border">
      <div className="flex items-start justify-between mb-6">
        <div className="flex-1">
          <h2 className="text-xl font-bold text-accent glow-text mb-2">Wallet Analysis</h2>
          <div className="flex items-center gap-2">
            <code className="text-sm font-mono text-muted-foreground">
              {address}
            </code>
            <Button
              size="sm"
              variant="ghost"
              onClick={copyAddress}
              className="h-6 w-6 p-0"
            >
              {copied ? (
                <Check className="h-3 w-3 text-success" />
              ) : (
                <Copy className="h-3 w-3" />
              )}
            </Button>
          </div>
        </div>
        <Button
          size="sm"
          variant="ghost"
          onClick={onClose}
          className="hover:bg-secondary"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>

      {loading ? (
        <div className="space-y-4">
          <Skeleton className="h-24 w-full bg-muted" />
          <Skeleton className="h-48 w-full bg-muted" />
          <Skeleton className="h-48 w-full bg-muted" />
        </div>
      ) : (
        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-4 bg-secondary">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="trades">Trades</TabsTrigger>
            <TabsTrigger value="portfolio">Portfolio</TabsTrigger>
            <TabsTrigger value="charts">Charts</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4 mt-4">
            <div className="grid grid-cols-2 gap-4">
              <Card className="p-4 bg-secondary border-border">
                <div className="flex items-center gap-2 mb-2">
                  <DollarSign className="h-4 w-4 text-accent" />
                  <p className="text-sm text-muted-foreground">Total P&L</p>
                </div>
                <p className={`text-2xl font-bold ${(pnlSummary?.pnl_usd_total || 0) >= 0 ? 'text-success' : 'text-destructive'}`}>
                  {pnlSummary ? formatUSD(pnlSummary.pnl_usd_total) : '$0'}
                </p>
              </Card>

              <Card className="p-4 bg-secondary border-border">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingUp className="h-4 w-4 text-success" />
                  <p className="text-sm text-muted-foreground">Realized P&L</p>
                </div>
                <p className="text-2xl font-bold text-success">
                  {pnlSummary ? formatUSD(pnlSummary.pnl_usd_realised) : '$0'}
                </p>
              </Card>

              <Card className="p-4 bg-secondary border-border">
                <div className="flex items-center gap-2 mb-2">
                  <WalletIcon className="h-4 w-4 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">Win Rate</p>
                </div>
                <p className="text-2xl font-bold">
                  {pnlSummary?.winrate_percent != null ? `${pnlSummary.winrate_percent.toFixed(1)}%` : '0%'}
                </p>
              </Card>

              <Card className="p-4 bg-secondary border-border">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">ROI</p>
                </div>
                <p className={`text-2xl font-bold ${(pnlSummary?.roi_percent || 0) >= 0 ? 'text-success' : 'text-destructive'}`}>
                  {pnlSummary?.roi_percent != null ? `${pnlSummary.roi_percent.toFixed(2)}%` : '0%'}
                </p>
              </Card>
            </div>

            {(pnlSummary?.pnl_usd_total || 0) > 100000 && (
              <Card className="p-4 bg-accent/10 border-accent/30">
                <div className="flex items-center gap-2">
                  <Badge className="bg-accent text-accent-foreground glow-border">
                    🐋 Whale Detected
                  </Badge>
                  <p className="text-sm text-foreground">
                    This wallet has generated exceptional profits and likely represents smart money.
                  </p>
                </div>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="trades" className="space-y-3 mt-4">
            <TradeHistory trades={pnlSummary?.top_tokens || []} />
          </TabsContent>

          <TabsContent value="portfolio" className="space-y-3 mt-4">
            <Portfolio holdings={portfolio} total_value_usd={totalValue} />
          </TabsContent>

          <TabsContent value="charts" className="space-y-4 mt-4">
            {pnlSummary?.top_tokens && pnlSummary.top_tokens.length > 0 && (
              <PnLChart data={pnlSummary.top_tokens} />
            )}
            {portfolio.length > 0 && (
              <PortfolioChart data={portfolio} />
            )}
            {(!pnlSummary?.top_tokens || pnlSummary.top_tokens.length === 0) && portfolio.length === 0 && (
              <div className="text-center py-12 text-muted-foreground">
                <p>No chart data available</p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="breakdown" className="space-y-3 mt-4">
            <div className="max-h-96 overflow-y-auto scrollbar-thin">
              {pnlSummary?.top_tokens?.map((token) => (
                <Card key={token.token_address} className="p-4 bg-secondary border-border mb-3">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <p className="font-bold text-foreground">{token.token_symbol}</p>
                      <p className="text-xs text-muted-foreground">{token.token_name}</p>
                      <p className="text-xs text-muted-foreground font-mono mt-1">
                        {token.token_address.slice(0, 6)}...{token.token_address.slice(-4)}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className={`text-lg font-bold ${token.pnl_usd >= 0 ? 'text-success' : 'text-destructive'}`}>
                        {formatUSD(token.pnl_usd)}
                      </p>
                      <p className="text-xs text-muted-foreground">P&L</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-2 text-sm">
                    <div>
                      <p className="text-muted-foreground">ROI</p>
                      <p className={`font-semibold ${(token.roi_percent || 0) >= 0 ? 'text-success' : 'text-destructive'}`}>
                        {token.roi_percent != null ? token.roi_percent.toFixed(2) : '0.00'}%
                      </p>
                    </div>
                  </div>
                </Card>
              ))}
              {(!pnlSummary?.top_tokens || pnlSummary.top_tokens.length === 0) && (
                <div className="text-center py-12 text-muted-foreground">
                  <p>No token breakdown available</p>
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      )}
    </Card>
  );
}
