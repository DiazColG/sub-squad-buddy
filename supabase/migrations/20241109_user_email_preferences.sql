-- Migration: Add user_email_preferences table
-- Created: 2024-11-09
-- Purpose: Store user preferences for email notifications

CREATE TABLE IF NOT EXISTS user_email_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Transactional emails (cannot be disabled)
  welcome_email BOOLEAN DEFAULT true NOT NULL,
  password_reset_email BOOLEAN DEFAULT true NOT NULL,
  
  -- Marketing/Optional emails (can be disabled)
  monthly_insights BOOLEAN DEFAULT false NOT NULL,
  budget_alerts BOOLEAN DEFAULT false NOT NULL,
  goal_reminders BOOLEAN DEFAULT false NOT NULL,
  
  -- Metadata
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  
  -- Ensure one row per user
  CONSTRAINT unique_user_email_preferences UNIQUE (user_id)
);

-- Add RLS policies
ALTER TABLE user_email_preferences ENABLE ROW LEVEL SECURITY;

-- Users can view their own preferences
CREATE POLICY "Users can view own email preferences"
  ON user_email_preferences
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Users can update their own preferences
CREATE POLICY "Users can update own email preferences"
  ON user_email_preferences
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Users can insert their own preferences
CREATE POLICY "Users can insert own email preferences"
  ON user_email_preferences
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Create index for faster lookups
CREATE INDEX idx_user_email_preferences_user_id ON user_email_preferences(user_id);

-- Function to automatically update updated_at
CREATE OR REPLACE FUNCTION update_user_email_preferences_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update updated_at on every update
CREATE TRIGGER trigger_update_user_email_preferences_updated_at
  BEFORE UPDATE ON user_email_preferences
  FOR EACH ROW
  EXECUTE FUNCTION update_user_email_preferences_updated_at();

-- Create default preferences for existing users (optional)
INSERT INTO user_email_preferences (user_id, monthly_insights, budget_alerts, goal_reminders)
SELECT 
  id,
  false, -- monthly_insights off by default
  false, -- budget_alerts off by default
  false  -- goal_reminders off by default
FROM auth.users
ON CONFLICT (user_id) DO NOTHING;

COMMENT ON TABLE user_email_preferences IS 'Stores user preferences for email notifications';
COMMENT ON COLUMN user_email_preferences.welcome_email IS 'Cannot be disabled - sent once on signup';
COMMENT ON COLUMN user_email_preferences.password_reset_email IS 'Cannot be disabled - transactional';
COMMENT ON COLUMN user_email_preferences.monthly_insights IS 'Monthly financial summary - optional';
COMMENT ON COLUMN user_email_preferences.budget_alerts IS 'Alerts when approaching budget limits - optional';
COMMENT ON COLUMN user_email_preferences.goal_reminders IS 'Reminders for financial goals - optional';
