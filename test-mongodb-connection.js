const { MongoClient } = require('mongodb');

// Test the correct hostname
const testHosts = [
  'cluster0.r3gttrw.mongodb.net', // Correct hostname from Atlas
];

async function testConnection(host) {
  const uri = `mongodb+srv://yardstick:yardstick@${host}/finance-tracker?retryWrites=true&w=majority`;
  console.log(`\nTesting connection to: ${host}`);
  console.log(`URI: ${uri}`);
  
  try {
    const client = new MongoClient(uri);
    await client.connect();
    
    // Test database access
    const db = client.db('finance-tracker');
    const collections = await db.listCollections().toArray();
    
    console.log(`✅ SUCCESS: Connected to ${host}`);
    console.log(`📁 Found collections:`, collections.map(c => c.name));
    
    // Test if transactions collection exists
    const hasTransactions = collections.find(c => c.name === 'transactions');
    if (hasTransactions) {
      console.log(`✅ Found 'transactions' collection`);
    } else {
      console.log(`⚠️  'transactions' collection not found, but connection works`);
    }
    
    await client.close();
    return true;
  } catch (error) {
    console.log(`❌ FAILED: ${host}`);
    console.log(`Error: ${error.message}`);
    return false;
  }
}

async function runTests() {
  console.log('🔍 Testing MongoDB Atlas connection with different hostnames...\n');
  
  for (const host of testHosts) {
    const success = await testConnection(host);
    if (success) {
      console.log(`\n🎉 FOUND WORKING CONNECTION: ${host}`);
      console.log(`\nUpdate your .env.local with:`);
      console.log(`MONGODB_URI="mongodb+srv://yardstick:yardstick@${host}/finance-tracker?retryWrites=true&w=majority"`);
      break;
    }
  }
  
  console.log('\n📝 If none of these work, please:');
  console.log('1. Go to your MongoDB Atlas dashboard');
  console.log('2. Click "Connect" on your cluster');
  console.log('3. Choose "Connect your application"');
  console.log('4. Copy the exact hostname from the connection string');
}

runTests().catch(console.error);
