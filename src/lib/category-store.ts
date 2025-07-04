import { ObjectId } from 'mongodb';
import { Category, PREDEFINED_CATEGORIES } from '@/types/category';
import { getCategoriesCollection } from './mongodb';

// Fallback in-memory storage
const fallbackCategories: Category[] = PREDEFINED_CATEGORIES.map((cat, index) => ({
  ...cat,
  _id: (index + 1).toString(),
  createdAt: new Date(),
  updatedAt: new Date(),
}));

let useMongoFallback = false;
let categoriesInitialized = false;

// Test MongoDB connection
async function testMongoConnection(): Promise<boolean> {
  try {
    const collection = await getCategoriesCollection();
    await collection.findOne({});
    return true;
  } catch (error) {
    console.warn('MongoDB connection failed for categories, using in-memory storage:', error instanceof Error ? error.message : error);
    useMongoFallback = true;
    return false;
  }
}

// Initialize predefined categories in MongoDB
async function initializePredefinedCategories(): Promise<void> {
  if (categoriesInitialized) {
    return; // Already initialized
  }

  try {
    const collection = await getCategoriesCollection();
    const existingCount = await collection.countDocuments();
    
    if (existingCount === 0) {
      const categoriesWithDates = PREDEFINED_CATEGORIES.map(cat => ({
        ...cat,
        createdAt: new Date(),
        updatedAt: new Date(),
      }));
      
      await collection.insertMany(categoriesWithDates);
      console.log('Predefined categories inserted into MongoDB');
    }
    
    categoriesInitialized = true;
  } catch (error) {
    console.error('Error initializing predefined categories:', error);
    useMongoFallback = true;
  }
}

export const categoryStore = {
  async getAll(): Promise<Category[]> {
    // Test connection first
    const mongoWorking = await testMongoConnection();
    
    if (!mongoWorking || useMongoFallback) {
      return [...fallbackCategories];
    }

    try {
      // Initialize categories if needed
      await initializePredefinedCategories();
      
      const collection = await getCategoriesCollection();
      const categories = await collection.find({}).sort({ name: 1 }).toArray();
      
      // Convert MongoDB _id to string
      return categories.map(category => ({
        ...category,
        _id: category._id?.toString(),
      }));
    } catch (error) {
      console.error('Error fetching categories from MongoDB:', error);
      useMongoFallback = true;
      return [...fallbackCategories];
    }
  },
  
  async getByType(type: 'income' | 'expense'): Promise<Category[]> {
    const categories = await this.getAll();
    return categories.filter(cat => cat.type === type);
  },
  
  async getById(id: string): Promise<Category | null> {
    if (useMongoFallback) {
      return fallbackCategories.find(c => c._id === id) || null;
    }

    try {
      if (!ObjectId.isValid(id)) {
        return fallbackCategories.find(c => c._id === id) || null;
      }
      
      const collection = await getCategoriesCollection();
      const category = await collection.findOne({ _id: new ObjectId(id) });
      
      if (!category) {
        return null;
      }
      
      return {
        ...category,
        _id: category._id?.toString(),
      };
    } catch (error) {
      console.error('Error fetching category by ID:', error);
      useMongoFallback = true;
      return fallbackCategories.find(c => c._id === id) || null;
    }
  },
  
  async getByName(name: string): Promise<Category | null> {
    const categories = await this.getAll();
    return categories.find(cat => cat.name === name) || null;
  },
};
