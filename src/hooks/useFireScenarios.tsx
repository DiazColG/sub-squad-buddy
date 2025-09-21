import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import type { Database } from '@/integrations/supabase/types';

type Row = Database['public']['Tables']['fire_scenarios']['Row'];
 type Insert = Database['public']['Tables']['fire_scenarios']['Insert'];
 type Update = Database['public']['Tables']['fire_scenarios']['Update'];

export function useFireScenarios() {
  const { user } = useAuth();
  const [items, setItems] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchAll = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('fire_scenarios')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      if (error) throw error;
      setItems((data as Row[]) || []);
    } catch (err) {
      console.error('Error fetching scenarios:', err);
      toast.error('No se pudieron cargar escenarios');
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const createOne = async (payload: Omit<Insert, 'user_id' | 'id' | 'created_at' | 'updated_at'>) => {
    if (!user) return undefined;
    try {
      const insertData: Insert = { ...payload, user_id: user.id } as Insert;
      const { data, error } = await supabase
        .from('fire_scenarios')
        .insert([insertData])
        .select()
        .single();
      if (error) throw error;
      const created = data as Row;
      setItems(prev => [created, ...prev]);
      toast.success('Escenario guardado');
      return created;
    } catch (err) {
      console.error('Error creating scenario:', err);
      toast.error('Error al guardar escenario');
      return undefined;
    }
  };

  const updateOne = async (id: string, updates: Update) => {
    try {
      const { data, error } = await supabase
        .from('fire_scenarios')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      const updated = data as Row;
      setItems(prev => prev.map(x => x.id === id ? updated : x));
      toast.success('Escenario actualizado');
      return updated;
    } catch (err) {
      console.error('Error updating scenario:', err);
      toast.error('Error al actualizar escenario');
      return undefined;
    }
  };

  const deleteOne = async (id: string) => {
    try {
      const { error } = await supabase.from('fire_scenarios').delete().eq('id', id);
      if (error) throw error;
      setItems(prev => prev.filter(x => x.id !== id));
      toast.success('Escenario eliminado');
      return true;
    } catch (err) {
      console.error('Error deleting scenario:', err);
      toast.error('Error al eliminar escenario');
      return false;
    }
  };

  return { items, loading, fetchAll, createOne, updateOne, deleteOne };
}
