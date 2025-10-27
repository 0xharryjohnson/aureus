import { Card } from "@/components/ui/card";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts";

interface PortfolioChartProps {
  data: Array<{
    token_symbol: string;
    balance_usd: number;
  }>;
}

const COLORS = [
  'hsl(var(--accent))',
  'hsl(var(--success))',
  'hsl(var(--chart-2))',
  'hsl(var(--chart-3))',
  'hsl(var(--chart-4))',
  'hsl(var(--chart-5))',
];

export function PortfolioChart({ data }: PortfolioChartProps) {
  const chartData = data
    .filter(item => item.balance_usd > 0)
    .map(item => ({
      name: item.token_symbol,
      value: item.balance_usd,
    }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 6);

  if (chartData.length === 0) {
    return null;
  }

  return (
    <Card className="p-4 bg-card border-border">
      <h3 className="text-sm font-semibold mb-4 text-foreground">Portfolio Composition</h3>
      <ResponsiveContainer width="100%" height={200}>
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={(entry) => `${entry.name} (${((entry.value / chartData.reduce((a, b) => a + b.value, 0)) * 100).toFixed(1)}%)`}
            outerRadius={60}
            fill="#8884d8"
            dataKey="value"
          >
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip 
            contentStyle={{
              backgroundColor: 'hsl(var(--card))',
              border: '1px solid hsl(var(--border))',
              borderRadius: '8px',
            }}
            formatter={(value: number) => [`$${value.toFixed(2)}`, 'Value']}
          />
        </PieChart>
      </ResponsiveContainer>
    </Card>
  );
}
