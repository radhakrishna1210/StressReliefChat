// set-admin.js
require('dotenv').config();                // load MONGODB_URI from .env
const { connectDB, closeDB, getDB } = require('./config/database');

const emailFromArg = process.argv[2];      // email passed from command line

if (!emailFromArg) {
  console.error('Usage: node set-admin.js user@example.com');
  process.exit(1);
}

async function setAdmin(email) {
  try {
    const db = await connectDB();
    if (!db) {
      console.error('Could not connect to database. Check MONGODB_URI.');
      process.exit(1);
    }

    const users = db.collection('users');

    const result = await users.updateOne(
      { email: email.toLowerCase() },
      { $set: { role: 'admin' } }
    );

    if (result.matchedCount === 0) {
      console.log('No user found with that email:', email);
    } else {
      console.log('User role updated to admin for:', email);
    }
  } catch (err) {
    console.error('Error setting admin role:', err);
  } finally {
    await closeDB();
  }
}

setAdmin(emailFromArg);