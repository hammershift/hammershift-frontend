// Quick MongoDB connection and data check
const { MongoClient } = require('mongodb');
require('dotenv').config({ path: '.env.local' });

const uri = process.env.MONGODB_URI;
const dbName = process.env.DB_NAME || 'hammershift';

async function testConnection() {
  console.log('🔍 Testing MongoDB Connection...\n');

  const client = new MongoClient(uri);

  try {
    await client.connect();
    console.log('✅ Connected to MongoDB\n');

    const db = client.db(dbName);

    // Check collections
    console.log('📊 Database Collections:');
    const collections = await db.listCollections().toArray();
    collections.forEach(col => console.log(`  - ${col.name}`));
    console.log('');

    // Check for test user
    console.log('👤 Sample Users:');
    const users = await db.collection('users').find({}).limit(3).toArray();
    users.forEach(user => {
      console.log(`  - ${user.email || user.username || user._id}: Balance = ${user.balance}`);
    });
    console.log('');

    // Check tournaments
    console.log('🏆 Available Tournaments:');
    const tournaments = await db.collection('tournaments').find({ isActive: true }).limit(5).toArray();
    tournaments.forEach(t => {
      console.log(`  - ${t.name}: buyInFee = ${t.buyInFee}, Type = ${t.type}`);
      console.log(`    ID: ${t._id}`);
      console.log(`    Users joined: ${t.users?.length || 0}`);
    });
    console.log('');

    // Check recent transactions
    console.log('💰 Recent Tournament Buy-In Transactions:');
    const transactions = await db.collection('transactions')
      .find({ transactionType: 'tournament buy-in' })
      .sort({ transactionDate: -1 })
      .limit(5)
      .toArray();

    if (transactions.length === 0) {
      console.log('  (No tournament buy-in transactions found yet)');
    } else {
      transactions.forEach(t => {
        console.log(`  - ${new Date(t.transactionDate).toISOString()}: ${t.amount} credits`);
        console.log(`    User: ${t.userID}, Tournament: ${t.tournamentID}`);
      });
    }
    console.log('');

    console.log('✅ Database check complete!\n');
    console.log('🧪 To test Phase 1.1:');
    console.log('  1. Open browser to: http://localhost:3001');
    console.log('  2. Login with a test user');
    console.log('  3. Navigate to a tournament (paid or free)');
    console.log('  4. Submit predictions and observe balance deduction\n');

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await client.close();
  }
}

testConnection();
