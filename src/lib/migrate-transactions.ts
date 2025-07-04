import { transactionStore } from '@/lib/data-store';
import { categoryStore } from '@/lib/category-store';

// Utility to update existing transactions with categories
export async function migrateTransactionsWithCategories() {
  try {
    console.log('Starting transaction migration...');
    
    // Get all transactions and categories
    const [transactions, categories] = await Promise.all([
      transactionStore.getAll(),
      categoryStore.getAll(),
    ]);
    
    console.log(`Found ${transactions.length} transactions to migrate`);
    
    let updatedCount = 0;
    
    for (const transaction of transactions) {
      // Skip if transaction already has a category
      if (transaction.category) {
        continue;
      }
      
      // Assign default categories based on description or type
      let categoryName = '';
      
      if (transaction.type === 'income') {
        if (transaction.description.toLowerCase().includes('salary')) {
          categoryName = 'Salary';
        } else if (transaction.description.toLowerCase().includes('freelance')) {
          categoryName = 'Freelance';
        } else {
          categoryName = 'Other Income';
        }
      } else {
        // Expense categories based on description
        const desc = transaction.description.toLowerCase();
        if (desc.includes('coffee') || desc.includes('breakfast') || desc.includes('grocery') || desc.includes('food')) {
          categoryName = 'Food & Dining';
        } else if (desc.includes('gas') || desc.includes('transport') || desc.includes('uber') || desc.includes('taxi')) {
          categoryName = 'Transportation';
        } else if (desc.includes('shopping') || desc.includes('clothes') || desc.includes('store')) {
          categoryName = 'Shopping';
        } else if (desc.includes('movie') || desc.includes('entertainment') || desc.includes('game')) {
          categoryName = 'Entertainment';
        } else if (desc.includes('rent') || desc.includes('mortgage')) {
          categoryName = 'Rent';
        } else if (desc.includes('electric') || desc.includes('water') || desc.includes('utility')) {
          categoryName = 'Utilities';
        } else {
          categoryName = 'Other Expenses';
        }
      }
      
      // Verify the category exists
      const categoryExists = categories.find(cat => cat.name === categoryName);
      if (!categoryExists) {
        categoryName = transaction.type === 'income' ? 'Other Income' : 'Other Expenses';
      }
      
      // Update the transaction
      if (transaction._id) {
        await transactionStore.update(transaction._id.toString(), {
          category: categoryName
        });
        updatedCount++;
        console.log(`Updated transaction: ${transaction.description} -> ${categoryName}`);
      }
    }
    
    console.log(`Migration completed. Updated ${updatedCount} transactions.`);
    return { success: true, updatedCount };
    
  } catch (error) {
    console.error('Error during migration:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}
