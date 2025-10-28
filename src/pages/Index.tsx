import { useState } from "react";
import { MultiTokenInput } from "@/components/MultiTokenInput";
import { WalletList } from "@/components/WalletList";
import { WalletDetail } from "@/components/WalletDetail";
import { SideBySideComparison } from "@/components/SideBySideComparison";
import { CrossTokenAnalysis } from "@/components/CrossTokenAnalysis";
import { Documentation } from "@/components/Documentation";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getTokenInfo, getTokenPnLLeaderboard } from "@/lib/nansen";
import { PnLLeaderboardEntry } from "@/types/analytics";
import { toast } from "@/hooks/use-toast";
import { Loader2, Coins } from "lucide-react";

interface TokenData {
  address: string;
  symbol: string;
  name: string;
  wallets: PnLLeaderboardEntry[];
}

const Index = () => {
  const [loading, setLoading] = useState(false);
  const [tokensData, setTokensData] = useState<TokenData[]>([]);
  const [selectedWallet, setSelectedWallet] = useState<string | null>(null);
  const [selectedForExport, setSelectedForExport] = useState<Set<string>>(new Set());

  const handleToggleExport = (address: string) => {
    setSelectedForExport(prev => {
      const newSet = new Set(prev);
      if (newSet.has(address)) {
        newSet.delete(address);
      } else {
        newSet.add(address);
      }
      return newSet;
    });
  };

  const handleAnalyze = async (tokenAddresses: string[]) => {
    setLoading(true);
    setTokensData([]);
    setSelectedWallet(null);
    setSelectedForExport(new Set());

    try {
      const now = new Date();
      const dateTo = now.toISOString().split('T')[0];
      const dateFrom = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

      const results = await Promise.all(
        tokenAddresses.map(async (tokenAddress) => {
          const [tokenInfoRes, leaderboardRes] = await Promise.all([
            getTokenInfo(tokenAddress).catch(() => null),
            getTokenPnLLeaderboard(tokenAddress, {
              dateFrom,
              dateTo,
              limit: 10,
              page: 1,
              minHoldingUsd: 0,
              minRealisedPnl: 100,
              orderBy: [{ field: 'pnl_usd_total', direction: 'DESC' }],
            }).catch(() => null),
          ]);

          const ti = tokenInfoRes as any;
          const tokenItem = ti?.data?.[0] || ti?.items?.[0] || ti?.data?.items?.[0] || null;

          const items = (leaderboardRes as any)?.data || (leaderboardRes as any)?.items || [];
          const leaderboard: PnLLeaderboardEntry[] = items
            .map((it: any) => ({
              address: it.trader_address || it.address,
              pnl_usd_realised: it.pnl_usd_realised ?? 0,
              pnl_usd_unrealised: it.pnl_usd_unrealised ?? 0,
              pnl_usd_total: it.pnl_usd_total ?? ((it.pnl_usd_realised ?? 0) + (it.pnl_usd_unrealised ?? 0)),
              roi_percent: ((it.roi_percent_total ?? it.roi_percent ?? 0) * 100),
              winrate_percent: it.winrate_percent ?? 0,
              num_trades: it.num_trades ?? it.nof_trades ?? 0,
              volume_usd: it.volume_usd ?? 0,
              holding_usd: it.holding_usd ?? 0,
              avg_entry_price: it.avg_entry_price ?? 0,
              avg_exit_price: it.avg_exit_price ?? 0,
            }))
            .filter((w: PnLLeaderboardEntry) => w.address && w.pnl_usd_total > 0)
            .sort((a: PnLLeaderboardEntry, b: PnLLeaderboardEntry) => b.pnl_usd_total - a.pnl_usd_total)
            .slice(0, 10);

          return {
            address: tokenAddress,
            symbol: tokenItem?.token_symbol || 'Unknown',
            name: tokenItem?.token_name || 'Unknown Token',
            wallets: leaderboard,
          };
        })
      );

      setTokensData(results.filter(r => r.wallets.length > 0));

      const totalWallets = results.reduce((sum, r) => sum + r.wallets.length, 0);
      if (totalWallets > 0) {
        toast({
          title: "Analysis Complete",
          description: `Found ${totalWallets} profitable traders across ${results.length} token(s).`,
        });
      } else {
        toast({
          title: "No Data",
          description: "No profitable traders found for these tokens.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Analysis failed:', error);
      toast({
        title: "Analysis Failed",
        description: "Failed to analyze tokens. Please check the addresses and try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Build a map of wallets with their associated tokens
  const walletTokenMap = new Map<string, { wallet: PnLLeaderboardEntry; tokens: string[] }>();

  tokensData.forEach(tokenData => {
    tokenData.wallets.forEach(wallet => {
      if (!walletTokenMap.has(wallet.address)) {
        walletTokenMap.set(wallet.address, {
          wallet: { ...wallet },
          tokens: []
        });
      }
      const entry = walletTokenMap.get(wallet.address)!;
      entry.tokens.push(tokenData.symbol);
      // Accumulate PnL if wallet appears in multiple tokens
      if (entry.tokens.length > 1) {
        entry.wallet.pnl_usd_total += wallet.pnl_usd_total;
        entry.wallet.pnl_usd_realised += wallet.pnl_usd_realised || 0;
        entry.wallet.pnl_usd_unrealised += wallet.pnl_usd_unrealised || 0;
      }
    });
  });

  // Convert to array and add tokens info to each wallet
  const uniqueWallets = Array.from(walletTokenMap.values())
    .map(({ wallet, tokens }) => ({
      ...wallet,
      tokens, // Add tokens array to wallet object
    }))
    .sort((a, b) => b.pnl_usd_total - a.pnl_usd_total);

  const allWallets = tokensData.flatMap(t => t.wallets);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[hsl(45,100%,55%)] flex items-center justify-center shadow-lg" />
              <div>
                <h1 className="text-3xl font-bold text-accent glow-text">Aureus Analytics</h1>
                <p className="text-sm text-muted-foreground">BEP-20 Token Intelligence Platform</p>
              </div>
            </div>
            <Documentation />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Left Column */}
          <div className="space-y-6">
            <MultiTokenInput onAnalyze={handleAnalyze} isLoading={loading} />

            {loading && (
              <Card className="p-8 bg-card/50 backdrop-blur border-border/50">
                <div className="text-center space-y-4">
                  <div className="relative">
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-16 h-16 rounded-full bg-accent/20 animate-pulse"></div>
                    </div>
                    <Loader2 className="h-12 w-12 animate-spin text-accent mx-auto relative z-10" />
                  </div>
                  <div>
                    <p className="text-foreground font-medium mb-1">Analyzing Tokens</p>
                    <p className="text-sm text-muted-foreground">Identifying profitable traders on BSC...</p>
                  </div>
                </div>
              </Card>
            )}

            {!loading && tokensData.length > 0 && (
              <Tabs defaultValue="comparison" className="w-full">
                <TabsList className="grid w-full grid-cols-3 bg-secondary">
                  <TabsTrigger value="comparison">Side-by-Side</TabsTrigger>
                  <TabsTrigger value="all">All Traders</TabsTrigger>
                  <TabsTrigger value="cross">Patterns</TabsTrigger>
                </TabsList>

                <TabsContent value="comparison" className="mt-4">
                  <SideBySideComparison tokensData={tokensData} />
                </TabsContent>

                <TabsContent value="all" className="mt-4">
                  <WalletList
                    wallets={uniqueWallets}
                    onSelectWallet={setSelectedWallet}
                    selectedForExport={selectedForExport}
                    onToggleExport={handleToggleExport}
                  />
                </TabsContent>

                <TabsContent value="cross" className="mt-4">
                  <CrossTokenAnalysis tokensData={tokensData} />
                </TabsContent>
              </Tabs>
            )}
          </div>

          {/* Right Column */}
          <div>
            {selectedWallet ? (
              <WalletDetail
                address={selectedWallet}
                onClose={() => setSelectedWallet(null)}
              />
            ) : (
              <Card className="h-full flex items-center justify-center bg-card/30 backdrop-blur border-border/50 border-dashed">
                <div className="text-center text-muted-foreground space-y-4 p-12">
                  <div className="w-24 h-24 rounded-full bg-gradient-to-br from-accent/20 to-accent/5 flex items-center justify-center mx-auto">
                    <span className="text-5xl">📊</span>
                  </div>
                  <div>
                    <p className="text-lg font-bold text-foreground mb-2">
                      Wallet Deep Dive
                    </p>
                    <p className="text-sm max-w-sm mx-auto">
                      Click any wallet to view P&L breakdowns, portfolio holdings, and trading performance
                    </p>
                  </div>
                </div>
              </Card>
            )}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border mt-12 py-6">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>Advanced BNB Smart Chain Analytics & Trading Intelligence</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
