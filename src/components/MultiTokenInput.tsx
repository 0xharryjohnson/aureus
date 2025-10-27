import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Search, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface MultiTokenInputProps {
  onAnalyze: (addresses: string[]) => void;
  isLoading: boolean;
}

export function MultiTokenInput({ onAnalyze, isLoading }: MultiTokenInputProps) {
  const [input, setInput] = useState("");
  const [tokens, setTokens] = useState<string[]>([]);

  const handleAddTokens = () => {
    const lines = input.split('\n').map(line => line.trim()).filter(line => line.length === 42 && line.startsWith("0x"));
    if (lines.length > 0) {
      const uniqueTokens = Array.from(new Set([...tokens, ...lines]));
      if (uniqueTokens.length > 5) {
        setTokens(uniqueTokens.slice(0, 5));
        setInput("");
        return;
      }
      setTokens(uniqueTokens);
      setInput("");
    }
  };

  const handleRemoveToken = (token: string) => {
    setTokens(tokens.filter(t => t !== token));
  };

  const handleAnalyze = () => {
    if (tokens.length > 0) {
      onAnalyze(tokens);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && e.ctrlKey) {
      handleAddTokens();
    }
  };

  return (
    <Card className="p-6 bg-card/50 backdrop-blur border-border/50">
      <div className="space-y-4">
        <div>
          <h2 className="text-xl font-bold mb-2 text-accent glow-text">Multi-Token Analysis</h2>
          <p className="text-sm text-muted-foreground mb-4">
            Analyze up to 5 BEP-20 tokens on BSC to discover top traders and cross-token patterns
          </p>
          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Paste token addresses (one per line, 0x...)"
            className="font-mono text-sm bg-muted border-border focus:border-accent transition-all min-h-[100px]"
            disabled={isLoading}
          />
          <p className="text-xs text-muted-foreground mt-1">Press Ctrl+Enter to add tokens</p>
        </div>

        {tokens.length > 0 && (
          <div className="space-y-2">
            <p className="text-sm font-medium">Tokens to analyze ({tokens.length}):</p>
            <div className="flex flex-wrap gap-2">
              {tokens.map((token) => (
                <Badge key={token} variant="secondary" className="font-mono text-xs pr-1">
                  {token.slice(0, 6)}...{token.slice(-4)}
                  <button
                    onClick={() => handleRemoveToken(token)}
                    className="ml-1 hover:text-destructive"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
            </div>
          </div>
        )}

        <div className="flex gap-2">
          <Button
            onClick={handleAddTokens}
            disabled={!input.trim() || isLoading || tokens.length >= 5}
            variant="outline"
            className="flex-1"
          >
            Add Tokens {tokens.length >= 5 && '(Max 5)'}
          </Button>
          <Button
            onClick={handleAnalyze}
            disabled={tokens.length === 0 || isLoading}
            className="flex-1 bg-accent hover:bg-accent/90 text-accent-foreground glow-border"
          >
            <Search className="mr-2 h-4 w-4" />
            Analyze {tokens.length} Token{tokens.length !== 1 ? 's' : ''}
          </Button>
        </div>
      </div>
    </Card>
  );
}
