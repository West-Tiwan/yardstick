// Test MongoDB connection with different hostnames
const { MongoClient } = require('mongodb');

const testConnections = [
  'mongodb+srv://yardstick:yardstick@cluster0.mongodb.net/finance-tracker?retryWrites=true&w=majority',
  'mongodb+srv://yardstick:yardstick@cluster0.jqsms.mongodb.net/finance-tracker?retryWrites=true&w=majority',
  'mongodb+srv://yardstick:yardstick@cluster0.jqsms1.mongodb.net/finance-tracker?retryWrites=true&w=majority',
  'mongodb+srv://yardstick:yardstick@cluster0.jqsms0.mongodb.net/finance-tracker?retryWrites=true&w=majority'
];

async function testConnection(uri, index) {
  console.log(`\nTesting connection ${index + 1}: ${uri.replace(/yardstick:yardstick/, 'username:password')}`);
  
  try {
    const client = new MongoClient(uri, {
      serverSelectionTimeoutMS: 5000,
      connectTimeoutMS: 5000,
    });
    
    await client.connect();
    console.log(`✅ Connection ${index + 1} SUCCESS!`);
    await client.close();
    return uri;
  } catch (error) {
    console.log(`❌ Connection ${index + 1} FAILED: ${error.message}`);
    return null;
  }
}

async function testAllConnections() {
  console.log('Testing MongoDB Atlas connections...\n');
  
  for (let i = 0; i < testConnections.length; i++) {
    const result = await testConnection(testConnections[i], i);
    if (result) {
      console.log(`\n🎉 WORKING CONNECTION FOUND!`);
      console.log(`Use this in your .env.local:`);
      console.log(`MONGODB_URI="${result}"`);
      return;
    }
  }
  
  console.log('\n❌ No working connections found.');
  console.log('Please check your MongoDB Atlas cluster hostname and credentials.');
}

testAllConnections().catch(console.error);
