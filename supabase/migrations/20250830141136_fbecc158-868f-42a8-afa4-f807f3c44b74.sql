-- Fix infinite recursion in team_members policies by creating security definer functions

-- First, drop the problematic policies
DROP POLICY IF EXISTS "Team owners can manage team members" ON public.team_members;
DROP POLICY IF EXISTS "Users can manage their own or their team's subscriptions" ON public.subscriptions;
DROP POLICY IF EXISTS "Users can manage their own or their team's subscriptions." ON public.subscriptions;
DROP POLICY IF EXISTS "Users can create subscriptions for self or team" ON public.subscriptions;
DROP POLICY IF EXISTS "Users can delete subscriptions for self or team." ON public.subscriptions;

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

-- Recreate team_members policies without recursion
CREATE POLICY "Team members can view their own team memberships" 
ON public.team_members 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Team owners can manage team members" 
ON public.team_members 
FOR ALL 
USING (public.is_team_owner(team_id));

-- Recreate subscriptions policies without recursion
CREATE POLICY "Users can view their own subscriptions" 
ON public.subscriptions 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can view team subscriptions if they are team members" 
ON public.subscriptions 
FOR SELECT 
USING (team_id IS NOT NULL AND public.is_team_member(team_id));

CREATE POLICY "Users can create their own subscriptions" 
ON public.subscriptions 
FOR INSERT 
WITH CHECK (auth.uid() = user_id AND team_id IS NULL);

CREATE POLICY "Users can create team subscriptions if they are admin or manager" 
ON public.subscriptions 
FOR INSERT 
WITH CHECK (
  team_id IS NOT NULL 
  AND auth.uid() = user_id 
  AND public.get_user_team_role(team_id) IN ('ADMINISTRADOR', 'GESTOR')
);

CREATE POLICY "Users can update their own subscriptions" 
ON public.subscriptions 
FOR UPDATE 
USING (auth.uid() = user_id AND team_id IS NULL);

CREATE POLICY "Users can update team subscriptions if they are admin or manager" 
ON public.subscriptions 
FOR UPDATE 
USING (
  team_id IS NOT NULL 
  AND auth.uid() = user_id 
  AND public.get_user_team_role(team_id) IN ('ADMINISTRADOR', 'GESTOR')
);

CREATE POLICY "Users can delete their own subscriptions" 
ON public.subscriptions 
FOR DELETE 
USING (auth.uid() = user_id AND team_id IS NULL);

CREATE POLICY "Users can delete team subscriptions if they are admin or manager" 
ON public.subscriptions 
FOR DELETE 
USING (
  team_id IS NOT NULL 
  AND auth.uid() = user_id 
  AND public.get_user_team_role(team_id) IN ('ADMINISTRADOR', 'GESTOR')
);