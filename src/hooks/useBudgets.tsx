import { useCallback, useEffect, useMemo, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

/** NOTE SOBRE EL ESQUEMA
 * Hay una discrepancia entre el archivo de migraciones y el archivo generado de tipos.
 * La migración define budgets (id, user_id, category_id, name, budgeted_amount, spent_amount, period_start, period_end, etc)
 * mientras que los tipos actuales en `integrations/supabase/types.ts` muestran otra estructura (total_budget, categories JSON, ...).
 * Para no bloquear la UI usamos un tipo manual que refleja la migración más reciente. Si regeneras los tipos oficialízalo y
 * reemplaza este tipo por el generado.
 */
export interface RawBudgetRow {
  id: string;
  user_id: string;
  category_id: string | null;
  name: string;
  budgeted_amount: number;
  spent_amount: number | null;
  period_type: string;
  period_start: string; // date
  period_end: string;   // date
  status: string | null;
  alert_threshold: number | null;
  notes: string | null;
  created_at: string | null;
  updated_at: string | null;
  // Joined category (cuando hacemos select anidado)
  financial_categories?: {
    id: string;
    name: string;
    color: string | null;
    icon: string | null;
  } | null;
}

export interface AggregatedBudgetPeriod {
  period_start: string;
  period_end: string;
  categories: Array<{
    id: string; // budget row id
    category_id: string | null;
    name: string; // category or budget name fallback
    budgeted_amount: number;
    spent_amount: number;
    color?: string | null;
    icon?: string | null;
  }>;
  total_budget: number;
  total_spent: number;
  remaining: number;
  categories_over: number;
  is_overall_over: boolean;
}

export function useBudgets() {
  const { user } = useAuth();
  const [rows, setRows] = useState<RawBudgetRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchBudgets = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    setError(null);
    try {
      // Intentamos seleccionar con join a financial_categories para mostrar nombres bonitos
      const { data, error } = await supabase
        .from('budgets')
        .select('*, financial_categories(id, name, color, icon)')
        .eq('user_id', user.id)
        .order('period_start', { ascending: false });
      if (error) throw error;
      setRows((data as unknown as RawBudgetRow[]) || []);
    } catch (e) {
      console.error('Error fetching budgets', e);
      setError(e as Error);
      toast.error('No se pudieron cargar los presupuestos');
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => { fetchBudgets(); }, [fetchBudgets]);

  const groupByPeriod = useCallback((items: RawBudgetRow[]) => {
    const map = new Map<string, AggregatedBudgetPeriod>();
    items.forEach(b => {
      const key = `${b.period_start}|${b.period_end}`;
      if (!map.has(key)) {
        map.set(key, {
          period_start: b.period_start,
            period_end: b.period_end,
            categories: [],
            total_budget: 0,
            total_spent: 0,
            remaining: 0,
            categories_over: 0,
            is_overall_over: false,
        });
      }
      const agg = map.get(key)!;
      const spent = Number(b.spent_amount || 0);
      const budgeted = Number(b.budgeted_amount || 0);
      agg.categories.push({
        id: b.id,
        category_id: b.category_id,
        name: b.financial_categories?.name || b.name,
        budgeted_amount: budgeted,
        spent_amount: spent,
        color: b.financial_categories?.color || undefined,
        icon: b.financial_categories?.icon || undefined,
      });
      agg.total_budget += budgeted;
      agg.total_spent += spent;
    });
    // finalize
    for (const agg of map.values()) {
      agg.remaining = agg.total_budget - agg.total_spent;
      agg.categories_over = agg.categories.filter(c => c.spent_amount > c.budgeted_amount).length;
      agg.is_overall_over = agg.total_spent > agg.total_budget;
    }
    return Array.from(map.values()).sort((a, b) => (a.period_start < b.period_start ? 1 : -1));
  }, []);

  const aggregated = useMemo(() => groupByPeriod(rows), [rows, groupByPeriod]);

  const createBudget = useCallback(async (payload: Omit<RawBudgetRow, 'id' | 'spent_amount' | 'created_at' | 'updated_at' | 'financial_categories' | 'status' | 'alert_threshold' | 'notes'> & { alert_threshold?: number; notes?: string; status?: string }) => {
    if (!payload.user_id) {
      toast.error('Falta user_id');
      return undefined;
    }
    try {
      // Validación: evitar dos presupuestos de la misma categoría que se solapen en el período
      if (payload.category_id) {
        const { data: existing, error: existingError } = await supabase
          .from('budgets')
          .select('id, period_start, period_end')
          .eq('user_id', payload.user_id)
          .eq('category_id', payload.category_id)
          .lte('period_start', payload.period_end)  // start <= new_end
          .gte('period_end', payload.period_start); // end >= new_start
        if (!existingError && existing && existing.length > 0) {
          toast.error('Ya existe un presupuesto para esa categoría en este período');
          return undefined;
        }
      }
      const { data, error } = await supabase
        .from('budgets')
        .insert({
          user_id: payload.user_id,
          category_id: payload.category_id,
          name: payload.name,
          budgeted_amount: payload.budgeted_amount,
          period_type: payload.period_type,
          period_start: payload.period_start,
          period_end: payload.period_end,
          alert_threshold: payload.alert_threshold,
          status: payload.status || 'active',
          notes: payload.notes,
        })
        .select('*')
        .single();
      if (error) throw error;
      setRows(prev => [data as unknown as RawBudgetRow, ...prev]);
      toast.success('Presupuesto creado');
      return data as unknown as RawBudgetRow;
    } catch (e) {
      console.error('Error creando presupuesto', e);
      toast.error('No se pudo crear presupuesto');
      return undefined;
    }
  }, []);

  const getCurrentPeriod = () => {
    const today = new Date();
    return aggregated.find(a => today >= new Date(a.period_start) && today <= new Date(a.period_end));
  };

  return {
    loading,
    error,
    rows,
    aggregated,
    refetch: fetchBudgets,
    getCurrentPeriod,
    createBudget,
  };
}
