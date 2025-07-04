"use client";

import { useState, useEffect, useCallback } from 'react';
import { Transaction, DashboardSummary } from '@/types/transaction';
import { Budget, BudgetComparison, SpendingInsight } from '@/types/budget';
import { TransactionForm } from '@/components/TransactionForm';
import { TransactionList } from '@/components/TransactionList';
import { MonthlyExpensesChart } from '@/components/MonthlyExpensesChart';
import { CategoryPieChart } from '@/components/CategoryPieChart';
import { DashboardSummaryCards } from '@/components/DashboardSummaryCards';
import { RecentTransactions } from '@/components/RecentTransactions';
import { BudgetForm } from '@/components/BudgetForm';
import { BudgetList } from '@/components/BudgetList';
import { BudgetComparisonChart } from '@/components/BudgetComparisonChart';
import { SpendingInsights } from '@/components/SpendingInsights';
import { Toaster } from '@/components/ui/toaster';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';

export default function HomePage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [dashboardSummary, setDashboardSummary] = useState<DashboardSummary | null>(null);
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [budgetComparison, setBudgetComparison] = useState<{
    budgetComparisons: BudgetComparison[];
    insights: SpendingInsight[];
    month: string;
  } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDashboardLoading, setIsDashboardLoading] = useState(true);
  const [isBudgetLoading, setIsBudgetLoading] = useState(true);
  const [currentMonth, setCurrentMonth] = useState(format(new Date(), 'yyyy-MM'));
  const { toast } = useToast();

  const fetchTransactions = useCallback(async () => {
    try {
      const response = await fetch('/api/transactions');
      if (!response.ok) {
        throw new Error('Failed to fetch transactions');
      }
      const data = await response.json();
      setTransactions(data);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load transactions",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  const fetchDashboardSummary = useCallback(async () => {
    try {
      const response = await fetch('/api/dashboard');
      if (!response.ok) {
        throw new Error('Failed to fetch dashboard summary');
      }
      const data = await response.json();
      setDashboardSummary(data);
    } catch (error) {
      console.error('Error fetching dashboard summary:', error);
      toast({
        title: "Error",
        description: "Failed to load dashboard summary",
        variant: "destructive",
      });
    } finally {
      setIsDashboardLoading(false);
    }
  }, [toast]);

  const fetchBudgets = useCallback(async () => {
    try {
      const response = await fetch('/api/budgets');
      if (!response.ok) {
        throw new Error('Failed to fetch budgets');
      }
      const data = await response.json();
      setBudgets(data);
    } catch (error) {
      console.error('Error fetching budgets:', error);
    }
  }, []);

  const fetchBudgetComparison = useCallback(async () => {
    try {
      const response = await fetch(`/api/budgets/comparison?month=${currentMonth}`);
      if (!response.ok) {
        throw new Error('Failed to fetch budget comparison');
      }
      const data = await response.json();
      setBudgetComparison(data);
    } catch (error) {
      console.error('Error fetching budget comparison:', error);
    } finally {
      setIsBudgetLoading(false);
    }
  }, [currentMonth]);

  useEffect(() => {
    fetchTransactions();
    fetchDashboardSummary();
    fetchBudgets();
    fetchBudgetComparison();
  }, [fetchTransactions, fetchDashboardSummary, fetchBudgets, fetchBudgetComparison]);

  const handleAddTransaction = async (transactionData: Omit<Transaction, '_id' | 'createdAt' | 'updatedAt'>) => {
    try {
      const response = await fetch('/api/transactions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(transactionData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to create transaction');
      }

      await fetchTransactions();
      await fetchDashboardSummary();
      await fetchBudgetComparison();
    } catch (error) {
      throw error; // Re-throw to let the form handle the error
    }
  };

  const handleAddBudget = async (budgetData: Omit<Budget, '_id' | 'createdAt' | 'updatedAt'>) => {
    try {
      const response = await fetch('/api/budgets', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(budgetData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to create budget');
      }

      await fetchBudgets();
      await fetchBudgetComparison();
    } catch (error) {
      throw error; // Re-throw to let the form handle the error
    }
  };

  const handleTransactionChange = () => {
    fetchTransactions();
    fetchDashboardSummary();
    fetchBudgetComparison();
  };

  const handleBudgetChange = () => {
    fetchBudgets();
    fetchBudgetComparison();
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading transactions...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <header className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Personal Finance Visualizer
          </h1>
          <p className="text-gray-600">
            Track your income and expenses with beautiful charts and insights
          </p>
        </header>

        {/* Dashboard Summary Cards */}
        {!isDashboardLoading && dashboardSummary && (
          <div className="mb-8">
            <DashboardSummaryCards summary={dashboardSummary} />
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Forms */}
          <div className="lg:col-span-1 space-y-6">
            <TransactionForm onSubmit={handleAddTransaction} />
            <BudgetForm onSubmit={handleAddBudget} />
          </div>

          {/* Right Column - Charts and Data */}
          <div className="lg:col-span-2 space-y-8">
            {/* Charts Row */}
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
              <MonthlyExpensesChart transactions={transactions} />
              {!isDashboardLoading && dashboardSummary && (
                <CategoryPieChart data={dashboardSummary.categoryBreakdown} />
              )}
            </div>

            {/* Budget vs Actual Chart */}
            {!isBudgetLoading && budgetComparison && budgetComparison.budgetComparisons.length > 0 && (
              <BudgetComparisonChart 
                data={budgetComparison.budgetComparisons} 
                month={budgetComparison.month}
              />
            )}

            {/* Insights and Recent Transactions */}
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
              {!isBudgetLoading && budgetComparison && (
                <SpendingInsights insights={budgetComparison.insights} />
              )}
              {!isDashboardLoading && dashboardSummary && (
                <RecentTransactions transactions={dashboardSummary.recentTransactions} />
              )}
            </div>
          </div>
        </div>

        {/* Budget Management Section */}
        <div className="mt-8">
          <BudgetList budgets={budgets} onBudgetChange={handleBudgetChange} />
        </div>

        {/* Full Width Transaction List */}
        <div className="mt-8">
          <TransactionList 
            transactions={transactions} 
            onTransactionChange={handleTransactionChange}
          />
        </div>
      </div>
      <Toaster />
    </div>
  );
}
