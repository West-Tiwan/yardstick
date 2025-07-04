import { ObjectId } from 'mongodb';
import { Transaction } from '@/types/transaction';
import { getTransactionsCollection } from './mongodb';

// Fallback in-memory storage
const fallbackTransactions: Transaction[] = [
  {
    _id: '1',
    amount: 50.00,
    date: '2025-01-01',
    description: 'Coffee and breakfast',
    type: 'expense',
    category: 'Food & Dining',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    _id: '2',
    amount: 2500.00,
    date: '2025-01-01',
    description: 'January salary',
    type: 'income',
    category: 'Salary',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    _id: '3',
    amount: 120.00,
    date: '2025-01-02',
    description: 'Grocery shopping',
    type: 'expense',
    category: 'Food & Dining',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    _id: '4',
    amount: 45.00,
    date: '2025-01-03',
    description: 'Gas station',
    type: 'expense',
    category: 'Transportation',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    _id: '5',
    amount: 800.00,
    date: '2025-01-05',
    description: 'Freelance project',
    type: 'income',
    category: 'Freelance',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

let useMongoFallback = false;
let sampleDataInitialized = false;

// Test MongoDB connection
async function testMongoConnection(): Promise<boolean> {
  try {
    const collection = await getTransactionsCollection();
    await collection.findOne({});
    return true;
  } catch (error) {
    console.warn('MongoDB connection failed, using in-memory storage:', error instanceof Error ? error.message : error);
    useMongoFallback = true;
    return false;
  }
}

export const transactionStore = {
  async getAll(): Promise<Transaction[]> {
    // Test connection first
    const mongoWorking = await testMongoConnection();
    
    if (!mongoWorking || useMongoFallback) {
      return [...fallbackTransactions];
    }

    try {
      const collection = await getTransactionsCollection();
      const transactions = await collection.find({}).sort({ createdAt: -1 }).toArray();
      
      // Convert MongoDB _id to string
      return transactions.map(transaction => ({
        ...transaction,
        _id: transaction._id?.toString(),
      }));
    } catch (error) {
      console.error('Error fetching transactions from MongoDB:', error);
      useMongoFallback = true;
      return [...fallbackTransactions];
    }
  },
  
  async getById(id: string): Promise<Transaction | null> {
    if (useMongoFallback) {
      return fallbackTransactions.find(t => t._id === id) || null;
    }

    try {
      if (!ObjectId.isValid(id)) {
        return fallbackTransactions.find(t => t._id === id) || null;
      }
      
      const collection = await getTransactionsCollection();
      const transaction = await collection.findOne({ _id: new ObjectId(id) });
      
      if (!transaction) {
        return null;
      }
      
      return {
        ...transaction,
        _id: transaction._id?.toString(),
      };
    } catch (error) {
      console.error('Error fetching transaction by ID:', error);
      useMongoFallback = true;
      return fallbackTransactions.find(t => t._id === id) || null;
    }
  },
  
  async create(transaction: Omit<Transaction, '_id' | 'createdAt' | 'updatedAt'>): Promise<Transaction> {
    const now = new Date();
    
    if (useMongoFallback) {
      const newTransaction: Transaction = {
        ...transaction,
        _id: Date.now().toString(),
        createdAt: now,
        updatedAt: now,
      };
      fallbackTransactions.push(newTransaction);
      return newTransaction;
    }

    try {
      const collection = await getTransactionsCollection();
      
      const newTransaction = {
        ...transaction,
        createdAt: now,
        updatedAt: now,
      };
      
      const result = await collection.insertOne(newTransaction);
      
      return {
        ...newTransaction,
        _id: result.insertedId.toString(),
      };
    } catch (error) {
      console.error('Error creating transaction:', error);
      useMongoFallback = true;
      
      // Fallback to in-memory creation
      const newTransaction: Transaction = {
        ...transaction,
        _id: Date.now().toString(),
        createdAt: now,
        updatedAt: now,
      };
      fallbackTransactions.push(newTransaction);
      return newTransaction;
    }
  },
  
  async update(id: string, updates: Partial<Transaction>): Promise<Transaction | null> {
    if (useMongoFallback) {
      const index = fallbackTransactions.findIndex(t => t._id === id);
      if (index === -1) return null;
      
      fallbackTransactions[index] = {
        ...fallbackTransactions[index],
        ...updates,
        updatedAt: new Date(),
      };
      return fallbackTransactions[index];
    }

    try {
      if (!ObjectId.isValid(id)) {
        // Try fallback for string IDs
        const index = fallbackTransactions.findIndex(t => t._id === id);
        if (index === -1) return null;
        
        fallbackTransactions[index] = {
          ...fallbackTransactions[index],
          ...updates,
          updatedAt: new Date(),
        };
        return fallbackTransactions[index];
      }
      
      const collection = await getTransactionsCollection();
      
      // Remove _id from updates and ensure correct types
      const { _id, ...cleanUpdates } = updates;
      const updateData = {
        ...cleanUpdates,
        updatedAt: new Date(),
      };
      
      const result = await collection.findOneAndUpdate(
        { _id: new ObjectId(id) },
        { $set: updateData },
        { returnDocument: 'after' }
      );
      
      if (!result) {
        return null;
      }
      
      return {
        ...result,
        _id: result._id?.toString(),
      };
    } catch (error) {
      console.error('Error updating transaction:', error);
      useMongoFallback = true;
      
      // Fallback to in-memory update
      const index = fallbackTransactions.findIndex(t => t._id === id);
      if (index === -1) return null;
      
      fallbackTransactions[index] = {
        ...fallbackTransactions[index],
        ...updates,
        updatedAt: new Date(),
      };
      return fallbackTransactions[index];
    }
  },
  
  async delete(id: string): Promise<boolean> {
    if (useMongoFallback) {
      const index = fallbackTransactions.findIndex(t => t._id === id);
      if (index === -1) return false;
      
      fallbackTransactions.splice(index, 1);
      return true;
    }

    try {
      if (!ObjectId.isValid(id)) {
        // Try fallback for string IDs
        const index = fallbackTransactions.findIndex(t => t._id === id);
        if (index === -1) return false;
        
        fallbackTransactions.splice(index, 1);
        return true;
      }
      
      const collection = await getTransactionsCollection();
      const result = await collection.deleteOne({ _id: new ObjectId(id) });
      
      return result.deletedCount === 1;
    } catch (error) {
      console.error('Error deleting transaction:', error);
      useMongoFallback = true;
      
      // Fallback to in-memory delete
      const index = fallbackTransactions.findIndex(t => t._id === id);
      if (index === -1) return false;
      
      fallbackTransactions.splice(index, 1);
      return true;
    }
  },

  // Initialize with sample data if the collection is empty
  async initializeSampleData(): Promise<void> {
    if (useMongoFallback || sampleDataInitialized) {
      return; // Skip if using fallback or already initialized
    }

    try {
      const collection = await getTransactionsCollection();
      const count = await collection.countDocuments();
      
      if (count === 0) {
        const sampleTransactions = [
          {
            amount: 50.00,
            date: '2025-01-01',
            description: 'Coffee and breakfast',
            type: 'expense' as const,
            category: 'Food & Dining',
            createdAt: new Date(),
            updatedAt: new Date(),
          },
          {
            amount: 2500.00,
            date: '2025-01-01',
            description: 'January salary',
            type: 'income' as const,
            category: 'Salary',
            createdAt: new Date(),
            updatedAt: new Date(),
          },
          {
            amount: 120.00,
            date: '2025-01-02',
            description: 'Grocery shopping',
            type: 'expense' as const,
            category: 'Food & Dining',
            createdAt: new Date(),
            updatedAt: new Date(),
          },
        ];
        
        await collection.insertMany(sampleTransactions);
        console.log('Sample transactions inserted into MongoDB');
      }
      
      sampleDataInitialized = true;
    } catch (error) {
      console.error('Error initializing sample data:', error);
      useMongoFallback = true;
      console.log('Switched to in-memory storage with sample data');
    }
  },
};
