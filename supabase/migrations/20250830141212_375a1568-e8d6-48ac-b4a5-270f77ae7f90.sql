-- Drop ALL existing policies to fix infinite recursion
DROP POLICY IF EXISTS "Team members can view their own team memberships" ON public.team_members;
DROP POLICY IF EXISTS "Team owners can manage team members" ON public.team_members;
DROP POLICY IF EXISTS "Users can manage their own or their team's subscriptions" ON public.subscriptions;
DROP POLICY IF EXISTS "Users can manage their own or their team's subscriptions." ON public.subscriptions;
DROP POLICY IF EXISTS "Users can create subscriptions for self or team" ON public.subscriptions;
DROP POLICY IF EXISTS "Users can delete subscriptions for self or team." ON public.subscriptions;
DROP POLICY IF EXISTS "Users can view their own subscriptions" ON public.subscriptions;
DROP POLICY IF EXISTS "Users can view team subscriptions if they are team members" ON public.subscriptions;
DROP POLICY IF EXISTS "Users can create their own subscriptions" ON public.subscriptions;
DROP POLICY IF EXISTS "Users can create team subscriptions if they are admin or manager" ON public.subscriptions;
DROP POLICY IF EXISTS "Users can update their own subscriptions" ON public.subscriptions;
DROP POLICY IF EXISTS "Users can update team subscriptions if they are admin or manager" ON public.subscriptions;
DROP POLICY IF EXISTS "Users can delete their own subscriptions" ON public.subscriptions;
DROP POLICY IF EXISTS "Users can delete team subscriptions if they are admin or manager" ON public.subscriptions;

-- Create security definer functions to avoid recursion
CREATE OR REPLACE FUNCTION public.is_team_owner(team_uuid uuid)
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.teams 
    WHERE id = team_uuid AND owner_id = auth.uid()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

CREATE OR REPLACE FUNCTION public.is_team_member(team_uuid uuid)
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.team_members 
    WHERE team_id = team_uuid AND user_id = auth.uid()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

CREATE OR REPLACE FUNCTION public.get_user_team_role(team_uuid uuid)
RETURNS text AS $$
BEGIN
  RETURN (
    SELECT role FROM public.team_members 
    WHERE team_id = team_uuid AND user_id = auth.uid()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- Simple policies for team_members
CREATE POLICY "Team members can view their own memberships" 
ON public.team_members 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Team owners can manage all team members" 
ON public.team_members 
FOR ALL 
USING (public.is_team_owner(team_id));

-- Simple policies for subscriptions - focusing on personal subscriptions first
CREATE POLICY "Users can manage their own personal subscriptions" 
ON public.subscriptions 
FOR ALL 
USING (auth.uid() = user_id AND team_id IS NULL)
WITH CHECK (auth.uid() = user_id AND team_id IS NULL);