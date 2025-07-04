"use client";

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CategoryExpense } from '@/types/transaction';

interface CategoryPieChartProps {
  data: CategoryExpense[];
}

export function CategoryPieChart({ data }: CategoryPieChartProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      const icon = data?.icon || '📝';
      const category = data?.category || 'Unknown';
      const amount = data?.amount || 0;
      const total = data?.total || 1;
      
      return (
        <div className="bg-white p-3 border rounded-lg shadow-lg">
          <div className="flex items-center gap-2">
            <span>{icon}</span>
            <span className="font-medium">{category}</span>
          </div>
          <p className="text-sm text-gray-600">
            Amount: {formatCurrency(amount)}
          </p>
          <p className="text-sm text-gray-600">
            {((amount / total) * 100).toFixed(1)}% of total
          </p>
        </div>
      );
    }
    return null;
  };

  const CustomLegend = ({ payload }: any) => {
    // Use the data directly since we're passing dataWithTotal manually
    const legendData = payload || dataWithTotal;
    
    if (!legendData || !Array.isArray(legendData)) {
      return null;
    }
    
    return (
      <div className="grid grid-cols-2 gap-2 mt-4">
        {legendData.map((entry: any, index: number) => {
          const icon = entry?.icon || '📝';
          const category = entry?.category || 'Unknown';
          const color = entry?.color || '#64748b';
          
          return (
            <div key={index} className="flex items-center gap-2 text-sm">
              <div 
                className="w-3 h-3 rounded"
                style={{ backgroundColor: color }}
              />
              <span className="flex items-center gap-1">
                <span>{icon}</span>
                <span className="truncate">{category}</span>
              </span>
            </div>
          );
        })}
      </div>
    );
  };

  // Calculate total for percentage calculation
  const total = data.reduce((sum, item) => sum + item.amount, 0);
  const dataWithTotal = data.map(item => ({ ...item, total }));

  if (data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Expenses by Category</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-64 text-gray-500">
            No expense data available
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Expenses by Category</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={dataWithTotal}
                cx="50%"
                cy="50%"
                outerRadius={80}
                dataKey="amount"
                label={false}
              >
                {dataWithTotal.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <CustomLegend payload={dataWithTotal} />
      </CardContent>
    </Card>
  );
}
