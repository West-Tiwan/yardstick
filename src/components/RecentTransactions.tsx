"use client";

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Transaction } from '@/types/transaction';
import { format } from 'date-fns';

interface RecentTransactionsProps {
  transactions: Transaction[];
}

export function RecentTransactions({ transactions }: RecentTransactionsProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  if (transactions.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Recent Transactions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center text-gray-500 py-8">
            No transactions yet
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Transactions</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {transactions.map((transaction) => (
          <div
            key={transaction._id?.toString()}
            className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
          >
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <span className="font-medium text-sm">{transaction.description}</span>
                {transaction.category && (
                  <span className="text-xs text-gray-500">
                    • {transaction.category}
                  </span>
                )}
              </div>
              <p className="text-xs text-gray-600">
                {format(new Date(transaction.date), 'MMM dd, yyyy')}
              </p>
            </div>
            <div className="text-right">
              <span className={`font-semibold text-sm ${
                transaction.type === 'income' ? 'text-green-600' : 'text-red-600'
              }`}>
                {transaction.type === 'income' ? '+' : '-'}{formatCurrency(transaction.amount)}
              </span>
              <div className={`text-xs px-2 py-1 rounded-full inline-block ml-2 ${
                transaction.type === 'income' 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-red-100 text-red-800'
              }`}>
                {transaction.type}
              </div>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
