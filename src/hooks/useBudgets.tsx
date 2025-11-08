import { useCallback, useEffect, useMemo, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import { addLocalBudget, loadLocalBudgets, removeLocalBudget } from '@/lib/budgetsLocal';
import { useAnalytics } from '@/lib/analytics';

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
  const { user, loading: authLoading } = useAuth();
  const [rows, setRows] = useState<RawBudgetRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [localMode, setLocalMode] = useState(false);
  const analytics = useAnalytics();

  const fetchBudgets = useCallback(async () => {
    // Evitamos fetch hasta que el estado de auth esté resuelto para no disparar toasts "falsos".
    if (authLoading || !user) return;
    setLoading(true); // Solo marcamos loading cuando realmente disparamos el fetch.
    setError(null);
    try {
      // Intento 1: con relación (puede fallar si la relación no está registrada como tal en PostgREST)
      const rel = await supabase
        .from('budgets')
        .select('*, financial_categories(id, name, color, icon)')
        .eq('user_id', user.id)
        .order('period_start', { ascending: false });
      if (rel.error) {
        console.warn('[useBudgets] Relational select failed, falling back to plain select', rel.error);
        // Intento 2: sin relación (fallback robusto)
        const plain = await supabase
          .from('budgets')
          .select('*')
          .eq('user_id', user.id)
          // Usamos created_at para compatibilidad con esquemas antiguos
          .order('created_at', { ascending: false });
        if (plain.error) {
          // Intento 3: plano sin orden
          console.warn('[useBudgets] Plain select (ordered) failed, trying without order', plain.error);
          const plainNoOrder = await supabase
            .from('budgets')
            .select('*')
            .eq('user_id', user.id);
          if (plainNoOrder.error) {
            // Si también falla el select plano, activamos localMode como último recurso
            console.warn('[useBudgets] Plain select (no order) failed, switching to local mode', plainNoOrder.error);
            setLocalMode(true);
            const local = loadLocalBudgets(user.id) as unknown as RawBudgetRow[];
            setRows(local);
            return;
          }
          setRows((plainNoOrder.data as unknown as RawBudgetRow[]) || []);
        } else {
          setRows((plain.data as unknown as RawBudgetRow[]) || []);
        }
        // Server respondió bien: aseguramos salir de modo local
        if (localMode) setLocalMode(false);
      } else {
        setRows((rel.data as unknown as RawBudgetRow[]) || []);
        if (localMode) setLocalMode(false);
      }
    } catch (e: unknown) {
      console.error('Error fetching budgets', e);
      setError(e as Error);
      // Solo mostramos toast si el usuario está autenticado completamente (para evitar "parpadeo" inicial)
      if (!authLoading && user) {
        const msg = typeof e === 'object' && e && 'message' in e ? (e as { message?: string }).message : undefined;
        toast.error(msg || 'No se pudieron cargar los presupuestos');
      }
    } finally {
      setLoading(false);
    }
  }, [user, authLoading, localMode]);

  // Sincroniza presupuestos locales hacia Supabase y limpia los locales cuando están en server
  const syncLocalToServer = useCallback(async () => {
    if (!user) return { synced: 0, total: 0 };
    const local = loadLocalBudgets(user.id) as unknown as RawBudgetRow[];
    if (!local?.length) return { synced: 0, total: 0 };
    let synced = 0;
    for (const row of local) {
      try {
        const { error } = await supabase
          .from('budgets')
          .insert({
            user_id: row.user_id,
            category_id: row.category_id ?? null,
            name: row.name,
            budgeted_amount: row.budgeted_amount,
            period_type: row.period_type,
            period_start: row.period_start,
            period_end: row.period_end,
            alert_threshold: row.alert_threshold ?? 80,
            status: row.status || 'active',
            notes: row.notes,
          });
        if (error) {
          // Si ya existe, lo consideramos sincronizado y lo removemos del local
          if (error.code === '23505') {
            removeLocalBudget(user.id, row.id);
            synced++;
            continue;
          }
          // Otros errores: seguimos con el resto
          console.warn('[syncLocalToServer] insert error for row', row.id, error);
          continue;
        }
        removeLocalBudget(user.id, row.id);
        synced++;
      } catch (e) {
        console.warn('[syncLocalToServer] unexpected error', e);
      }
    }
    // Refrescamos desde server
    await fetchBudgets();
    if (synced > 0) {
      toast.success(`Sincronización completa: ${synced}/${local.length}`);
    } else {
      toast.message('No había cambios para sincronizar');
    }
    return { synced, total: local.length };
  }, [user, fetchBudgets]);

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
      // Empujamos cada presupuesto como "categoría" para UI; si es general, usamos el nombre del presupuesto
      agg.categories.push({
        id: b.id,
        category_id: b.category_id,
        name: b.category_id ? (b.financial_categories?.name || b.name) : (b.name || 'Presupuesto General'),
        budgeted_amount: budgeted,
        spent_amount: spent,
        color: b.category_id ? (b.financial_categories?.color || undefined) : undefined,
        icon: b.category_id ? (b.financial_categories?.icon || undefined) : undefined,
      });
    });

    // finalize por período: el presupuesto total del período se toma del presupuesto general si existe;
    // si no hay general, sumamos los parciales. El gasto total es la suma de gastado.
    for (const agg of map.values()) {
      const general = agg.categories.find(c => c.category_id === null);
      const sumSpent = agg.categories.reduce((s, c) => s + (Number(c.spent_amount) || 0), 0);
      const sumBudgeted = agg.categories
        .filter(c => c.category_id !== null)
        .reduce((s, c) => s + (Number(c.budgeted_amount) || 0), 0);
      agg.total_spent = sumSpent;
      agg.total_budget = general ? Number(general.budgeted_amount) : sumBudgeted;
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
      const categoryIdNormalized = payload.category_id && `${payload.category_id}`.trim() !== '' ? payload.category_id : null;
      // Validación: evitar dos presupuestos de la misma categoría que se solapen en el período
      if (categoryIdNormalized) {
        const { data: existing, error: existingError } = await supabase
          .from('budgets')
          .select('id, period_start, period_end')
          .eq('user_id', payload.user_id)
          .eq('category_id', categoryIdNormalized)
          .lte('period_start', payload.period_end)  // start <= new_end
          .gte('period_end', payload.period_start); // end >= new_start
        if (!existingError && existing && existing.length > 0) {
          toast.error('Ya existe un presupuesto para esa categoría en este período');
          return undefined;
        }
      } else {
        // General (sin categoría): solo uno por período
        const { data: existingGeneral, error: existingGeneralError } = await supabase
          .from('budgets')
          .select('id, period_start, period_end')
          .eq('user_id', payload.user_id)
          .is('category_id', null)
          .lte('period_start', payload.period_end)
          .gte('period_end', payload.period_start);
        if (!existingGeneralError && existingGeneral && existingGeneral.length > 0) {
          toast.error('Ya existe un presupuesto general para este período');
          return undefined;
        }
      }

      if (localMode) {
        const created = addLocalBudget(payload.user_id, {
          user_id: payload.user_id,
          category_id: categoryIdNormalized,
          name: payload.name,
          budgeted_amount: payload.budgeted_amount,
          spent_amount: 0,
          period_type: payload.period_type,
          period_start: payload.period_start,
          period_end: payload.period_end,
          alert_threshold: payload.alert_threshold ?? 80,
          status: payload.status || 'active',
          notes: payload.notes ?? null,
        }) as unknown as RawBudgetRow;
        setRows(prev => [created, ...prev]);
        toast.success('Presupuesto creado (modo offline)');
        return created;
      } else {
        const { data, error } = await supabase
          .from('budgets')
          .insert({
            user_id: payload.user_id,
            category_id: categoryIdNormalized,
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
        
        // Track budget creation
        analytics.track('budget_created', {
          period_type: payload.period_type,
          budgeted_amount: payload.budgeted_amount,
          has_category: !!categoryIdNormalized,
          alert_threshold: payload.alert_threshold,
        });
        
        toast.success('Presupuesto creado');
        return data as unknown as RawBudgetRow;
      }
    } catch (e) {
      console.error('Error creando presupuesto', e);
      // Mensajes más específicos según código de error de Postgres / RLS
      const code = e?.code;
      if (code === '23505') {
        toast.error('Presupuesto duplicado (violación UNIQUE)');
      } else if (code === '42501') {
        toast.error('Permisos insuficientes (RLS). Revisa las policies de budgets');
      } else if (code === '23514') {
        toast.error('Valor inválido (CHECK constraint). Verifica monto y fechas');
      } else if (typeof e?.message === 'string' && e.message.toLowerCase().includes('column') && e.message.toLowerCase().includes('does not exist')) {
        toast.error('Esquema de budgets desactualizado. Aplica la migración de budgets en Supabase');
        // Como alternativa inmediata, activamos localMode automáticamente para no bloquear UX
        if (user?.id) {
          setLocalMode(true);
          const categoryIdNormalized = payload.category_id && `${payload.category_id}`.trim() !== '' ? payload.category_id : null;
          const created = addLocalBudget(user.id, {
            user_id: user.id,
            category_id: categoryIdNormalized,
            name: payload.name,
            budgeted_amount: payload.budgeted_amount,
            spent_amount: 0,
            period_type: payload.period_type,
            period_start: payload.period_start,
            period_end: payload.period_end,
            alert_threshold: payload.alert_threshold ?? 80,
            status: payload.status || 'active',
            notes: payload.notes ?? null,
          }) as unknown as RawBudgetRow;
          setRows(prev => [created, ...prev]);
          toast.success('Presupuesto creado en modo offline por incompatibilidad de esquema');
          return created;
        }
      } else {
        toast.error('No se pudo crear presupuesto');
      }
      if (import.meta?.env?.DEV) {
        // Mostrar detalle en consola para depuración local
        console.debug('[createBudget][debug]', { message: e?.message, details: e });
      }
      return undefined;
    }
  }, [localMode, user?.id]);

  const getCurrentPeriod = () => {
    const today = new Date();
    return aggregated.find(a => today >= new Date(a.period_start) && today <= new Date(a.period_end));
  };

  return {
    // loading real de budgets: si auth sigue cargando exponemos true para que la UI pueda mostrar skeleton único
    loading: authLoading || loading,
    error,
    rows,
    aggregated,
    refetch: fetchBudgets,
    getCurrentPeriod,
    createBudget,
    authLoading, // exportamos por si alguna UI quiere distinguir estados
    localMode,
    localCount: user ? loadLocalBudgets(user.id).length : 0,
    syncLocalToServer,
  };
}
