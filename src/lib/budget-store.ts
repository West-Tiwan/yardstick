import { ObjectId } from 'mongodb';
import { Budget } from '@/types/budget';
import { getBudgetsCollection } from './mongodb';

// Fallback in-memory storage
const fallbackBudgets: Budget[] = [];

let useMongoFallback = false;
let budgetDataInitialized = false;

// Test MongoDB connection
async function testMongoConnection(): Promise<boolean> {
  try {
    const collection = await getBudgetsCollection();
    await collection.findOne({});
    return true;
  } catch (error) {
    console.warn('MongoDB connection failed for budgets, using in-memory storage:', error instanceof Error ? error.message : error);
    useMongoFallback = true;
    return false;
  }
}

export const budgetStore = {
  async getAll(): Promise<Budget[]> {
    // Test connection first
    const mongoWorking = await testMongoConnection();
    
    if (!mongoWorking || useMongoFallback) {
      return [...fallbackBudgets];
    }

    try {
      const collection = await getBudgetsCollection();
      const budgets = await collection.find({}).sort({ month: -1, category: 1 }).toArray();
      
      // Convert MongoDB _id to string
      return budgets.map((budget: any) => ({
        ...budget,
        _id: budget._id?.toString(),
      }));
    } catch (error) {
      console.error('Error fetching budgets from MongoDB:', error);
      useMongoFallback = true;
      return [...fallbackBudgets];
    }
  },
  
  async getByMonth(month: string): Promise<Budget[]> {
    const budgets = await this.getAll();
    return budgets.filter(budget => budget.month === month);
  },
  
  async getById(id: string): Promise<Budget | null> {
    if (useMongoFallback) {
      return fallbackBudgets.find(b => b._id === id) || null;
    }

    try {
      if (!ObjectId.isValid(id)) {
        return fallbackBudgets.find(b => b._id === id) || null;
      }
      
      const collection = await getBudgetsCollection();
      const budget = await collection.findOne({ _id: new ObjectId(id) });
      
      if (!budget) {
        return null;
      }
      
      return {
        ...budget,
        _id: budget._id?.toString(),
      };
    } catch (error) {
      console.error('Error fetching budget by ID:', error);
      useMongoFallback = true;
      return fallbackBudgets.find(b => b._id === id) || null;
    }
  },
  
  async create(budget: Omit<Budget, '_id' | 'createdAt' | 'updatedAt'>): Promise<Budget> {
    const now = new Date();
    
    if (useMongoFallback) {
      const newBudget: Budget = {
        ...budget,
        _id: Date.now().toString(),
        createdAt: now,
        updatedAt: now,
      };
      fallbackBudgets.push(newBudget);
      return newBudget;
    }

    try {
      const collection = await getBudgetsCollection();
      
      const newBudget = {
        ...budget,
        createdAt: now,
        updatedAt: now,
      };
      
      const result = await collection.insertOne(newBudget);
      
      return {
        ...newBudget,
        _id: result.insertedId.toString(),
      };
    } catch (error) {
      console.error('Error creating budget:', error);
      useMongoFallback = true;
      
      // Fallback to in-memory creation
      const newBudget: Budget = {
        ...budget,
        _id: Date.now().toString(),
        createdAt: now,
        updatedAt: now,
      };
      fallbackBudgets.push(newBudget);
      return newBudget;
    }
  },
  
  async update(id: string, updates: Partial<Budget>): Promise<Budget | null> {
    if (useMongoFallback) {
      const index = fallbackBudgets.findIndex(b => b._id === id);
      if (index === -1) return null;
      
      fallbackBudgets[index] = {
        ...fallbackBudgets[index],
        ...updates,
        updatedAt: new Date(),
      };
      return fallbackBudgets[index];
    }

    try {
      if (!ObjectId.isValid(id)) {
        // Try fallback for string IDs
        const index = fallbackBudgets.findIndex(b => b._id === id);
        if (index === -1) return null;
        
        fallbackBudgets[index] = {
          ...fallbackBudgets[index],
          ...updates,
          updatedAt: new Date(),
        };
        return fallbackBudgets[index];
      }
      
      const collection = await getBudgetsCollection();
      
      // Remove _id from updates
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
      console.error('Error updating budget:', error);
      useMongoFallback = true;
      
      // Fallback to in-memory update
      const index = fallbackBudgets.findIndex(b => b._id === id);
      if (index === -1) return null;
      
      fallbackBudgets[index] = {
        ...fallbackBudgets[index],
        ...updates,
        updatedAt: new Date(),
      };
      return fallbackBudgets[index];
    }
  },
  
  async delete(id: string): Promise<boolean> {
    if (useMongoFallback) {
      const index = fallbackBudgets.findIndex(b => b._id === id);
      if (index === -1) return false;
      
      fallbackBudgets.splice(index, 1);
      return true;
    }

    try {
      if (!ObjectId.isValid(id)) {
        // Try fallback for string IDs
        const index = fallbackBudgets.findIndex(b => b._id === id);
        if (index === -1) return false;
        
        fallbackBudgets.splice(index, 1);
        return true;
      }
      
      const collection = await getBudgetsCollection();
      const result = await collection.deleteOne({ _id: new ObjectId(id) });
      
      return result.deletedCount === 1;
    } catch (error) {
      console.error('Error deleting budget:', error);
      useMongoFallback = true;
      
      // Fallback to in-memory delete
      const index = fallbackBudgets.findIndex(b => b._id === id);
      if (index === -1) return false;
      
      fallbackBudgets.splice(index, 1);
      return true;
    }
  },
};
