import { MongoClient, Db, Collection, ObjectId } from 'mongodb';
import { Transaction } from '@/types/transaction';
import { Category } from '@/types/category';
import { Budget } from '@/types/budget';

interface MongoTransaction {
  _id?: ObjectId;
  amount: number;
  date: string;
  description: string;
  type: 'income' | 'expense';
  createdAt?: Date;
  updatedAt?: Date;
}

if (!process.env.MONGODB_URI) {
  console.warn('MongoDB URI not found in environment variables, will use fallback storage');
}

if (!process.env.MONGODB_DB_NAME) {
  console.warn('MongoDB database name not found in environment variables, will use fallback storage');
}

const uri = process.env.MONGODB_URI || '';
const dbName = process.env.MONGODB_DB_NAME || 'finance-tracker';

let client: MongoClient;
let clientPromise: Promise<MongoClient> | undefined;

// Only initialize MongoDB client if URI is provided
if (uri) {
  if (process.env.NODE_ENV === 'development') {
    // In development mode, use a global variable so that the value
    // is preserved across module reloads caused by HMR (Hot Module Replacement).
    const globalWithMongo = global as typeof globalThis & {
      _mongoClientPromise?: Promise<MongoClient>;
    };

    if (!globalWithMongo._mongoClientPromise) {
      client = new MongoClient(uri);
      globalWithMongo._mongoClientPromise = client.connect();
    }
    clientPromise = globalWithMongo._mongoClientPromise;
  } else {
    // In production mode, it's best to not use a global variable.
    client = new MongoClient(uri);
    clientPromise = client.connect();
  }
}

// Database and collection helpers
export async function getDatabase(): Promise<Db> {
  if (!clientPromise) {
    throw new Error('MongoDB client not initialized - check environment variables');
  }
  const client = await clientPromise;
  return client.db(dbName);
}

export async function getTransactionsCollection(): Promise<Collection<Transaction>> {
  const db = await getDatabase();
  return db.collection<Transaction>('transactions');
}

export async function getCategoriesCollection(): Promise<Collection<Category>> {
  const db = await getDatabase();
  return db.collection<Category>('categories');
}

export async function getBudgetsCollection(): Promise<Collection<Budget>> {
  const db = await getDatabase();
  return db.collection<Budget>('budgets');
}

// Export a module-scoped MongoClient promise. By doing this in a
// separate module, the client can be shared across functions.
export default clientPromise;
