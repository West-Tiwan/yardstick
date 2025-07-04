import { ObjectId } from 'mongodb';

export interface Category {
  _id?: string | ObjectId;
  name: string;
  color: string;
  icon: string;
  type: 'income' | 'expense';
  createdAt?: Date;
  updatedAt?: Date;
}

export const PREDEFINED_CATEGORIES: Omit<Category, '_id' | 'createdAt' | 'updatedAt'>[] = [
  // Income categories
  { name: 'Salary', color: '#22c55e', icon: '💰', type: 'income' },
  { name: 'Freelance', color: '#3b82f6', icon: '💻', type: 'income' },
  { name: 'Investment', color: '#8b5cf6', icon: '📈', type: 'income' },
  { name: 'Other Income', color: '#06b6d4', icon: '💵', type: 'income' },
  
  // Expense categories
  { name: 'Food & Dining', color: '#ef4444', icon: '🍽️', type: 'expense' },
  { name: 'Transportation', color: '#f97316', icon: '🚗', type: 'expense' },
  { name: 'Shopping', color: '#ec4899', icon: '🛍️', type: 'expense' },
  { name: 'Entertainment', color: '#8b5cf6', icon: '🎬', type: 'expense' },
  { name: 'Healthcare', color: '#06b6d4', icon: '🏥', type: 'expense' },
  { name: 'Utilities', color: '#84cc16', icon: '⚡', type: 'expense' },
  { name: 'Rent', color: '#6b7280', icon: '🏠', type: 'expense' },
  { name: 'Education', color: '#eab308', icon: '📚', type: 'expense' },
  { name: 'Travel', color: '#14b8a6', icon: '✈️', type: 'expense' },
  { name: 'Other Expenses', color: '#64748b', icon: '📝', type: 'expense' },
];
