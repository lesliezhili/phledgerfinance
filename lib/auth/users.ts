// PHLedger Auth — Supabase Auth free tier (50K MAU)
// Admin pre-seeded. Others sign up via /auth/signup
import { createClient } from '@supabase/supabase-js';

const url = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const key = process.env.SUPABASE_SERVICE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const sb = url && key ? createClient(url, key) : null;

export type UserRole = 'admin' | 'customer' | 'trial';
export type Plan = 'free' | 'starter' | 'professional' | 'enterprise';

export interface PHUser {
  id: string;
  email: string;
  name?: string;
  role: UserRole;
  plan: Plan;
  country: 'AU' | 'CA' | 'BOTH';
  created_at: string;
}

// Admin account (pre-registered)
export const ADMIN: PHUser = {
  id: 'admin-001',
  email: 'zhili@phledger.com',
  name: 'Zhi Li',
  role: 'admin',
  plan: 'free',
  country: 'BOTH',
  created_at: '2026-06-02T00:00:00Z'
};

// Simple password hash (bcrypt in production — this is demo-safe)
function simpleHash(pw) {
  let h = 0;
  for (let i = 0; i < pw.length; i++) { h = ((h << 5) - h) + pw.charCodeAt(i); h |= 0; }
  return 'h_' + Math.abs(h).toString(36);
}

// In-memory user store (falls back when no Supabase)
const LOCAL_USERS = new Map();
LOCAL_USERS.set('zhili@phledger.com', { ...ADMIN, pwHash: simpleHash('Lz@77071517') });

// Only PHLedger and SilverConnect get free plan
function isFreeEligible(email) {
  const domains = ['phledger.com', 'silverconnect.com.au', 'silverconnect.ca'];
  const d = email.split('@')[1]?.toLowerCase();
  return domains.includes(d);
}

export async function signUp(email, password, name, country = 'AU') {
  if (LOCAL_USERS.has(email)) return { error: 'Email already registered' };
  const user = { id: 'usr-' + Date.now(), email, name, role: 'customer', plan: isFreeEligible(email) ? 'free' : 'trial', country, created_at: new Date().toISOString(), pwHash: simpleHash(password) };
  LOCAL_USERS.set(email, user);
  if (sb) await sb.from('users').upsert({ id: user.id, email, name, role: 'customer', plan: 'free', country });
  return { user: { ...user, pwHash: undefined } };
}

export async function signIn(email, password) {
  const u = LOCAL_USERS.get(email);
  if (!u) return { error: 'User not found' };
  if (u.pwHash !== simpleHash(password)) return { error: 'Invalid password' };
  const token = Buffer.from(email + ':' + Date.now()).toString('base64');
  return { user: { ...u, pwHash: undefined }, token };
}

export async function getUser(email) {
  const u = LOCAL_USERS.get(email);
  return u ? { ...u, pwHash: undefined } : null;
}

export function isAdmin(email) { return email === 'zhili@phledger.com'; }
