// Quick smoke test for Workstream 1 models
import connectToDB from '../src/lib/mongoose';
import User from '../src/models/user.model';
import Streak from '../src/models/streak.model';
import Badge from '../src/models/badge.model';
import UserEvent from '../src/models/userEvent.model';
import LeaderboardSnapshot from '../src/models/leaderboardSnapshot.model';
import EmailLog from '../src/models/emailLog.model';

async function smokeTest() {
  try {
    await connectToDB();
    console.log('✅ MongoDB connected');

    // Test model imports
    console.log('✅ User model imported');
    console.log('✅ Streak model imported');
    console.log('✅ Badge model imported');
    console.log('✅ UserEvent model imported');
    console.log('✅ LeaderboardSnapshot model imported');
    console.log('✅ EmailLog model imported');

    // Test that models have expected schemas
    if (!User.schema) throw new Error('User schema missing');
    if (!Streak.schema) throw new Error('Streak schema missing');
    if (!Badge.schema) throw new Error('Badge schema missing');
    if (!UserEvent.schema) throw new Error('UserEvent schema missing');
    if (!LeaderboardSnapshot.schema) throw new Error('LeaderboardSnapshot schema missing');
    if (!EmailLog.schema) throw new Error('EmailLog schema missing');

    console.log('✅ All schemas are valid');

    console.log('\n✅ All Workstream 1 models are importable and valid!');
    console.log('\nNext steps:');
    console.log('1. Run `npm run dev` to test in development mode');
    console.log('2. Test the event tracking endpoint: POST /api/events/track');
    console.log('3. Verify new model fields work with existing data');
    console.log('4. Set up Customer.io and PostHog environment variables');

    process.exit(0);
  } catch (error) {
    console.error('❌ Smoke test failed:', error);
    process.exit(1);
  }
}

smokeTest();
