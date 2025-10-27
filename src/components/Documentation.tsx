import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { BookOpen } from "lucide-react";
import { Card } from "@/components/ui/card";

export function Documentation() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <BookOpen className="h-4 w-4" />
          Documentation
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">Aureus Analytics Documentation</DialogTitle>
          <DialogDescription>
            Complete guide to using the BEP-20 Token Intelligence Platform
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 mt-4">
          <Card className="p-4 bg-card border-border">
            <h3 className="text-lg font-bold mb-2 text-accent">Getting Started</h3>
            <p className="text-sm text-muted-foreground mb-2">
              Aureus Analytics helps you identify profitable traders and analyze trading patterns across BEP-20 tokens on Binance Smart Chain.
            </p>
            <ol className="list-decimal list-inside text-sm text-muted-foreground space-y-1">
              <li>Paste one or more token contract addresses (0x...)</li>
              <li>Click "Analyze" to fetch top traders and trading data</li>
              <li>Click on any wallet to see detailed analytics</li>
              <li>Use export features to save data for further analysis</li>
            </ol>
          </Card>

          <Card className="p-4 bg-card border-border">
            <h3 className="text-lg font-bold mb-2 text-accent">Features</h3>
            <div className="space-y-3 text-sm">
              <div>
                <p className="font-semibold text-foreground">Multi-Token Analysis</p>
                <p className="text-muted-foreground">Analyze multiple tokens simultaneously to discover cross-token trading patterns and smart money wallets.</p>
              </div>
              <div>
                <p className="font-semibold text-foreground">Top Trader Identification</p>
                <p className="text-muted-foreground">Automatically ranks traders by profitability (P&L) with ROI metrics.</p>
              </div>
              <div>
                <p className="font-semibold text-foreground">Detailed Wallet Analysis</p>
                <p className="text-muted-foreground">View overview metrics, trade history, portfolio holdings, and performance charts for any wallet.</p>
              </div>
              <div>
                <p className="font-semibold text-foreground">Smart Money Detection</p>
                <p className="text-muted-foreground">Identifies wallets that consistently profit across multiple tokens - a strong indicator of smart money.</p>
              </div>
              <div>
                <p className="font-semibold text-foreground">Cross-Token Correlation</p>
                <p className="text-muted-foreground">Discovers which wallets are profitable on which tokens, revealing trading patterns.</p>
              </div>
              <div>
                <p className="font-semibold text-foreground">Export Capabilities</p>
                <p className="text-muted-foreground">Export wallet lists and analysis data in CSV or JSON format for external analysis.</p>
              </div>
            </div>
          </Card>

          <Card className="p-4 bg-card border-border">
            <h3 className="text-lg font-bold mb-2 text-accent">Data Explained</h3>
            <div className="space-y-2 text-sm">
              <div className="space-y-2">
                <div className="grid grid-cols-[120px_1fr] gap-2">
                  <p className="font-semibold text-foreground">Total P&L:</p>
                  <p className="text-muted-foreground">Realized + Unrealized profit/loss in USD</p>
                </div>
                <div className="grid grid-cols-[120px_1fr] gap-2">
                  <p className="font-semibold text-foreground">Realized P&L:</p>
                  <p className="text-muted-foreground">Profit from completed trades</p>
                </div>
                <div className="grid grid-cols-[120px_1fr] gap-2">
                  <p className="font-semibold text-foreground">ROI:</p>
                  <p className="text-muted-foreground">Return on Investment percentage</p>
                </div>
                <div className="grid grid-cols-[120px_1fr] gap-2">
                  <p className="font-semibold text-foreground">Trade History:</p>
                  <p className="text-muted-foreground">P&L breakdown by token</p>
                </div>
                <div className="grid grid-cols-[120px_1fr] gap-2">
                  <p className="font-semibold text-foreground">Portfolio:</p>
                  <p className="text-muted-foreground">Current token holdings and value</p>
                </div>
              </div>
            </div>
          </Card>

          <Card className="p-4 bg-card border-border">
            <h3 className="text-lg font-bold mb-2 text-accent">Tips</h3>
            <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
              <li>Analyze multiple related tokens to find consistent performers</li>
              <li>Look for wallets with high ROI and presence in multiple tokens</li>
              <li>Whale detection ($100k+ profit) indicates significant capital and likely expertise</li>
              <li>Use export to track wallets over time in your own tools</li>
              <li>Cross-reference token performance with wallet activity</li>
            </ul>
          </Card>

          <Card className="p-4 bg-accent/10 border-accent/30">
            <h3 className="text-lg font-bold mb-2 text-accent">Powered by Advanced Analytics</h3>
            <p className="text-sm text-muted-foreground">
              All data is sourced from institutional-grade blockchain analytics, providing accurate and real-time insights into BSC trading activity.
            </p>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
}
