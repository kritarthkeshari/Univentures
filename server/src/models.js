import mongoose from 'mongoose';

const { Schema, model } = mongoose;

const commentSchema = new Schema(
  {
    id: { type: String, required: true },
    author: { type: String, required: true },
    authorId: { type: String, default: null },
    text: { type: String, required: true },
    date: { type: String, required: true },
  },
  { _id: false }
);

const founderSchema = new Schema(
  {
    name: { type: String, required: true },
    college: { type: String, default: '' },
    role: { type: String, default: '' },
  },
  { _id: false }
);

const userSchema = new Schema(
  {
    _id: { type: String },
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    passwordHash: { type: String, required: true },
    role: { type: String, default: 'Entrepreneur' },
    userType: { type: String, default: 'student' },
    college: { type: String, default: '' },
    bio: { type: String, default: '' },
    firm: { type: String, default: '' },
    investmentRange: { type: String, default: '' },
    interests: { type: [String], default: [] },
    github: { type: String, default: '' },
    linkedin: { type: String, default: '' },
    twitter: { type: String, default: '' },
  },
  { timestamps: true }
);

const startupSchema = new Schema(
  {
    _id: { type: String },
    ownerId: { type: String, default: null },
    title: { type: String, required: true },
    tagline: { type: String, default: '' },
    domain: { type: String, default: '' },
    tags: { type: [String], default: [] },
    problem: { type: String, default: '' },
    solution: { type: String, default: '' },
    market: { type: String, default: '' },
    traction: { type: String, default: '' },
    fundingAsk: { type: Number, default: 0, min: 0 },
    fundingType: { type: String, default: 'Equity' },
    marketSize: { type: String, default: '' },
    revenueModel: { type: String, default: 'Other' },
    votes: { type: Number, default: 0 },
    views: { type: Number, default: 0 },
    saves: { type: Number, default: 0 },
    comments: { type: [commentSchema], default: [] },
    rolesNeeded: { type: [String], default: [] },
    founders: { type: [founderSchema], default: [] },
    contactEmail: { type: String, default: '' },
    demoVideo: { type: String, default: '' },
    postedAt: { type: String, required: true },
    isTrending: { type: Boolean, default: false },
    voters: { type: [String], default: [] },
    savers: { type: [String], default: [] },
  },
  { timestamps: false }
);

const requestSchema = new Schema(
  {
    _id: { type: String },
    personName: { type: String, required: true },
    role: { type: String, default: '' },
    pitchTitle: { type: String, default: '' },
    pitchId: { type: String, default: null },
    fromUserId: { type: String, default: null },
    toOwnerId: { type: String, default: null },
    status: {
      type: String,
      enum: ['pending', 'accepted', 'declined'],
      default: 'pending',
    },
    date: { type: String, required: true },
  },
  { timestamps: false }
);

const activitySchema = new Schema(
  {
    _id: { type: String },
    type: { type: String, default: '' },
    text: { type: String, default: '' },
    time: { type: String, default: '' },
    icon: { type: String, default: '' },
    userId: { type: String, default: null },
  },
  { timestamps: false }
);

startupSchema.index({ domain: 1, postedAt: -1 });
startupSchema.index({ votes: -1 });
startupSchema.index({ tags: 1 });
requestSchema.index({ toOwnerId: 1, date: -1 });

export const User = model('User', userSchema);
export const Startup = model('Startup', startupSchema);
export const Request = model('Request', requestSchema);
export const Activity = model('Activity', activitySchema);