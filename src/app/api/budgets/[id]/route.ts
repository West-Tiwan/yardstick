import { NextRequest, NextResponse } from 'next/server';
import { budgetStore } from '@/lib/budget-store';

type Params = { params: { id: string } };

export async function GET(request: NextRequest, { params }: Params) {
  try {
    const budget = await budgetStore.getById(params.id);
    
    if (!budget) {
      return NextResponse.json(
        { error: 'Budget not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(budget);
  } catch (error) {
    console.error('Error fetching budget:', error);
    return NextResponse.json(
      { error: 'Failed to fetch budget' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest, { params }: Params) {
  try {
    const updateData = await request.json();
    
    // Validate amount
    if (updateData.amount !== undefined && updateData.amount <= 0) {
      return NextResponse.json(
        { error: 'Amount must be positive' },
        { status: 400 }
      );
    }
    
    const budget = await budgetStore.update(params.id, updateData);
    
    if (!budget) {
      return NextResponse.json(
        { error: 'Budget not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(budget);
  } catch (error) {
    console.error('Error updating budget:', error);
    return NextResponse.json(
      { error: 'Failed to update budget' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest, { params }: Params) {
  try {
    const success = await budgetStore.delete(params.id);
    
    if (!success) {
      return NextResponse.json(
        { error: 'Budget not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({ message: 'Budget deleted successfully' });
  } catch (error) {
    console.error('Error deleting budget:', error);
    return NextResponse.json(
      { error: 'Failed to delete budget' },
      { status: 500 }
    );
  }
}
