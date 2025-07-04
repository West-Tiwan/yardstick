"use client";

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Budget } from '@/types/budget';
import { Category } from '@/types/category';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';

interface BudgetFormProps {
  budget?: Budget;
  onSubmit: (budget: Omit<Budget, '_id' | 'createdAt' | 'updatedAt'>) => void;
  onCancel?: () => void;
}

export function BudgetForm({ budget, onSubmit, onCancel }: BudgetFormProps) {
  const { toast } = useToast();
  const [categories, setCategories] = useState<Category[]>([]);
  const [formData, setFormData] = useState({
    category: budget?.category || '',
    amount: budget?.amount?.toString() || '',
    month: budget?.month || format(new Date(), 'yyyy-MM'),
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Fetch expense categories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch('/api/categories?type=expense');
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

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.category.trim()) {
      newErrors.category = 'Category is required';
    }

    if (!formData.amount.trim()) {
      newErrors.amount = 'Amount is required';
    } else if (isNaN(Number(formData.amount)) || Number(formData.amount) <= 0) {
      newErrors.amount = 'Amount must be a positive number';
    }

    if (!formData.month.trim()) {
      newErrors.month = 'Month is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    setErrors({});

    try {
      onSubmit({
        category: formData.category,
        amount: Number(formData.amount),
        month: formData.month,
      });

      toast({
        title: "Success",
        description: `Budget ${budget ? 'updated' : 'created'} successfully`,
      });

      if (!budget) {
        // Reset form for new budgets
        setFormData({
          category: '',
          amount: '',
          month: format(new Date(), 'yyyy-MM'),
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: `Failed to ${budget ? 'update' : 'create'} budget`,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{budget ? 'Edit Budget' : 'Set Monthly Budget'}</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Select
                value={formData.category}
                onValueChange={(value) => setFormData({ ...formData, category: value })}
              >
                <SelectTrigger className={errors.category ? 'border-red-500' : ''}>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category._id?.toString()} value={category.name}>
                      <span className="flex items-center gap-2">
                        <span>{category.icon}</span>
                        <span>{category.name}</span>
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.category && (
                <p className="text-sm text-red-500">{errors.category}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="amount">Budget Amount</Label>
              <Input
                id="amount"
                type="number"
                step="0.01"
                min="0"
                placeholder="0.00"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                className={errors.amount ? 'border-red-500' : ''}
              />
              {errors.amount && (
                <p className="text-sm text-red-500">{errors.amount}</p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="month">Month</Label>
            <Input
              id="month"
              type="month"
              value={formData.month}
              onChange={(e) => setFormData({ ...formData, month: e.target.value })}
              className={errors.month ? 'border-red-500' : ''}
            />
            {errors.month && (
              <p className="text-sm text-red-500">{errors.month}</p>
            )}
          </div>

          <div className="flex gap-2 pt-4">
            <Button type="submit" disabled={isSubmitting} className="flex-1">
              {isSubmitting ? 'Saving...' : (budget ? 'Update' : 'Set')} Budget
            </Button>
            {onCancel && (
              <Button type="button" variant="outline" onClick={onCancel}>
                Cancel
              </Button>
            )}
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
