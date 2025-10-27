import { Card } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";

interface PnLChartProps {
  data: Array<{
    token_symbol: string;
    pnl_usd: number;
  }>;
}

export function PnLChart({ data }: PnLChartProps) {
  const chartData = data.map(item => ({
    name: item.token_symbol,
    value: item.pnl_usd,
  }));

  return (
    <Card className="p-4 bg-card border-border">
      <h3 className="text-sm font-semibold mb-4 text-foreground">P&L by Token</h3>
      <ResponsiveContainer width="100%" height={200}>
        <BarChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
          <XAxis 
            dataKey="name" 
            tick={{ fill: 'hsl(var(--muted-foreground))' }}
            fontSize={12}
          />
          <YAxis 
            tick={{ fill: 'hsl(var(--muted-foreground))' }}
            fontSize={12}
          />
          <Tooltip 
            contentStyle={{
              backgroundColor: 'hsl(var(--card))',
              border: '1px solid hsl(var(--border))',
              borderRadius: '8px',
            }}
            formatter={(value: number) => [`$${value.toFixed(2)}`, 'P&L']}
          />
          <Bar dataKey="value" radius={[4, 4, 0, 0]}>
            {chartData.map((entry, index) => (
              <Cell 
                key={`cell-${index}`} 
                fill={entry.value >= 0 ? 'hsl(var(--success))' : 'hsl(var(--destructive))'}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </Card>
  );
}
