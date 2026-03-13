import * as mongoose from 'mongoose';
import * as bcrypt from 'bcryptjs';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const MONGO_URI = process.env.MONGO_URI;
const NEW_PASSWORD = 'Customer123!';

if (!MONGO_URI) {
  console.error('Error: MONGO_URI not found in .env');
  process.exit(1);
}

// Define User Schema (minimal for script)
const UserSchema = new mongoose.Schema({
  role: String,
  password: { type: String, required: true },
});

const User = mongoose.model('User', UserSchema);

async function updateCustomerPasswords() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGO_URI);
    console.log('Connected successfully.');

    // Find all users with role CUSTOMER
    const customers = await User.find({ role: 'CUSTOMER' });
    console.log(`Found ${customers.length} accounts with role CUSTOMER.`);

    if (customers.length === 0) {
      console.log('No customer accounts to update.');
      return;
    }

    // Hash the new password
    console.log('Hashing new password...');
    const hashedPassword = await bcrypt.hash(NEW_PASSWORD, 10);

    // Update all customer passwords
    console.log(`Updating ${customers.length} passwords...`);
    const result = await User.updateMany(
      { role: 'CUSTOMER' },
      { $set: { password: hashedPassword } }
    );

    console.log('Success!');
    console.log(`Matched: ${result.matchedCount}`);
    console.log(`Modified: ${result.modifiedCount}`);

  } catch (error) {
    console.error('Error during update:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB.');
  }
}

updateCustomerPasswords();
