-- Run these commands in your Supabase SQL Editor to update the schema

-- Add device_id to user_stats for single-device login restriction
ALTER TABLE user_stats ADD COLUMN IF NOT EXISTS device_id TEXT;

-- Create credit_cards table
CREATE TABLE IF NOT EXISTS credit_cards (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  limit_value DECIMAL(10, 2) NOT NULL,
  closing_day INTEGER NOT NULL,
  due_day INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
);

-- Add RLS to credit_cards
ALTER TABLE credit_cards ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own credit cards"
  ON credit_cards
  FOR ALL
  USING (auth.uid() = user_id);

-- Add payment_method and installments to expenses
ALTER TABLE expenses ADD COLUMN IF NOT EXISTS payment_method TEXT;
ALTER TABLE expenses ADD COLUMN IF NOT EXISTS installments INTEGER;
