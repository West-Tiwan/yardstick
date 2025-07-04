"use client";

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Transaction, MonthlyExpense } from '@/types/transaction';
import { format } from 'date-fns';

interface MonthlyExpensesChartProps {
  transactions: Transaction[];
}

export function MonthlyExpensesChart({ transactions }: MonthlyExpensesChartProps) {
  const generateMonthlyExpenses = (): MonthlyExpense[] => {
    const monthlyData: Record<string, number> = {};

    // Filter only expenses and group by month
    transactions
      .filter(t => t.type === 'expense')
      .forEach(transaction => {
        const date = new Date(transaction.date);
        const monthKey = format(date, 'yyyy-MM');
        
        if (!monthlyData[monthKey]) {
          monthlyData[monthKey] = 0;
        }
        monthlyData[monthKey] += transaction.amount;
      });

    // Convert to array and sort by date
    const result = Object.entries(monthlyData)
      .map(([monthKey, amount]) => ({
        month: format(new Date(monthKey + '-01'), 'MMM yyyy'),
        amount: Number(amount.toFixed(2)),
      }))
      .sort((a, b) => {
        const dateA = new Date(a.month + ' 01');
        const dateB = new Date(b.month + ' 01');
        return dateA.getTime() - dateB.getTime();
      });

    return result;
  };

  const monthlyExpenses = generateMonthlyExpenses();

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const CustomTooltip = ({ active, payload, label }: {
    active?: boolean;
    payload?: Array<{ value: number }>;
    label?: string;
  }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border rounded-lg shadow-lg">
          <p className="font-medium">{label}</p>
          <p className="text-red-600">
            Expenses: {formatCurrency(payload[0].value)}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Monthly Expenses</CardTitle>
      </CardHeader>
      <CardContent>
        {monthlyExpenses.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            No expense data available
          </div>
        ) : (
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyExpenses} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="month" 
                  tick={{ fontSize: 12 }}
                  interval={0}
                  angle={-45}
                  textAnchor="end"
                  height={60}
                />
                <YAxis 
                  tick={{ fontSize: 12 }}
                  tickFormatter={formatCurrency}
                />
                <Tooltip content={<CustomTooltip />} />
                <Bar 
                  dataKey="amount" 
                  fill="#ef4444" 
                  radius={[4, 4, 0, 0]}
                  name="Expenses"
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
