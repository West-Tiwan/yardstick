import { NextRequest, NextResponse } from 'next/server';
import { categoryStore } from '@/lib/category-store';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type') as 'income' | 'expense' | null;
    
    const categories = type 
      ? await categoryStore.getByType(type)
      : await categoryStore.getAll();
    
    return NextResponse.json(categories);
  } catch (error) {
    console.error('Error fetching categories:', error);
    return NextResponse.json(
      { error: 'Failed to fetch categories' },
      { status: 500 }
    );
  }
}
