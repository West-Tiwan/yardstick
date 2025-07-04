"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Budget } from '@/types/budget';
import { BudgetForm } from './BudgetForm';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { Edit, Trash2 } from 'lucide-react';

interface BudgetListProps {
  budgets: Budget[];
  onBudgetChange: () => void;
}

export function BudgetList({ budgets, onBudgetChange }: BudgetListProps) {
  const { toast } = useToast();
  const [editingBudget, setEditingBudget] = useState<Budget | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [deletingBudget, setDeletingBudget] = useState<Budget | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const formatMonth = (monthString: string) => {
    try {
      const date = new Date(monthString + '-01');
      return format(date, 'MMMM yyyy');
    } catch {
      return monthString;
    }
  };

  const handleEdit = (budget: Budget) => {
    setEditingBudget(budget);
    setIsEditDialogOpen(true);
  };

  const handleEditSubmit = async (updatedData: Omit<Budget, '_id' | 'createdAt' | 'updatedAt'>) => {
    if (!editingBudget) return;

    try {
      const response = await fetch(`/api/budgets/${editingBudget._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedData),
      });

      if (!response.ok) {
        throw new Error('Failed to update budget');
      }

      setIsEditDialogOpen(false);
      setEditingBudget(null);
      onBudgetChange();
    } catch (error) {
      throw error; // Re-throw to let the form handle the error
    }
  };

  const handleDelete = async (budget: Budget) => {
    setDeletingBudget(budget);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!deletingBudget) return;

    try {
      const response = await fetch(`/api/budgets/${deletingBudget._id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete budget');
      }

      toast({
        title: "Success",
        description: "Budget deleted successfully",
      });

      setIsDeleteDialogOpen(false);
      setDeletingBudget(null);
      onBudgetChange();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete budget",
        variant: "destructive",
      });
    }
  };

  // Group budgets by month
  const budgetsByMonth = budgets.reduce((acc, budget) => {
    const month = budget.month;
    if (!acc[month]) {
      acc[month] = [];
    }
    acc[month].push(budget);
    return acc;
  }, {} as Record<string, Budget[]>);

  // Sort months in descending order
  const sortedMonths = Object.keys(budgetsByMonth).sort((a, b) => b.localeCompare(a));

  if (budgets.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Your Budgets</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center text-gray-500 py-8">
            <p className="mb-4">No budgets set yet</p>
            <p className="text-sm">Create your first budget to start tracking your spending goals</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Your Budgets</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {sortedMonths.map((month) => (
              <div key={month}>
                <h3 className="text-lg font-semibold mb-3 text-gray-900">
                  {formatMonth(month)}
                </h3>
                <div className="space-y-2">
                  {budgetsByMonth[month]
                    .sort((a, b) => a.category.localeCompare(b.category))
                    .map((budget) => (
                      <div
                        key={budget._id?.toString()}
                        className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                      >
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span className="font-medium">{budget.category}</span>
                          </div>
                          <p className="text-sm text-gray-600">
                            Budget: {formatCurrency(budget.amount)}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-blue-600">
                            {formatCurrency(budget.amount)}
                          </span>
                          <div className="flex gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEdit(budget)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDelete(budget)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Budget</DialogTitle>
          </DialogHeader>
          {editingBudget && (
            <BudgetForm
              budget={editingBudget}
              onSubmit={handleEditSubmit}
              onCancel={() => setIsEditDialogOpen(false)}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Budget</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this budget? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          {deletingBudget && (
            <div className="py-4">
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="font-medium">{deletingBudget.category}</p>
                <p className="text-sm text-gray-600">
                  {formatCurrency(deletingBudget.amount)} • {formatMonth(deletingBudget.month)}
                </p>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsDeleteDialogOpen(false);
                setDeletingBudget(null);
              }}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={confirmDelete}
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
