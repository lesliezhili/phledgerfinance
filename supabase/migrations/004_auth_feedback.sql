-- PHLedger Auth + Feedback tables (Supabase free tier)

-- Users table (extends Supabase Auth)
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  name TEXT,
  role TEXT DEFAULT 'customer' CHECK (role IN ('admin','customer','trial')),
  plan TEXT DEFAULT 'free' CHECK (plan IN ('free','starter','professional','enterprise')),
  country TEXT DEFAULT 'AU' CHECK (country IN ('AU','CA','BOTH')),
  stripe_customer_id TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Seed admin
INSERT INTO users (id, email, name, role, plan, country)
VALUES ('admin-001', 'zhili@phledger.com', 'Zhi Li', 'admin', 'free', 'BOTH')
ON CONFLICT (id) DO NOTHING;

-- Feedback
CREATE TABLE IF NOT EXISTS feedback (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT,
  rating INT CHECK (rating BETWEEN 1 AND 5),
  message TEXT NOT NULL,
  category TEXT DEFAULT 'general',
  status TEXT DEFAULT 'new' CHECK (status IN ('new','read','resolved')),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Subscriptions (payment tracking)
CREATE TABLE IF NOT EXISTS subscriptions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id TEXT REFERENCES users(id),
  plan TEXT NOT NULL,
  currency TEXT CHECK (currency IN ('AUD','CAD')),
  amount NUMERIC(8,2),
  period TEXT CHECK (period IN ('monthly','annual')),
  payment_rail TEXT,
  status TEXT DEFAULT 'active' CHECK (status IN ('active','cancelled','past_due','trialing')),
  starts_at TIMESTAMPTZ DEFAULT now(),
  ends_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE feedback ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'allow_all_users') THEN
    CREATE POLICY allow_all_users ON users FOR ALL USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'allow_all_feedback') THEN
    CREATE POLICY allow_all_feedback ON feedback FOR ALL USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'allow_all_subs') THEN
    CREATE POLICY allow_all_subs ON subscriptions FOR ALL USING (true);
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_feedback_status ON feedback(status);
CREATE INDEX IF NOT EXISTS idx_subs_user ON subscriptions(user_id);
