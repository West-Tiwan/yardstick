"use client";

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Transaction } from '@/types/transaction';
import { Category } from '@/types/category';
import { TransactionForm } from './TransactionForm';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { Edit, Trash2 } from 'lucide-react';

interface TransactionListProps {
  transactions: Transaction[];
  onTransactionChange: () => void;
}

export function TransactionList({ transactions, onTransactionChange }: TransactionListProps) {
  const { toast } = useToast();
  const [categories, setCategories] = useState<Category[]>([]);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [deletingTransaction, setDeletingTransaction] = useState<Transaction | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  // Fetch categories for display
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch('/api/categories');
        if (response.ok) {
          const data = await response.json();
          setCategories(data);
        }
      } catch (error) {
        console.error('Error fetching categories:', error);
      }
    };

    fetchCategories();
  }, []);

  const getCategoryInfo = (categoryName?: string) => {
    if (!categoryName) return null;
    return categories.find(cat => cat.name === categoryName);
  };

  const handleEdit = (transaction: Transaction) => {
    setEditingTransaction(transaction);
    setIsEditDialogOpen(true);
  };

  const handleEditSubmit = async (updatedData: Omit<Transaction, '_id' | 'createdAt' | 'updatedAt'>) => {
    if (!editingTransaction) return;

    try {
      const response = await fetch(`/api/transactions/${editingTransaction._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedData),
      });

      if (!response.ok) {
        throw new Error('Failed to update transaction');
      }

      setIsEditDialogOpen(false);
      setEditingTransaction(null);
      onTransactionChange();
    } catch (error) {
      throw error; // Re-throw to let the form handle the error
    }
  };

  const handleDelete = async (transaction: Transaction) => {
    setDeletingTransaction(transaction);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!deletingTransaction) return;

    try {
      const response = await fetch(`/api/transactions/${deletingTransaction._id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete transaction');
      }

      toast({
        title: "Success",
        description: "Transaction deleted successfully",
      });

      setIsDeleteDialogOpen(false);
      setDeletingTransaction(null);
      onTransactionChange();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete transaction",
        variant: "destructive",
      });
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const sortedTransactions = [...transactions].sort((a, b) => 
    new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Transactions</CardTitle>
      </CardHeader>
      <CardContent>
        {sortedTransactions.length === 0 ? (
          <p className="text-gray-500 text-center py-8">No transactions found</p>
        ) : (
          <div className="space-y-2">
            {sortedTransactions.map((transaction) => (
              <div
                key={transaction._id?.toString()}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{transaction.description}</span>
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      transaction.type === 'income' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {transaction.type}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <span>{format(new Date(transaction.date), 'MMM dd, yyyy')}</span>
                    {transaction.category && (
                      <>
                        <span>•</span>
                        <div className="flex items-center gap-1">
                          <span>{getCategoryInfo(transaction.category)?.icon || '📝'}</span>
                          <span>{transaction.category}</span>
                        </div>
                      </>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`font-semibold ${
                    transaction.type === 'income' ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {transaction.type === 'income' ? '+' : '-'}{formatCurrency(transaction.amount)}
                  </span>
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEdit(transaction)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(transaction)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Transaction</DialogTitle>
            </DialogHeader>
            {editingTransaction && (
              <TransactionForm
                transaction={editingTransaction}
                onSubmit={handleEditSubmit}
                onCancel={() => {
                  setIsEditDialogOpen(false);
                  setEditingTransaction(null);
                }}
              />
            )}
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Delete Transaction</DialogTitle>
              <DialogDescription>
                Are you sure you want to delete this transaction? This action cannot be undone.
              </DialogDescription>
            </DialogHeader>
            {deletingTransaction && (
              <div className="py-4">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="font-medium">{deletingTransaction.description}</p>
                  <p className="text-sm text-gray-600">
                    {formatCurrency(deletingTransaction.amount)} • {format(new Date(deletingTransaction.date), 'MMM dd, yyyy')}
                  </p>
                </div>
              </div>
            )}
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => {
                  setIsDeleteDialogOpen(false);
                  setDeletingTransaction(null);
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
      </CardContent>
    </Card>
  );
}
