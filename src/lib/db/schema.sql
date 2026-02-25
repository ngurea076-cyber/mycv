-- CareerAI Kenya Database Schema
-- Run this on Supabase/Neon PostgreSQL

-- Users table
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  phone VARCHAR(20),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- CV Templates table
CREATE TABLE templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL,
  type VARCHAR(50) NOT NULL, -- 'resume', 'cover_letter', 'portfolio'
  category VARCHAR(50),
  theme_css TEXT,
  is_premium BOOLEAN DEFAULT FALSE,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User CVs table
CREATE TABLE user_cvs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  template_id UUID REFERENCES templates(id),
  title VARCHAR(255),
  data JSONB NOT NULL DEFAULT '{}',
  ats_score INTEGER,
  is_paid BOOLEAN DEFAULT FALSE,
  payment_id UUID,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Cover Letters table
CREATE TABLE cover_letters (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  cv_id UUID REFERENCES user_cvs(id),
  job_title VARCHAR(255),
  company_name VARCHAR(255),
  content TEXT,
  is_paid BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Payments table
CREATE TABLE payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  amount INTEGER NOT NULL,
  currency VARCHAR(10) DEFAULT 'KES',
  status VARCHAR(50) DEFAULT 'pending', -- 'pending', 'completed', 'failed'
  mpesa_receipt VARCHAR(100),
  mpesa_checkout_id VARCHAR(100),
  document_type VARCHAR(50), -- 'cv', 'cover_letter', 'portfolio'
  document_id UUID,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE
);

-- Portfolios table
CREATE TABLE portfolios (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  title VARCHAR(255),
  bio TEXT,
  projects JSONB DEFAULT '[]',
  skills JSONB DEFAULT '[]',
  is_paid BOOLEAN DEFAULT FALSE,
  published_url VARCHAR(500),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Testimonials table
CREATE TABLE testimonials (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  role VARCHAR(255),
  company VARCHAR(255),
  content TEXT NOT NULL,
  avatar VARCHAR(10),
  is_active BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Offers/Promotions table
CREATE TABLE offers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(255) NOT NULL,
  subtitle TEXT,
  image_url VARCHAR(500),
  action_link VARCHAR(255),
  qualification_type VARCHAR(50) DEFAULT 'all', -- 'all', 'new_user', 'no_orders', 'min_orders', 'has_subscription'
  qualification_value VARCHAR(100),
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_cvs ENABLE ROW LEVEL SECURITY;
ALTER TABLE cover_letters ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE portfolios ENABLE ROW LEVEL SECURITY;
ALTER TABLE testimonials ENABLE ROW LEVEL SECURITY;
ALTER TABLE templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE offers ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view own data" ON users FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can view own CVs" ON user_cvs FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Users can create CVs" ON user_cvs FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users can update own CVs" ON user_cvs FOR UPDATE USING (user_id = auth.uid());
CREATE POLICY "Users can view own cover letters" ON cover_letters FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Users can create cover letters" ON cover_letters FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users can view own payments" ON payments FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Users can view own portfolios" ON portfolios FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Users can create portfolios" ON portfolios FOR INSERT WITH CHECK (user_id = auth.uid());

-- Testimonials RLS (public read, admin write)
CREATE POLICY "Anyone can view active testimonials" ON testimonials FOR SELECT USING (is_active = true);
CREATE POLICY "Admins can manage testimonials" ON testimonials FOR ALL USING (true);

-- Offers RLS (public read, admin write)
CREATE POLICY "Anyone can view active offers" ON offers FOR SELECT USING (is_active = true);
CREATE POLICY "Admins can manage offers" ON offers FOR ALL USING (true);

-- Seed templates data
INSERT INTO templates (name, type, category, is_premium) VALUES
  ('Modern Green', 'resume', 'tech', false),
  ('Classic Blue', 'resume', 'business', false),
  ('Executive', 'resume', 'executive', false),
  ('Minimal', 'resume', 'general', false),
  ('Bold Navy', 'resume', 'finance', false),
  ('Soft Sage', 'resume', 'ngo', false),
  ('Creative Studio', 'resume', 'creative', false),
  ('Simple Clean', 'resume', 'general', false),
  ('Professional', 'cover_letter', 'business', false),
  ('Modern Green', 'cover_letter', 'creative', false),
  ('Simple Clean', 'cover_letter', 'general', false),
  ('Executive', 'cover_letter', 'executive', false),
  ('Dev Portfolio', 'portfolio', 'developer', false),
  ('Designer', 'portfolio', 'designer', false),
  ('Business Pro', 'portfolio', 'business', false),
  ('Emerald', 'portfolio', 'finance', false);
