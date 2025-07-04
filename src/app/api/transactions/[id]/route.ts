import { NextRequest, NextResponse } from 'next/server';
import { transactionStore } from '@/lib/data-store';
import { Transaction } from '@/types/transaction';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const transaction = await transactionStore.getById(id);
    
    if (!transaction) {
      return NextResponse.json(
        { error: 'Transaction not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(transaction);
  } catch (error) {
    console.error('Error fetching transaction:', error);
    return NextResponse.json(
      { error: 'Failed to fetch transaction' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    
    // Validate input
    const { amount, type } = body;
    if (amount && (typeof amount !== 'number' || amount <= 0)) {
      return NextResponse.json(
        { error: 'Amount must be a positive number' },
        { status: 400 }
      );
    }

    if (type && !['income', 'expense'].includes(type)) {
      return NextResponse.json(
        { error: 'Type must be either income or expense' },
        { status: 400 }
      );
    }

    // Build updates object
    const updates: Partial<Transaction> = {};
    if (amount) updates.amount = amount;
    if (body.date) updates.date = body.date;
    if (body.description) updates.description = body.description.trim();
    if (type) updates.type = type;
    if (body.category !== undefined) updates.category = body.category;

    const updatedTransaction = await transactionStore.update(id, updates);

    if (!updatedTransaction) {
      return NextResponse.json(
        { error: 'Transaction not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(updatedTransaction);
  } catch (error) {
    console.error('Error updating transaction:', error);
    return NextResponse.json(
      { error: 'Failed to update transaction' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const deleted = await transactionStore.delete(id);

    if (!deleted) {
      return NextResponse.json(
        { error: 'Transaction not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ message: 'Transaction deleted successfully' });
  } catch (error) {
    console.error('Error deleting transaction:', error);
    return NextResponse.json(
      { error: 'Failed to delete transaction' },
      { status: 500 }
    );
  }
}
