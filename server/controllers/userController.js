import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import User from '../models/User.js';
import { cookieOptions, signToken, isEmail, passwordProblem } from '../utils/auth.js';
import { peekUser } from '../middleware/auth.js';

const publicUser = (u) => ({ id: u._id, name: u.name, email: u.email, role: u.role });

// POST /api/auth/register
export async function register(req, res) {
  const { name, email, password } = req.body || {};
  if (!isEmail(email)) return res.status(400).json({ success: false, message: 'Enter a valid email' });
  const problem = passwordProblem(password);
  if (problem) return res.status(400).json({ success: false, message: problem });

  const normalized = email.toLowerCase().trim();
  if (await User.findOne({ email: normalized })) {
    return res.status(409).json({ success: false, message: 'An account with this email already exists' });
  }
  const user = await User.create({
    name: (name || '').trim().slice(0, 80),
    email: normalized,
    password: await bcrypt.hash(password, 10),
  });
  res.cookie('token', signToken({ id: user._id.toString(), role: user.role }), cookieOptions());
  res.status(201).json({ success: true, user: publicUser(user) });
}

// POST /api/auth/login
export async function login(req, res) {
  const { email, password } = req.body || {};
  if (!isEmail(email) || !password) {
    return res.status(400).json({ success: false, message: 'Email and password are required' });
  }
  const user = await User.findOne({ email: email.toLowerCase().trim() });
  // Same message either way, so the form can't be used to discover which emails exist.
  if (!user || !(await bcrypt.compare(password, user.password))) {
    return res.status(401).json({ success: false, message: 'Invalid email or password' });
  }
  res.cookie('token', signToken({ id: user._id.toString(), role: user.role }), cookieOptions());
  res.json({ success: true, user: publicUser(user) });
}

// GET /api/auth/me  — 200 for guests too, so the browser console stays clean
export async function me(req, res) {
  const d = peekUser(req);
  const user = d?.id && (await User.findById(d.id));
  if (!user) return res.json({ success: false, user: null });
  res.json({ success: true, user: publicUser(user) });
}

// POST /api/auth/logout
export async function logout(req, res) {
  const { maxAge, ...opts } = cookieOptions();
  res.clearCookie('token', opts);
  res.json({ success: true, message: 'Logged out' });
}

/* ---------------- Password reset (the OTP screens) ---------------- */

// POST /api/auth/forgot  { email }
export async function forgotPassword(req, res) {
  const { email } = req.body || {};
  if (!isEmail(email)) return res.status(400).json({ success: false, message: 'Enter a valid email' });

  const user = await User.findOne({ email: email.toLowerCase().trim() });
  // Always answer the same way, so this can't reveal who has an account.
  const reply = { success: true, message: 'If that email has an account, a 6-digit code is on its way.' };
  if (!user) return res.json(reply);

  const code = String(crypto.randomInt(0, 1_000_000)).padStart(6, '0');
  user.resetCodeHash = await bcrypt.hash(code, 10);
  user.resetExpires = new Date(Date.now() + 10 * 60 * 1000);
  user.resetAttempts = 0;
  await user.save();

  // No email provider is configured, so in demo mode the code is returned to
  // the caller. Set DEMO_SHOW_OTP=false once real email sending is wired up.
  if (process.env.DEMO_SHOW_OTP !== 'false') reply.demoCode = code;
  res.json(reply);
}

// POST /api/auth/verify-otp  { email, code }
export async function verifyOtp(req, res) {
  const user = await findResettable(req, res);
  if (!user) return;
  res.json({ success: true, message: 'Code accepted' });
}

// POST /api/auth/reset  { email, code, password }
export async function resetPassword(req, res) {
  const problem = passwordProblem(req.body?.password);
  if (problem) return res.status(400).json({ success: false, message: problem });

  const user = await findResettable(req, res);
  if (!user) return;

  user.password = await bcrypt.hash(req.body.password, 10);
  user.resetCodeHash = null;
  user.resetExpires = null;
  user.resetAttempts = 0;
  await user.save();
  res.json({ success: true, message: 'Password updated. You can log in now.' });
}

// Shared check for the two steps above. Responds itself on failure.
async function findResettable(req, res) {
  const { email, code } = req.body || {};
  const user = isEmail(email) ? await User.findOne({ email: email.toLowerCase().trim() }) : null;

  if (!user?.resetCodeHash || !user.resetExpires || user.resetExpires < new Date()) {
    res.status(400).json({ success: false, message: 'That code has expired. Request a new one.' });
    return null;
  }
  if (user.resetAttempts >= 5) {
    res.status(429).json({ success: false, message: 'Too many attempts. Request a new code.' });
    return null;
  }
  if (!(await bcrypt.compare(String(code || ''), user.resetCodeHash))) {
    user.resetAttempts += 1;
    await user.save();
    res.status(400).json({ success: false, message: 'That code is not correct' });
    return null;
  }
  return user;
}

/* ---------------- Cart ---------------- */

// POST /api/cart  { cart: [{ productId, size, quantity }] }
export async function saveCart(req, res) {
  const raw = Array.isArray(req.body?.cart) ? req.body.cart : null;
  if (!raw) return res.status(400).json({ success: false, message: 'Invalid cart' });
  const cart = raw
    .filter((i) => i && i.productId)
    .slice(0, 50)
    .map((i) => ({
      productId: String(i.productId),
      size: String(i.size || ''),
      quantity: Math.min(99, Math.max(1, Math.floor(Number(i.quantity)) || 1)),
    }));
  await User.findByIdAndUpdate(req.userId, { cart });
  res.json({ success: true });
}

// GET /api/cart
export async function getCart(req, res) {
  const user = await User.findById(req.userId);
  res.json({ success: true, cart: user?.cart || [] });
}
