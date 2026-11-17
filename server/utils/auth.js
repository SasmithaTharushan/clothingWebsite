import jwt from 'jsonwebtoken';

const WEEK = 7 * 24 * 60 * 60 * 1000;

export function cookieOptions() {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax', // site and API share one origin on Vercel
    maxAge: WEEK,
    path: '/',
  };
}

export function signToken(payload) {
  if (!process.env.JWT_SECRET) throw new Error('JWT_SECRET is not set');
  return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '7d' });
}

export const verifyToken = (token) => jwt.verify(token, process.env.JWT_SECRET);

export const isEmail = (v) => typeof v === 'string' && /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim());

// Returns null when fine, or a message explaining what's missing.
export function passwordProblem(pw) {
  if (typeof pw !== 'string' || pw.length < 8) return 'Password must be at least 8 characters';
  if (!/[A-Za-z]/.test(pw) || !/[0-9]/.test(pw)) return 'Password must contain a letter and a number';
  return null;
}
