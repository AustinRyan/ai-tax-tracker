/*
  # Create tax categories and chat history tables

  1. New Tables
    - `tax_categories`
      - `id` (uuid, primary key)
      - `name` (text)
      - `description` (text)
      - `deduction_percentage` (integer)
      - `created_at` (timestamptz)
    - `chat_history`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references profiles.id)
      - `message` (text)
      - `sender` (text)
      - `timestamp` (timestamptz)
  2. Security
    - Enable RLS on both tables
    - Add policies for authenticated users to manage their own data
*/

-- Create tax categories table
CREATE TABLE IF NOT EXISTS tax_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  deduction_percentage INTEGER DEFAULT 100,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS on tax categories
ALTER TABLE tax_categories ENABLE ROW LEVEL SECURITY;

-- Create policies for tax categories
CREATE POLICY "Anyone can view tax categories"
  ON tax_categories
  FOR SELECT
  TO authenticated
  USING (true);

-- Insert default tax categories
INSERT INTO tax_categories (name, description, deduction_percentage)
VALUES
  ('Office Expenses', 'Office supplies, equipment, and other expenses related to your workspace', 100),
  ('Meals & Entertainment', 'Business meals with clients or colleagues', 50),
  ('Software & Services', 'Software subscriptions, cloud services, and digital tools', 100),
  ('Travel', 'Business travel expenses including airfare, hotels, and transportation', 100),
  ('Professional Development', 'Courses, conferences, and educational materials', 100),
  ('Rent & Lease', 'Office rent, equipment leases, and other rental expenses', 100),
  ('Insurance', 'Business insurance premiums', 100),
  ('Utilities & Phone', 'Internet, phone, and utility bills for business use', 100),
  ('Marketing & Advertising', 'Advertising, marketing campaigns, and promotional materials', 100),
  ('Professional Services', 'Legal, accounting, and consulting fees', 100)
ON CONFLICT (name) DO NOTHING;

-- Create chat history table
CREATE TABLE IF NOT EXISTS chat_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  message TEXT NOT NULL,
  sender TEXT NOT NULL,
  timestamp TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS on chat history
ALTER TABLE chat_history ENABLE ROW LEVEL SECURITY;

-- Create policies for chat history
CREATE POLICY "Users can view their own chat history"
  ON chat_history
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert into their own chat history"
  ON chat_history
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own chat history"
  ON chat_history
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);