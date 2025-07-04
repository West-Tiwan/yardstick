import { NextResponse } from 'next/server';
import { transactionStore } from '@/lib/data-store';
import { categoryStore } from '@/lib/category-store';
import { Transaction, DashboardSummary, CategoryExpense } from '@/types/transaction';

export async function GET() {
  try {
    await transactionStore.initializeSampleData();
    
    const [transactions, categories] = await Promise.all([
      transactionStore.getAll(),
      categoryStore.getAll(),
    ]);
    
    // Calculate financial totals
    const totalIncome = transactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);
    
    const totalExpenses = transactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);
    
    const netIncome = totalIncome - totalExpenses;
    
    // Calculate category breakdown for expenses
    const categoryExpenseMap = new Map<string, number>();
    transactions
      .filter(t => t.type === 'expense' && t.category)
      .forEach(t => {
        const current = categoryExpenseMap.get(t.category!) || 0;
        categoryExpenseMap.set(t.category!, current + t.amount);
      });
    
    const categoryBreakdown: CategoryExpense[] = Array.from(categoryExpenseMap.entries())
      .map(([categoryName, amount]) => {
        const category = categories.find(c => c.name === categoryName);
        return {
          category: categoryName,
          amount,
          color: category?.color || '#64748b',
          icon: category?.icon || '📝',
        };
      })
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 10);
    
    const recentTransactions = transactions
      .sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime())
      .slice(0, 5);
    
    const summary: DashboardSummary = {
      totalIncome,
      totalExpenses,
      netIncome,
      transactionCount: transactions.length,
      categoryBreakdown,
      recentTransactions,
    };
    
    return NextResponse.json(summary);
  } catch (error) {
    console.error('Error fetching dashboard summary:', error);
    return NextResponse.json(
      { error: 'Failed to fetch dashboard summary' },
      { status: 500 }
    );
  }
}
