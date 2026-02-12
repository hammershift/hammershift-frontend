// Direct MongoDB connection test (bypassing Mongoose)
const { MongoClient } = require('mongodb');
require('dotenv').config({ path: '.env.local' });

const uri = process.env.MONGODB_URI;

async function testDirectConnection() {
  console.log('🔍 Testing DIRECT MongoDB Connection...\n');
  console.log('Connection string:', uri?.substring(0, 50) + '...\n');

  const client = new MongoClient(uri, {
    serverSelectionTimeoutMS: 5000, // Shorter timeout
    connectTimeoutMS: 5000,
  });

  try {
    console.log('Attempting to connect...');
    await client.connect();
    console.log('✅ CONNECTED!\n');

    const db = client.db('hammershift');
    const collections = await db.listCollections().toArray();

    console.log('📊 Available collections:');
    collections.forEach(col => console.log(`  - ${col.name}`));

    console.log('\n✅ Database connection works!');
    return true;
  } catch (error) {
    console.error('\n❌ Connection failed:', error.message);

    if (error.message.includes('ENOTFOUND')) {
      console.log('\n🔍 DNS resolution failed - possible causes:');
      console.log('  - Internet connectivity issue');
      console.log('  - DNS blocking MongoDB Atlas domain');
    } else if (error.message.includes('ETIMEDOUT') || error.message.includes('timed out')) {
      console.log('\n🔍 Connection timeout - possible causes:');
      console.log('  - Firewall blocking port 27017');
      console.log('  - VPN blocking MongoDB Atlas');
      console.log('  - ISP blocking MongoDB connections');
      console.log('  - Corporate network restrictions');
    }

    return false;
  } finally {
    await client.close();
  }
}

testDirectConnection();
