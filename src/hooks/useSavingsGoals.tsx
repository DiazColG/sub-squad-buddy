import { useCallback, useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import type { Database } from '@/integrations/supabase/types';

export type SavingsGoalRow = Database['public']['Tables']['savings_goals']['Row'];
export type SavingsGoalInsert = Database['public']['Tables']['savings_goals']['Insert'];
export type SavingsGoalUpdate = Database['public']['Tables']['savings_goals']['Update'];

export function useSavingsGoals() {
  const { user } = useAuth();
  const [goals, setGoals] = useState<SavingsGoalRow[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchGoals = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('savings_goals')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      if (error) throw error;
      setGoals((data as SavingsGoalRow[]) || []);
    } catch (e) {
      console.error('Error fetching savings goals', e);
      toast.error('No se pudieron cargar las metas');
    } finally {
      setLoading(false);
    }
  }, [user]);

  const createGoal = useCallback(async (payload: Omit<SavingsGoalInsert, 'user_id'>) => {
    if (!user) return undefined;
    try {
      const { data, error } = await supabase
        .from('savings_goals')
        .insert({ ...payload, user_id: user.id })
        .select('*')
        .single();
      if (error) throw error;
      setGoals(prev => [data as SavingsGoalRow, ...prev]);
      toast.success('Meta creada');
      return data as SavingsGoalRow;
    } catch (e) {
      console.error('Error creando meta', e);
      toast.error('No se pudo crear la meta');
      return undefined;
    }
  }, [user]);

  const updateGoal = useCallback(async (id: string, updates: SavingsGoalUpdate) => {
    try {
      const { data, error } = await supabase
        .from('savings_goals')
        .update(updates)
        .eq('id', id)
        .select('*')
        .single();
      if (error) throw error;
      setGoals(prev => prev.map(g => (g.id === id ? (data as SavingsGoalRow) : g)));
      toast.success('Meta actualizada');
      return data as SavingsGoalRow;
    } catch (e) {
      console.error('Error actualizando meta', e);
      toast.error('No se pudo actualizar');
      return undefined;
    }
  }, []);

  const deleteGoal = useCallback(async (id: string) => {
    try {
      const { error } = await supabase
        .from('savings_goals')
        .delete()
        .eq('id', id);
      if (error) throw error;
      setGoals(prev => prev.filter(g => g.id !== id));
      toast.success('Meta eliminada');
      return true;
    } catch (e) {
      console.error('Error eliminando meta', e);
      toast.error('No se pudo eliminar');
      return false;
    }
  }, []);

  useEffect(() => { fetchGoals(); }, [fetchGoals]);

  return { goals, loading, refetch: fetchGoals, createGoal, updateGoal, deleteGoal };
}
