-- Fix team_members table to include user_id reference
ALTER TABLE team_members ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

-- Add RLS policies for team_members
CREATE POLICY "Team members can view their own team memberships"
ON team_members FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Team owners can manage team members"
ON team_members FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM teams 
    WHERE teams.id = team_members.team_id 
    AND teams.owner_id = auth.uid()
  )
);

-- Add RLS policies for teams
ALTER TABLE teams ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view teams they belong to"
ON teams FOR SELECT
USING (
  auth.uid() = owner_id OR 
  EXISTS (
    SELECT 1 FROM team_members 
    WHERE team_members.team_id = teams.id 
    AND team_members.user_id = auth.uid()
  )
);

CREATE POLICY "Users can create teams"
ON teams FOR INSERT
WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Team owners can update their teams"
ON teams FOR UPDATE
USING (auth.uid() = owner_id);

CREATE POLICY "Team owners can delete their teams"
ON teams FOR DELETE
USING (auth.uid() = owner_id);

-- Add account_type to profiles
ALTER TABLE profiles ADD COLUMN account_type TEXT DEFAULT 'personal' CHECK (account_type IN ('personal', 'team'));

-- Add notification preferences to subscriptions
ALTER TABLE subscriptions ADD COLUMN enable_renewal_alert BOOLEAN DEFAULT false;
ALTER TABLE subscriptions ADD COLUMN alert_days_before INTEGER DEFAULT 7 CHECK (alert_days_before IN (1, 3, 7));

-- Create function to automatically create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, primary_display_currency, account_type)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
    'USD',
    COALESCE(NEW.raw_user_meta_data->>'account_type', 'personal')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new user signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();