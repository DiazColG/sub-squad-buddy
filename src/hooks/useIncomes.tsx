import { useCallback, useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import type { Database } from '@/integrations/supabase/types';

export type IncomeRow = Database['public']['Tables']['incomes']['Row'];
export type CreateIncome = Database['public']['Tables']['incomes']['Insert'];
export type UpdateIncome = Database['public']['Tables']['incomes']['Update'];

export function useIncomes() {
  const { user } = useAuth();
  const [incomes, setIncomes] = useState<IncomeRow[]>([]);
  const [loading, setLoading] = useState(true);
  const monthKey = (d: Date | string) => {
    const date = typeof d === 'string' ? new Date(d) : d;
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    return `${y}-${m}`;
  };

  const fetchIncomes = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('incomes')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setIncomes((data as IncomeRow[]) || []);
    } catch (err) {
      console.error('Error fetching incomes:', err);
      toast.error('Error al cargar ingresos');
    } finally {
      setLoading(false);
    }
  }, [user]);

  const addIncome = async (payload: Omit<CreateIncome, 'user_id'>) => {
    if (!user) return undefined;
    try {
      const insertData: CreateIncome = { ...payload, user_id: user.id };
      const { data, error } = await supabase
        .from('incomes')
        .insert([insertData])
        .select()
        .single();
      if (error) throw error;
      const created = data as IncomeRow;
      setIncomes(prev => [created, ...prev]);
      toast.success('Ingreso agregado');
      return created;
    } catch (err) {
      console.error('Error adding income:', err);
      toast.error('Error al agregar ingreso');
      return undefined;
    }
  };

  const updateIncome = useCallback(async (id: string, updates: UpdateIncome) => {
    try {
      const { data, error } = await supabase
        .from('incomes')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      const updated = data as IncomeRow;
      setIncomes(prev => prev.map(i => (i.id === id ? updated : i)));
      toast.success('Ingreso actualizado');
      return updated;
    } catch (err) {
      console.error('Error updating income:', err);
      toast.error('Error al actualizar ingreso');
      return undefined;
    }
  }, []);

  const deleteIncome = async (id: string) => {
    try {
      const { error } = await supabase.from('incomes').delete().eq('id', id);
      if (error) throw error;
      setIncomes(prev => prev.filter(i => i.id !== id));
      toast.success('Ingreso eliminado');
      return true;
    } catch (err) {
      console.error('Error deleting income:', err);
      toast.error('Error al eliminar ingreso');
      return false;
    }
  };

  // Received helpers (UX parity with expenses paid)

  const isIncomeReceivedForMonth = useCallback((i: IncomeRow, ref: Date = new Date()) => {
    const key = monthKey(ref);
    const tags = Array.isArray(i.tags) ? i.tags : [];
    return tags.includes(`income-received:${key}`);
  }, []);

  const markIncomeReceivedForMonth = useCallback(async (id: string, ref: Date = new Date()) => {

    const income = incomes.find(x => x.id === id);
    if (!income) return undefined;
    const key = monthKey(ref);
    const tags = Array.isArray(income.tags) ? income.tags : [];
    if (tags.includes(`income-received:${key}`)) return income;
    const dateStr = new Date().toISOString().slice(0,10);
    const newTags = [...tags.filter(t => !t.startsWith('received-at:')), `income-received:${key}`, `received-at:${dateStr}`];
    const updated = await updateIncome(id, { tags: newTags });
    if (updated) toast.success('Ingreso marcado como recibido');
    return updated;

  }, [incomes, updateIncome]);

  // Auto-mark incomes whose payment_day <= today and not yet marked this month
  const autoMarkDueIncomes = useCallback(async () => {
    const today = new Date();
    const day = today.getDate();
    for (const income of incomes) {
      if (!income.payment_day) continue;
      if (income.payment_day <= day && !isIncomeReceivedForMonth(income, today)) {
        await markIncomeReceivedForMonth(income.id, today);
      }
    }
  // intentionally no deps on markIncomeReceivedForMonth to avoid re-loop each render
  }, [incomes, isIncomeReceivedForMonth, markIncomeReceivedForMonth]);

  const clearIncomeReceivedForMonth = useCallback(async (id: string, ref: Date = new Date()) => {

    const income = incomes.find(x => x.id === id);
    if (!income) return undefined;
    const key = monthKey(ref);
    const tags = Array.isArray(income.tags) ? income.tags : [];
    const newTags = tags.filter(t => t !== `income-received:${key}` && !t.startsWith('received-at:'));
    const updated = await updateIncome(id, { tags: newTags });
    if (updated) toast.success('Marcado como no recibido');
    return updated;

  }, [incomes, updateIncome]);

  useEffect(() => { fetchIncomes(); }, [fetchIncomes]);
  useEffect(() => { if (!loading) autoMarkDueIncomes(); }, [loading, autoMarkDueIncomes]);


  return { incomes, loading, addIncome, updateIncome, deleteIncome, refetch: fetchIncomes, isIncomeReceivedForMonth, markIncomeReceivedForMonth, clearIncomeReceivedForMonth };
}
