// Load the starter catalogue and create the admin account:
//   npm run seed            (skips if products already exist)
//   npm run seed -- --reset (wipes products first)
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { connectDB } from '../config/db.js';
import Product from '../models/Product.js';
import User from '../models/User.js';
import products from './products.js';

await connectDB();

if (process.argv.includes('--reset')) {
  await Product.deleteMany({});
  console.log('Removed existing products');
}

const count = await Product.countDocuments();
if (count > 0) {
  console.log(`Database already has ${count} products. Use "npm run seed -- --reset" to replace them.`);
} else {
  await Product.insertMany(products.map(({ legacyId, ...p }) => p));
  console.log(`Inserted ${products.length} products`);
}

const email = (process.env.ADMIN_EMAIL || '').toLowerCase().trim();
if (email && process.env.ADMIN_PASSWORD) {
  const password = await bcrypt.hash(process.env.ADMIN_PASSWORD, 10);
  await User.findOneAndUpdate(
    { email },
    { email, password, role: 'admin', name: 'Store Admin' },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );
  console.log(`Admin account ready: ${email}`);
} else {
  console.log('ADMIN_EMAIL / ADMIN_PASSWORD not set — skipped creating the admin account');
}

await mongoose.disconnect();
