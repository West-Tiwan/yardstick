import { NextRequest, NextResponse } from 'next/server';
import { budgetStore } from '@/lib/budget-store';
import { transactionStore } from '@/lib/data-store';
import { categoryStore } from '@/lib/category-store';
import { BudgetComparison, SpendingInsight } from '@/types/budget';
import { format } from 'date-fns';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const month = searchParams.get('month') || format(new Date(), 'yyyy-MM');
    
    const [budgets, transactions, categories] = await Promise.all([
      budgetStore.getByMonth(month),
      transactionStore.getAll(),
      categoryStore.getAll(),
    ]);
    
    // Filter transactions for the specific month and expenses only
    const monthTransactions = transactions.filter(t => {
      const transactionMonth = format(new Date(t.date), 'yyyy-MM');
      return transactionMonth === month && t.type === 'expense';
    });
    
    // Calculate actual spending by category
    const actualSpending = new Map<string, number>();
    monthTransactions.forEach(transaction => {
      if (transaction.category) {
        const current = actualSpending.get(transaction.category) || 0;
        actualSpending.set(transaction.category, current + transaction.amount);
      }
    });
    
    // Create budget comparisons
    const budgetComparisons: BudgetComparison[] = budgets.map(budget => {
      const actual = actualSpending.get(budget.category) || 0;
      const difference = budget.amount - actual;
      const percentageUsed = budget.amount > 0 ? (actual / budget.amount) * 100 : 0;
      const category = categories.find(c => c.name === budget.category);
      
      let status: 'under' | 'over' | 'on-track' = 'on-track';
      if (percentageUsed > 100) {
        status = 'over';
      } else if (percentageUsed < 80) {
        status = 'under';
      }
      
      return {
        category: budget.category,
        budgeted: budget.amount,
        actual,
        difference,
        percentageUsed,
        color: category?.color || '#64748b',
        icon: category?.icon || '📝',
        status,
      };
    });
    
    // Generate spending insights
    const insights: SpendingInsight[] = [];
    
    // Check for over-budget categories
    const overBudgetCategories = budgetComparisons.filter(b => b.status === 'over');
    if (overBudgetCategories.length > 0) {
      insights.push({
        title: 'Over Budget Alert',
        description: `You're over budget in ${overBudgetCategories.length} ${overBudgetCategories.length === 1 ? 'category' : 'categories'}: ${overBudgetCategories.map(b => b.category).join(', ')}`,
        type: 'warning',
        icon: '⚠️',
      });
    }
    
    // Check for categories with no spending
    const noSpendingCategories = budgetComparisons.filter(b => b.actual === 0);
    if (noSpendingCategories.length > 0) {
      insights.push({
        title: 'Unused Budgets',
        description: `You haven't spent anything in ${noSpendingCategories.length} budgeted ${noSpendingCategories.length === 1 ? 'category' : 'categories'}`,
        type: 'info',
        icon: '💡',
      });
    }
    
    // Check for good spending habits
    const wellManagedCategories = budgetComparisons.filter(b => b.percentageUsed >= 70 && b.percentageUsed <= 90);
    if (wellManagedCategories.length > 0) {
      insights.push({
        title: 'Great Budget Management',
        description: `You're managing your budget well in ${wellManagedCategories.length} ${wellManagedCategories.length === 1 ? 'category' : 'categories'}`,
        type: 'success',
        icon: '✅',
      });
    }
    
    // Calculate total budget vs actual
    const totalBudgeted = budgetComparisons.reduce((sum, b) => sum + b.budgeted, 0);
    const totalActual = budgetComparisons.reduce((sum, b) => sum + b.actual, 0);
    const totalSavings = totalBudgeted - totalActual;
    
    if (totalSavings > 0) {
      insights.push({
        title: 'Money Saved',
        description: `You've saved $${totalSavings.toFixed(2)} this month by staying under budget`,
        type: 'success',
        icon: '💰',
      });
    }
    
    return NextResponse.json({
      month,
      budgetComparisons,
      insights,
      summary: {
        totalBudgeted,
        totalActual,
        totalSavings,
        averageUsage: totalBudgeted > 0 ? (totalActual / totalBudgeted) * 100 : 0,
      },
    });
  } catch (error) {
    console.error('Error fetching budget comparison:', error);
    return NextResponse.json(
      { error: 'Failed to fetch budget comparison' },
      { status: 500 }
    );
  }
}
