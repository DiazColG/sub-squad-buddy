import { useCallback, useEffect, useMemo, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import type { Database } from '@/integrations/supabase/types';

export type IncomeReceiptRow = Database['public']['Tables']['income_receipts']['Row'];
export type IncomeReceiptInsert = Database['public']['Tables']['income_receipts']['Insert'];
export type IncomeReceiptUpdate = Database['public']['Tables']['income_receipts']['Update'];

export function useIncomeReceipts() {
  const { user } = useAuth();
  const [receipts, setReceipts] = useState<IncomeReceiptRow[]>([]);
  const [loading, setLoading] = useState(true);

  const monthKey = (d: Date | string) => {
    const date = typeof d === 'string' ? new Date(d) : d;
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    return `${y}-${m}`;
  };

  const fetchAll = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('income_receipts')
        .select('*')
        .eq('user_id', user.id)
        .order('received_at', { ascending: false });
      if (error) throw error;
      setReceipts((data as IncomeReceiptRow[]) || []);
    } catch (err) {
      console.error('Error fetching income receipts:', err);
      toast.error('Error al cargar historial de ingresos');
    } finally {
      setLoading(false);
    }
  }, [user]);

  const getByIncome = useCallback((incomeId: string) => receipts.filter(r => r.income_id === incomeId), [receipts]);
  const getByMonth = useCallback((period: string) => receipts.filter(r => r.period_month === period), [receipts]);

  const upsertReceipt = useCallback(async (payload: Omit<IncomeReceiptInsert, 'user_id'>) => {
    if (!user) return undefined;
    try {
      const insertData: IncomeReceiptInsert = { ...payload, user_id: user.id };
      // Upsert by (income_id, period_month) using match on income_id and received_at month via a computed constraint
      // Supabase upsert on generated column requires specifying conflict target; we'll upsert on income_id,period_month implicitly with RPC-like pattern:
      const { data, error } = await supabase
        .from('income_receipts')
        .upsert(insertData, { onConflict: 'income_id,period_month' })
        .select()
        .single();
      if (error) throw error;
      const rec = data as IncomeReceiptRow;
      setReceipts(prev => {
        const idx = prev.findIndex(r => r.income_id === rec.income_id && r.period_month === rec.period_month);
        if (idx >= 0) {
          const clone = prev.slice();
          clone[idx] = rec;
          return clone;
        }
        return [rec, ...prev];
      });
      toast.success('Ingreso registrado en historial');
      return rec;
    } catch (err) {
      console.error('Error upserting income receipt:', err);
      toast.error('No se pudo registrar el ingreso');
      return undefined;
    }
  }, [user]);

  const deleteReceipt = useCallback(async (id: string) => {
    try {
      const { error } = await supabase.from('income_receipts').delete().eq('id', id);
      if (error) throw error;
      setReceipts(prev => prev.filter(r => r.id !== id));
      toast.success('Registro eliminado');
      return true;
    } catch (err) {
      console.error('Error deleting income receipt:', err);
      toast.error('No se pudo eliminar el registro');
      return false;
    }
  }, []);

  const updateReceipt = useCallback(async (id: string, updates: Partial<IncomeReceiptUpdate>) => {
    try {
      const { data, error } = await supabase
        .from('income_receipts')
        .update(updates)
        .eq('id', id)
        .select('*')
        .single();
      if (error) throw error;
      const row = data as IncomeReceiptRow;
      setReceipts(prev => prev.map(r => (r.id === id ? row : r)));
      toast.success('Registro actualizado');
      return row;
    } catch (err) {
      console.error('Error updating income receipt:', err);
      toast.error('No se pudo actualizar el registro');
      return undefined;
    }
  }, []);

  const isRecordedForMonth = useCallback((incomeId: string, ref: Date = new Date()) => {
    const key = monthKey(ref);
    return receipts.some(r => r.income_id === incomeId && r.period_month === key);
  }, [receipts]);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  return { receipts, loading, refetch: fetchAll, getByIncome, getByMonth, upsertReceipt, deleteReceipt, updateReceipt, isRecordedForMonth };
}
