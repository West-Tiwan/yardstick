import { ObjectId } from 'mongodb';

export interface Budget {
  _id?: string | ObjectId;
  category: string;
  amount: number;
  month: string; // Format: YYYY-MM
  createdAt?: Date;
  updatedAt?: Date;
}

export interface BudgetComparison {
  category: string;
  budgeted: number;
  actual: number;
  difference: number;
  percentageUsed: number;
  color: string;
  icon: string;
  status: 'under' | 'over' | 'on-track';
}

export interface SpendingInsight {
  title: string;
  description: string;
  type: 'warning' | 'success' | 'info';
  icon: string;
}
