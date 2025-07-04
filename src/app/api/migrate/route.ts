import { NextResponse } from 'next/server';
import { migrateTransactionsWithCategories } from '@/lib/migrate-transactions';

export async function POST() {
  try {
    const result = await migrateTransactionsWithCategories();
    
    return result.success 
      ? NextResponse.json({
          success: true,
          message: `Successfully updated ${result.updatedCount} transactions with categories`,
          updatedCount: result.updatedCount,
        })
      : NextResponse.json({
          success: false,
          error: result.error,
        }, { status: 500 });
  } catch (error) {
    console.error('Migration API error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    }, { status: 500 });
  }
}
