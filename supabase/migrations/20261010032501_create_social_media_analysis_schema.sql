/*
# Social Media Analysis Schema

1. New Tables
- `social_accounts` — social media accounts being tracked (platform, handle, followers, etc.)
- `social_posts` — individual posts with engagement metrics and sentiment
- `audience_demographics` — age/gender breakdown per account
- `audience_locations` — geographic distribution of audience per account
- `engagement_timeline` — daily aggregate engagement metrics per account

2. Security
- Single-tenant app (no sign-in), so all policies use TO anon, authenticated
- RLS enabled on every table
- All data is intentionally shared/public

3. Notes
- All timestamps are timestamptz with now() defaults
- UUIDs used for primary keys throughout
*/

-- Social accounts table
CREATE TABLE IF NOT EXISTS social_accounts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  platform text NOT NULL,
  handle text NOT NULL,
  display_name text NOT NULL,
  avatar_url text,
  followers integer NOT NULL DEFAULT 0,
  following integer NOT NULL DEFAULT 0,
  posts_count integer NOT NULL DEFAULT 0,
  engagement_rate numeric(5,2) NOT NULL DEFAULT 0,
  verified boolean NOT NULL DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- Social posts table
CREATE TABLE IF NOT EXISTS social_posts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id uuid NOT NULL REFERENCES social_accounts(id) ON DELETE CASCADE,
  caption text NOT NULL,
  media_type text NOT NULL DEFAULT 'image',
  likes integer NOT NULL DEFAULT 0,
  comments integer NOT NULL DEFAULT 0,
  shares integer NOT NULL DEFAULT 0,
  saves integer NOT NULL DEFAULT 0,
  impressions integer NOT NULL DEFAULT 0,
  reach integer NOT NULL DEFAULT 0,
  sentiment text NOT NULL DEFAULT 'neutral',
  sentiment_score numeric(4,2) NOT NULL DEFAULT 0,
  hashtags text[] DEFAULT '{}',
  posted_at timestamptz NOT NULL DEFAULT now()
);

-- Audience demographics table
CREATE TABLE IF NOT EXISTS audience_demographics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id uuid NOT NULL REFERENCES social_accounts(id) ON DELETE CASCADE,
  age_range text NOT NULL,
  gender text NOT NULL,
  percentage numeric(5,2) NOT NULL DEFAULT 0
);

-- Audience locations table
CREATE TABLE IF NOT EXISTS audience_locations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id uuid NOT NULL REFERENCES social_accounts(id) ON DELETE CASCADE,
  country text NOT NULL,
  city text,
  percentage numeric(5,2) NOT NULL DEFAULT 0
);

-- Engagement timeline table (daily aggregate per account)
CREATE TABLE IF NOT EXISTS engagement_timeline (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id uuid NOT NULL REFERENCES social_accounts(id) ON DELETE CASCADE,
  date date NOT NULL,
  followers integer NOT NULL DEFAULT 0,
  new_followers integer NOT NULL DEFAULT 0,
  engagement_rate numeric(5,2) NOT NULL DEFAULT 0,
  impressions integer NOT NULL DEFAULT 0,
  reach integer NOT NULL DEFAULT 0
);

-- Enable RLS on all tables
ALTER TABLE social_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE social_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE audience_demographics ENABLE ROW LEVEL SECURITY;
ALTER TABLE audience_locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE engagement_timeline ENABLE ROW LEVEL SECURITY;

-- Policies for social_accounts
DROP POLICY IF EXISTS "anon_select_accounts" ON social_accounts;
CREATE POLICY "anon_select_accounts" ON social_accounts FOR SELECT
  TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "anon_insert_accounts" ON social_accounts;
CREATE POLICY "anon_insert_accounts" ON social_accounts FOR INSERT
  TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "anon_update_accounts" ON social_accounts;
CREATE POLICY "anon_update_accounts" ON social_accounts FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "anon_delete_accounts" ON social_accounts;
CREATE POLICY "anon_delete_accounts" ON social_accounts FOR DELETE
  TO anon, authenticated USING (true);

-- Policies for social_posts
DROP POLICY IF EXISTS "anon_select_posts" ON social_posts;
CREATE POLICY "anon_select_posts" ON social_posts FOR SELECT
  TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "anon_insert_posts" ON social_posts;
CREATE POLICY "anon_insert_posts" ON social_posts FOR INSERT
  TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "anon_update_posts" ON social_posts;
CREATE POLICY "anon_update_posts" ON social_posts FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "anon_delete_posts" ON social_posts;
CREATE POLICY "anon_delete_posts" ON social_posts FOR DELETE
  TO anon, authenticated USING (true);

-- Policies for audience_demographics
DROP POLICY IF EXISTS "anon_select_demographics" ON audience_demographics;
CREATE POLICY "anon_select_demographics" ON audience_demographics FOR SELECT
  TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "anon_insert_demographics" ON audience_demographics;
CREATE POLICY "anon_insert_demographics" ON audience_demographics FOR INSERT
  TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "anon_update_demographics" ON audience_demographics;
CREATE POLICY "anon_update_demographics" ON audience_demographics FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "anon_delete_demographics" ON audience_demographics;
CREATE POLICY "anon_delete_demographics" ON audience_demographics FOR DELETE
  TO anon, authenticated USING (true);

-- Policies for audience_locations
DROP POLICY IF EXISTS "anon_select_locations" ON audience_locations;
CREATE POLICY "anon_select_locations" ON audience_locations FOR SELECT
  TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "anon_insert_locations" ON audience_locations;
CREATE POLICY "anon_insert_locations" ON audience_locations FOR INSERT
  TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "anon_update_locations" ON audience_locations;
CREATE POLICY "anon_update_locations" ON audience_locations FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "anon_delete_locations" ON audience_locations;
CREATE POLICY "anon_delete_locations" ON audience_locations FOR DELETE
  TO anon, authenticated USING (true);

-- Policies for engagement_timeline
DROP POLICY IF EXISTS "anon_select_timeline" ON engagement_timeline;
CREATE POLICY "anon_select_timeline" ON engagement_timeline FOR SELECT
  TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "anon_insert_timeline" ON engagement_timeline;
CREATE POLICY "anon_insert_timeline" ON engagement_timeline FOR INSERT
  TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "anon_update_timeline" ON engagement_timeline;
CREATE POLICY "anon_update_timeline" ON engagement_timeline FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "anon_delete_timeline" ON engagement_timeline;
CREATE POLICY "anon_delete_timeline" ON engagement_timeline FOR DELETE
  TO anon, authenticated USING (true);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_posts_account_id ON social_posts(account_id);
CREATE INDEX IF NOT EXISTS idx_posts_posted_at ON social_posts(posted_at);
CREATE INDEX IF NOT EXISTS idx_demographics_account_id ON audience_demographics(account_id);
CREATE INDEX IF NOT EXISTS idx_locations_account_id ON audience_locations(account_id);
CREATE INDEX IF NOT EXISTS idx_timeline_account_id ON engagement_timeline(account_id);
CREATE INDEX IF NOT EXISTS idx_timeline_date ON engagement_timeline(date);
