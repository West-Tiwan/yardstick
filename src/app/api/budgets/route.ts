import { NextRequest, NextResponse } from 'next/server';
import { budgetStore } from '@/lib/budget-store';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const month = searchParams.get('month');
    
    const budgets = month 
      ? await budgetStore.getByMonth(month)
      : await budgetStore.getAll();
    
    return NextResponse.json(budgets);
  } catch (error) {
    console.error('Error fetching budgets:', error);
    return NextResponse.json(
      { error: 'Failed to fetch budgets' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { category, amount, month } = await request.json();
    
    // Validate required fields
    if (!category || !amount || !month) {
      return NextResponse.json(
        { error: 'Missing required fields: category, amount, month' },
        { status: 400 }
      );
    }
    
    // Validate amount
    if (amount <= 0) {
      return NextResponse.json(
        { error: 'Amount must be positive' },
        { status: 400 }
      );
    }
    
    const budget = await budgetStore.create({ category, amount, month });
    return NextResponse.json(budget, { status: 201 });
  } catch (error) {
    console.error('Error creating budget:', error);
    return NextResponse.json(
      { error: 'Failed to create budget' },
      { status: 500 }
    );
  }
}
