// ========================================
// index.js — Express API server for UniVenture
// ========================================

import express from 'express';
import cors from 'cors';
import { config } from './config.js';
import { signToken, requireAuth, optionalAuth } from './auth.js';
import { requestLogger } from './logger.js';
import * as db from './db.js';

const app = express();

app.use(requestLogger);                 
app.use(cors({ origin: config.clientOrigins, credentials: true }));
app.use(express.json({ limit: '1mb' }));

// Small helpers to keep route bodies tidy.
const ok = (res, data, status = 200) => res.status(status).json(data);
const fail = (res, status, message) => res.status(status).json({ error: message });
// Wrap async handlers so rejected promises reach the error middleware.
const wrap = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);

// ---------- Health ----------
app.get('/api/health', (_req, res) => ok(res, { status: 'ok', time: new Date().toISOString() }));

// ========================================
// Auth
// ========================================

app.post('/api/auth/signup', wrap(async (req, res) => {
  const { name, email, password } = req.body || {};
  const userType = req.body?.userType || req.body?.role || 'student';
  if (!name?.trim() || !email?.trim() || !password?.trim()) {
    return fail(res, 400, 'Name, email and password are required');
  }
  if (password.length < 6) return fail(res, 400, 'Password must be at least 6 characters');
  if (await db.findUserByEmail(email)) return fail(res, 409, 'An account with this email already exists');

  const isInvestor = userType === 'investor';
  const row = await db.createUser({
    name: name.trim(),
    email: email.trim().toLowerCase(),
    password,
    role: isInvestor ? 'Investor' : 'Entrepreneur',
    userType: isInvestor ? 'investor' : 'student',
    college: req.body.college,
    bio: req.body.bio || (isInvestor
      ? 'Looking for the next big idea to invest in.'
      : 'Aspiring entrepreneur ready to build something amazing.'),
    firm: req.body.firm,
    investmentRange: req.body.investmentRange,
    interests: Array.isArray(req.body.interests) ? req.body.interests : [],
  });

  const user = await db.publicUser(row);
  ok(res, { token: signToken(row), user }, 201);
}));

app.post('/api/auth/login', wrap(async (req, res) => {
  const { email, password } = req.body || {};
  if (!email?.trim() || !password?.trim()) return fail(res, 400, 'Email and password are required');
  const row = await db.findUserByEmail(email.trim().toLowerCase());
  if (!row || !db.verifyPassword(row, password)) {
    return fail(res, 401, 'Invalid email or password');
  }
  ok(res, { token: signToken(row), user: await db.publicUser(row) });
}));

app.get('/api/auth/me', requireAuth, wrap(async (req, res) => {
  ok(res, { user: await db.publicUser(req.user) });
}));

// ========================================
// Users
// ========================================

app.get('/api/users/:id', wrap(async (req, res) => {
  const row = await db.findUserById(req.params.id);
  if (!row) return fail(res, 404, 'User not found');
  ok(res, { user: await db.publicUser(row) });
}));

// ========================================
// Startups
// ========================================

// Filter + sort + paginate + project over the startups collection.
// Query params: domain, domains, tags, tagsMatch, role, minVotes, maxVotes,
// minFunding, maxFunding, trending, founderCollege, founderRole, q,
// sort, order, fields, page, limit. (See server/QUERIES.md for examples.)
app.get('/api/startups', optionalAuth, wrap(async (req, res) => {
  const { items, total, page, pages, limit, hasNext } = await db.queryStartups(req.userId, req.query);
  ok(res, { startups: items, total, page, pages, limit, hasNext });
}));

app.get('/api/startups/:id', optionalAuth, wrap(async (req, res) => {
  await db.incrementViews(req.params.id);
  const startup = await db.getStartup(req.params.id, req.userId);
  if (!startup) return fail(res, 404, 'Startup not found');
  ok(res, { startup });
}));

