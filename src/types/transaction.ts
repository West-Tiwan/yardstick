import { ObjectId } from 'mongodb';

export interface Transaction {
  _id?: string | ObjectId;
  amount: number;
  date: string;
  description: string;
  type: 'income' | 'expense';
  category?: string; // Category name
  createdAt?: Date;
  updatedAt?: Date;
}

export interface MonthlyExpense {
  month: string;
  amount: number;
}

export interface CategoryExpense {
  category: string;
  amount: number;
  color: string;
  icon: string;
}

export interface DashboardSummary {
  totalIncome: number;
  totalExpenses: number;
  netIncome: number;
  transactionCount: number;
  categoryBreakdown: CategoryExpense[];
  recentTransactions: Transaction[];
}
