import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Search } from "lucide-react";

interface TokenInputProps {
  onAnalyze: (address: string) => void;
  isLoading: boolean;
}

export function TokenInput({ onAnalyze, isLoading }: TokenInputProps) {
  const [input, setInput] = useState("");

  const handleAnalyze = () => {
    const trimmed = input.trim();
    if (trimmed.length === 42 && trimmed.startsWith("0x")) {
      onAnalyze(trimmed);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleAnalyze();
    }
  };

  return (
    <Card className="p-6 bg-card/50 backdrop-blur border-border/50">
      <div className="space-y-4">
        <div>
          <h2 className="text-xl font-bold mb-2 text-accent glow-text">Token Analysis</h2>
          <p className="text-sm text-muted-foreground mb-4">
            Analyze a single BEP-20 token on BSC to discover top traders
          </p>
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Enter token contract address (0x...)"
            className="font-mono text-sm bg-muted border-border focus:border-accent transition-all"
            disabled={isLoading}
          />
        </div>

        <Button
          onClick={handleAnalyze}
          disabled={!(input.trim().length === 42 && input.trim().startsWith("0x")) || isLoading}
          className="w-full bg-accent hover:bg-accent/90 text-accent-foreground glow-border"
        >
          <Search className="mr-2 h-4 w-4" />
          Analyze Token
        </Button>
      </div>
    </Card>
  );
}
