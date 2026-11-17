import bcrypt from 'bcryptjs';
import Product from '../models/Product.js';
import User from '../models/User.js';
import products from '../seed/products.js';

/* POST /api/bootstrap
   First-run setup for a fresh deployment: loads the starter catalogue and
   creates the admin account from ADMIN_EMAIL / ADMIN_PASSWORD.

   It disables itself: once an admin exists the endpoint refuses, so it can't
   be replayed to take over the store. It also exposes nothing — it only
   materialises the account the owner already configured in the environment.
   The same job runs locally via `npm run seed`. */
export async function bootstrap(req, res) {
  if (await User.exists({ role: 'admin' })) {
    return res.status(409).json({ success: false, message: 'This store is already set up' });
  }
  if (!process.env.ADMIN_EMAIL || !process.env.ADMIN_PASSWORD) {
    return res.status(500).json({ success: false, message: 'ADMIN_EMAIL and ADMIN_PASSWORD are not set on the server' });
  }

  let inserted = 0;
  if ((await Product.countDocuments()) === 0) {
    // eslint-disable-next-line no-unused-vars
    const rows = products.map(({ legacyId, ...p }) => p);
    await Product.insertMany(rows);
    inserted = rows.length;
  }

  await User.create({
    name: 'Store Admin',
    email: process.env.ADMIN_EMAIL.toLowerCase().trim(),
    password: await bcrypt.hash(process.env.ADMIN_PASSWORD, 10),
    role: 'admin',
  });

  res.status(201).json({
    success: true,
    message: `Store ready — ${inserted} products loaded and the admin account created.`,
  });
}
