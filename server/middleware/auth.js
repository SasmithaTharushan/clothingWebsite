import { verifyToken } from '../utils/auth.js';

function readUser(req) {
  if (!req.cookies?.token) return null;
  try {
    return verifyToken(req.cookies.token);
  } catch {
    return null;
  }
}

export function authUser(req, res, next) {
  const d = readUser(req);
  if (!d?.id) return res.status(401).json({ success: false, message: 'Please log in' });
  req.userId = d.id;
  req.role = d.role;
  next();
}

export function authAdmin(req, res, next) {
  const d = readUser(req);
  if (!d?.id || d.role !== 'admin') return res.status(401).json({ success: false, message: 'Admin access required' });
  req.userId = d.id;
  req.role = d.role;
  next();
}

export const peekUser = readUser;
