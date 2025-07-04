"use client";

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BudgetComparison } from '@/types/budget';

interface BudgetComparisonChartProps {
  data: BudgetComparison[];
  month: string;
}

export function BudgetComparisonChart({ data, month }: BudgetComparisonChartProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const budgeted = payload.find((p: any) => p.dataKey === 'budgeted')?.value || 0;
      const actual = payload.find((p: any) => p.dataKey === 'actual')?.value || 0;
      const difference = budgeted - actual;
      
      return (
        <div className="bg-white p-3 border rounded-lg shadow-lg">
          <p className="font-medium mb-2">{label}</p>
          <div className="space-y-1">
            <p className="text-sm">
              <span className="inline-block w-3 h-3 bg-blue-500 rounded mr-2"></span>
              Budgeted: {formatCurrency(budgeted)}
            </p>
            <p className="text-sm">
              <span className="inline-block w-3 h-3 bg-green-500 rounded mr-2"></span>
              Actual: {formatCurrency(actual)}
            </p>
            <p className={`text-sm font-medium ${difference >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {difference >= 0 ? 'Under by' : 'Over by'}: {formatCurrency(Math.abs(difference))}
            </p>
          </div>
        </div>
      );
    }
    return null;
  };

  // Prepare data for the chart
  const chartData = data.map(item => ({
    category: item.category.length > 12 ? item.category.substring(0, 12) + '...' : item.category,
    fullCategory: item.category,
    budgeted: item.budgeted,
    actual: item.actual,
    icon: item.icon,
  }));

  if (data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Budget vs Actual - {month}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-64 text-gray-500">
            No budget data available for this month
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Budget vs Actual Spending - {month}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartData}
              margin={{
                top: 20,
                right: 30,
                left: 20,
                bottom: 60,
              }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="category" 
                angle={-45}
                textAnchor="end"
                height={80}
                interval={0}
                fontSize={12}
              />
              <YAxis 
                tickFormatter={(value) => `$${value}`}
                fontSize={12}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Bar 
                dataKey="budgeted" 
                fill="#3b82f6" 
                name="Budgeted"
                radius={[2, 2, 0, 0]}
              />
              <Bar 
                dataKey="actual" 
                fill="#10b981" 
                name="Actual"
                radius={[2, 2, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
        
        {/* Legend with status indicators */}
        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
          {data.map((item, index) => (
            <div key={index} className="flex items-center gap-2 text-sm">
              <span>{item.icon}</span>
              <span className="truncate">{item.category}</span>
              <span className={`px-2 py-1 text-xs rounded-full ${
                item.status === 'over' 
                  ? 'bg-red-100 text-red-800' 
                  : item.status === 'under'
                  ? 'bg-blue-100 text-blue-800'
                  : 'bg-green-100 text-green-800'
              }`}>
                {item.percentageUsed.toFixed(0)}%
              </span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
