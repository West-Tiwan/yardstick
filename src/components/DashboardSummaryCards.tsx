"use client";

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DashboardSummary } from '@/types/transaction';
import { TrendingUp, TrendingDown, DollarSign, CreditCard } from 'lucide-react';

interface DashboardSummaryCardsProps {
  summary: DashboardSummary;
}

export function DashboardSummaryCards({ summary }: DashboardSummaryCardsProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const cards = [
    {
      title: 'Total Income',
      value: summary.totalIncome,
      icon: TrendingUp,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
    },
    {
      title: 'Total Expenses',
      value: summary.totalExpenses,
      icon: TrendingDown,
      color: 'text-red-600',
      bgColor: 'bg-red-50',
    },
    {
      title: 'Net Income',
      value: summary.netIncome,
      icon: DollarSign,
      color: summary.netIncome >= 0 ? 'text-green-600' : 'text-red-600',
      bgColor: summary.netIncome >= 0 ? 'bg-green-50' : 'bg-red-50',
    },
    {
      title: 'Total Transactions',
      value: summary.transactionCount,
      icon: CreditCard,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      isCount: true,
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card) => {
        const Icon = card.icon;
        return (
          <Card key={card.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                {card.title}
              </CardTitle>
              <div className={`p-2 rounded-lg ${card.bgColor}`}>
                <Icon className={`h-4 w-4 ${card.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${card.color}`}>
                {card.isCount ? card.value : formatCurrency(card.value)}
              </div>
              {!card.isCount && (
                <p className="text-xs text-gray-600 mt-1">
                  {card.title === 'Net Income' 
                    ? (summary.netIncome >= 0 ? 'Positive balance' : 'Negative balance')
                    : 'Current month'
                  }
                </p>
              )}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
