import { useCallback, useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import type { Database } from '@/integrations/supabase/types';

export type ExpensePaymentRow = Database['public']['Tables']['expense_payments']['Row'];
export type ExpensePaymentInsert = Database['public']['Tables']['expense_payments']['Insert'];
export type ExpensePaymentUpdate = Database['public']['Tables']['expense_payments']['Update'];

export function useExpensePayments() {
  const { user } = useAuth();
  const [payments, setPayments] = useState<ExpensePaymentRow[]>([]);
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
        .from('expense_payments')
        .select('*')
        .eq('user_id', user.id)
        .order('paid_at', { ascending: false });
      if (error) throw error;
      setPayments((data as ExpensePaymentRow[]) || []);
    } catch (err) {
      console.error('Error fetching expense payments:', err);
      toast.error('Error al cargar historial de gastos');
    } finally {
      setLoading(false);
    }
  }, [user]);

  const getByExpense = useCallback((expenseId: string) => payments.filter(r => r.expense_id === expenseId), [payments]);
  const getByMonth = useCallback((period: string) => payments.filter(r => r.period_month === period), [payments]);

  const upsertPayment = useCallback(async (payload: Omit<ExpensePaymentInsert, 'user_id'>) => {
    if (!user) return undefined;
    try {
      const insertData: ExpensePaymentInsert = { ...payload, user_id: user.id };
      const { data, error } = await supabase
        .from('expense_payments')
        .upsert(insertData, { onConflict: 'expense_id' })
        .select()
        .single();
      if (error) throw error;
      const rec = data as ExpensePaymentRow;
      setPayments(prev => {
        const idx = prev.findIndex(r => r.expense_id === rec.expense_id);
        if (idx >= 0) {
          const clone = prev.slice();
          clone[idx] = rec;
          return clone;
        }
        return [rec, ...prev];
      });
      toast.success('Pago registrado');
      return rec;
    } catch (err) {
      console.error('Error upserting expense payment:', err);
      toast.error('No se pudo registrar el pago');
      return undefined;
    }
  }, [user]);

  const deletePayment = useCallback(async (id: string) => {
    try {
      const { error } = await supabase.from('expense_payments').delete().eq('id', id);
      if (error) throw error;
      setPayments(prev => prev.filter(r => r.id !== id));
      toast.success('Pago eliminado');
      return true;
    } catch (err) {
      console.error('Error deleting expense payment:', err);
      toast.error('No se pudo eliminar el registro');
      return false;
    }
  }, []);

  const isPaidRecorded = useCallback((expenseId: string) => payments.some(r => r.expense_id === expenseId), [payments]);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  return { payments, loading, refetch: fetchAll, getByExpense, getByMonth, upsertPayment, deletePayment, isPaidRecorded };
}