app.post('/api/startups', requireAuth, wrap(async (req, res) => {
  const b = req.body || {};
  if (!b.title?.trim() || !b.tagline?.trim() || !b.domain || !b.problem?.trim() || !b.solution?.trim()) {
    return fail(res, 400, 'Title, tagline, domain, problem and solution are required');
  }
  // Default the founder to the submitting user when none supplied.
  const founders = Array.isArray(b.founders) && b.founders.length
    ? b.founders
    : [{ name: b.founderName || req.user.name, college: b.college || req.user.college, role: b.founderRole || 'CEO' }];

  const startup = await db.createStartup(
    {
      title: b.title.trim(),
      tagline: b.tagline.trim(),
      domain: b.domain,
      tags: Array.isArray(b.tags) ? b.tags : [],
      problem: b.problem,
      solution: b.solution,
      market: b.market,
      traction: b.traction,
      fundingAsk: b.fundingAsk,
      fundingType: b.fundingType,
      marketSize: b.marketSize,
      revenueModel: b.revenueModel,
      rolesNeeded: Array.isArray(b.rolesNeeded) ? b.rolesNeeded : [],
      founders,
      contactEmail: b.contactEmail || req.user.email,
      demoVideo: b.demoVideo,
    },
    req.userId
  );
  ok(res, { startup }, 201);
}));

app.delete('/api/startups/:id', requireAuth, wrap(async (req, res) => {
  const result = await db.deleteStartup(req.params.id, req.userId);
  if (!result.ok) {
    return fail(res, result.status, result.status === 404 ? 'Startup not found' : 'You cannot delete this startup');
  }
  ok(res, { ok: true });
}));

app.post('/api/startups/:id/vote', requireAuth, wrap(async (req, res) => {
  const result = await db.toggleVote(req.params.id, req.userId);
  if (!result) return fail(res, 404, 'Startup not found');
  ok(res, result);
}));

app.post('/api/startups/:id/save', requireAuth, wrap(async (req, res) => {
  const result = await db.toggleSave(req.params.id, req.userId);
  if (!result) return fail(res, 404, 'Startup not found');
  ok(res, result);
}));

app.post('/api/startups/:id/comments', requireAuth, wrap(async (req, res) => {
  const text = (req.body?.text || '').trim();
  if (!text) return fail(res, 400, 'Comment text is required');
  const result = await db.addComment(req.params.id, { author: req.user.name, authorId: req.userId, text });
  if (!result) return fail(res, 404, 'Startup not found');
  ok(res, result, 201);
}));

// Apply to a role on a startup → creates a collaboration request.
app.post('/api/startups/:id/apply', requireAuth, wrap(async (req, res) => {
  const startup = await db.getStartup(req.params.id, req.userId);
  if (!startup) return fail(res, 404, 'Startup not found');
  const role = (req.body?.role || '').trim();
  if (!role) return fail(res, 400, 'Role is required');
  const request = await db.createRequest({
    personName: req.user.name,
    role,
    pitchTitle: startup.title,
    pitchId: startup.id,
    fromUserId: req.userId,
    toOwnerId: startup.ownerId,
  });
  ok(res, { request }, 201);
}));

// ========================================
// Collaboration requests
// ========================================

app.get('/api/requests', requireAuth, wrap(async (req, res) => {
  ok(res, { requests: await db.listRequests(req.userId) });
}));

app.patch('/api/requests/:id', requireAuth, wrap(async (req, res) => {
  const status = req.body?.status;
  if (!['pending', 'accepted', 'declined'].includes(status)) {
    return fail(res, 400, 'status must be one of: pending, accepted, declined');
  }
  const request = await db.updateRequestStatus(req.params.id, status);
  if (!request) return fail(res, 404, 'Request not found');
  ok(res, { request });
}));

// ========================================
// Activity feed
// ========================================

app.get('/api/activity', requireAuth, wrap(async (_req, res) => {
  ok(res, { activity: await db.listActivity() });
}));

// ---------- Fallbacks ----------
app.use('/api', (_req, res) => fail(res, 404, 'Not found'));

app.use((err, _req, res, _next) => {
  console.error(err);
  fail(res, 500, 'Internal server error');
});

// Connect to MongoDB first, then start serving.
db.connectDB()
  .then(() => {
    app.listen(config.port, () => {
      console.log(`UniVenture API running on http://localhost:${config.port}`);
      console.log(`Database: MongoDB (${config.dbName})`);
    });
  })
  .catch((err) => {
    console.error('Failed to connect to MongoDB:', err.message);
    process.exit(1);
  });
