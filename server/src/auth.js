// ========================================
// auth.js — JWT issuing and auth middleware
// ========================================

import jwt from 'jsonwebtoken';
import { config } from './config.js';
import { findUserById } from './db.js';

export function signToken(user) {
  return jwt.sign({ sub: user._id || user.id }, config.jwtSecret, { expiresIn: config.tokenExpiry });
}

function readToken(req) {
  const header = req.headers.authorization || '';
  if (header.startsWith('Bearer ')) return header.slice(7).trim();
  return null;
}


export function requireAuth(req, res, next) {
  const token = readToken(req);
  if (!token) return res.status(401).json({ error: 'Authentication required' });
  jwt.verify(token, config.jwtSecret, async (err, payload) => {
    if (err) return res.status(401).json({ error: 'Invalid or expired token' });
    try {
      const user = await findUserById(payload.sub);
      if (!user) return res.status(401).json({ error: 'Invalid session' });
      req.user = user;
      req.userId = user._id;
      next();
    } catch (e) {
      next(e);
    }
  });
}


export async function optionalAuth(req, _res, next) {
  const token = readToken(req);
  if (token) {
    try {
      const payload = jwt.verify(token, config.jwtSecret);
      const user = await findUserById(payload.sub);
      if (user) {
        req.user = user;
        req.userId = user._id;
      }
    } catch {
      // Ignore bad tokens for optional routes.
    }
  }
  next();
}
