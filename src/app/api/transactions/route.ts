import { NextRequest, NextResponse } from 'next/server';
import { transactionStore } from '@/lib/data-store';

export async function GET() {
  try {
    const transactions = await transactionStore.getAll();
    return NextResponse.json(transactions);
  } catch (error) {
    console.error('Error fetching transactions:', error);
    return NextResponse.json(
      { error: 'Failed to fetch transactions' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate required fields
    const { amount, date, description, type, category } = body;
    if (!amount || !date || !description || !type) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Validate amount
    if (typeof amount !== 'number' || amount <= 0) {
      return NextResponse.json(
        { error: 'Amount must be a positive number' },
        { status: 400 }
      );
    }

    // Validate type
    if (!['income', 'expense'].includes(type)) {
      return NextResponse.json(
        { error: 'Type must be either income or expense' },
        { status: 400 }
      );
    }

    const transaction = await transactionStore.create({
      amount,
      date,
      description: description.trim(),
      type,
      category: category || undefined,
    });

    return NextResponse.json(transaction, { status: 201 });
  } catch (error) {
    console.error('Error creating transaction:', error);
    return NextResponse.json(
      { error: 'Failed to create transaction' },
      { status: 500 }
    );
  }
}
