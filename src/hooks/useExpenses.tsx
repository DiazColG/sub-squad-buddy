import { useCallback, useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import type { Database } from '@/integrations/supabase/types';
import { useExpensePayments } from '@/hooks/useExpensePayments';

export type ExpenseRow = Database['public']['Tables']['expenses']['Row'];
export type CreateExpense = Database['public']['Tables']['expenses']['Insert'];
export type UpdateExpense = Database['public']['Tables']['expenses']['Update'];

export function useExpenses() {
  const { user } = useAuth();
  const [expenses, setExpenses] = useState<ExpenseRow[]>([]);
  const [loading, setLoading] = useState(true);
  const paymentsApi = useExpensePayments();
  
  const monthKey = (d: Date | string) => {
    const date = typeof d === 'string' ? new Date(d) : d;
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    return `${y}-${m}`;
  };

  const addDays = (date: Date, days: number) => {
    const d = new Date(date);
    d.setDate(d.getDate() + days);
    return d;
  };

  const hasTag = (e: ExpenseRow, tag: string) => Array.isArray(e.tags) && e.tags.includes(tag);
  const getTagValue = (e: ExpenseRow, prefix: string) => {
    if (!Array.isArray(e.tags)) return undefined;
    const found = e.tags.find(t => t.startsWith(prefix));
    return found ? found.substring(prefix.length) : undefined;
  };

  const fetchExpenses = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('expenses')
        .select('*')
        .eq('user_id', user.id)
        .order('transaction_date', { ascending: false });
      if (error) throw error;
      setExpenses((data as ExpenseRow[]) || []);
    } catch (err) {
      console.error('Error fetching expenses:', err);
      toast.error('Error al cargar gastos');
    } finally {
      setLoading(false);
    }
  }, [user]);

  const addExpense = async (payload: Omit<CreateExpense, 'user_id'>, options?: { silent?: boolean }) => {
    if (!user) return undefined;
    try {
      const insertData: CreateExpense = { ...payload, user_id: user.id };
      const { data, error } = await supabase
        .from('expenses')
        .insert([insertData])
        .select()
        .single();
      if (error) throw error;
      const created = data as ExpenseRow;
      setExpenses(prev => [created, ...prev]);
      if (!options?.silent) toast.success('Gasto agregado');
      return created;
    } catch (err) {
      // Supabase/Postgrest error detail surfacing with safe typing
      const e = (err as { message?: string; error_description?: string; details?: string; hint?: string; code?: string }) || {};
      const msg = e.message || e.error_description || 'Error al agregar gasto';
      const details = e.details || e.hint;
      console.error('Error adding expense:', err);

      // Fallback path for CASE trigger errors: retry minimal insert, then update
      const caseRegex = /case\s+not\s+found|missing\s+else|case\s+statement/i;
      if (caseRegex.test(`${msg} ${details || ''}`)) {
        try {
          console.warn('[useExpenses.addExpense] CASE error detected, retrying with minimal insert');
          const { name, amount, transaction_date } = payload as { name: string; amount: number; transaction_date?: string };
          const minimal: CreateExpense = {
            user_id: user.id,
            name,
            amount,
            transaction_date: transaction_date || new Date().toISOString().slice(0, 10),
          };
          const { data: mdata, error: merr } = await supabase
            .from('expenses')
            .insert([minimal])
            .select()
            .single();
          if (!merr && mdata) {
            const created = mdata as ExpenseRow;
            setExpenses(prev => [created, ...prev]);
            if (!options?.silent) toast.success('Gasto agregado (modo compatible)');
            // Best-effort patch with remaining fields (skip minimal ones and user_id)
            const { name: _n, amount: _a, transaction_date: _d, user_id: _uid, ...rest } = (payload as unknown as UpdateExpense);
            if (Object.keys(rest || {}).length > 0) {
              try {
                await supabase.from('expenses').update(rest as UpdateExpense).eq('id', created.id);
              } catch (uerr) {
                console.warn('[useExpenses.addExpense] Post-insert update failed:', uerr);
              }
            }
            return created;
          }
        } catch (retryErr) {
          console.warn('[useExpenses.addExpense] Minimal insert retry failed:', retryErr);
        }
      }

      if (!options?.silent) toast.error(details ? `${msg}: ${details}` : msg);
      return undefined;
    }
  };

  // Bulk insert utility for multiple expenses with a single toast
  const addExpensesBulk = async (payloads: Array<Omit<CreateExpense, 'user_id'>>, options?: { silent?: boolean }) => {
    if (!user || payloads.length === 0) return [] as ExpenseRow[];
    try {
      const insertData = payloads.map(p => ({ ...p, user_id: user.id })) as CreateExpense[];
      const { data, error } = await supabase
        .from('expenses')
        .insert(insertData)
        .select();
      if (error) throw error;
      const created = (data as ExpenseRow[]) || [];
      setExpenses(prev => [...created, ...prev]);
      if (!options?.silent) toast.success(`Gastos agregados (${created.length})`);
      return created;
    } catch (err) {
      console.error('Error adding expenses bulk:', err);
      if (!options?.silent) toast.error('Error al crear las cuotas');
      return [] as ExpenseRow[];
    }
  };

  const updateExpense = async (id: string, updates: UpdateExpense) => {
    try {
      const { data, error } = await supabase
        .from('expenses')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      const updated = data as ExpenseRow;
      setExpenses(prev => prev.map(e => (e.id === id ? updated : e)));
      toast.success('Gasto actualizado');
      return updated;
    } catch (err) {
      console.error('Error updating expense:', err);
      toast.error('Error al actualizar gasto');
      return undefined;
    }
  };

  const deleteExpense = async (id: string) => {
    try {
      const { error } = await supabase.from('expenses').delete().eq('id', id);
      if (error) throw error;
      setExpenses(prev => prev.filter(e => e.id !== id));
      toast.success('Gasto eliminado');
      return true;
    } catch (err) {
      console.error('Error deleting expense:', err);
      toast.error('Error al eliminar gasto');
      return false;
    }
  };

  useEffect(() => {
    fetchExpenses();
  }, [fetchExpenses]);

  // Recurrence helpers
  const getRecurringTemplates = () => expenses.filter(e => Boolean(e.is_recurring));

  const getInstancesForMonth = (year: number, month: number) => {
    const key = `${year}-${String(month).padStart(2, '0')}`;
    return expenses.filter(e =>
      Array.isArray(e.tags) && e.tags.some(t => t === 'recurrence-instance' || t.startsWith('recurrence-of:')) &&
      monthKey(e.transaction_date) === key
    );
  };

  const hasInstanceForTemplateInMonth = (templateId: string, year: number, month: number) => {
    const key = `${year}-${String(month).padStart(2, '0')}`;
    return expenses.some(e =>
      Array.isArray(e.tags) && e.tags.includes('recurrence-instance') &&
      e.tags.includes(`recurrence-of:${templateId}`) &&
      monthKey(e.transaction_date) === key
    );
  };

  // Simple normalization helper for duplicate detection
  const normalize = (s?: string | null) => (s || '').trim().toLowerCase();

  // Find possible duplicates by name within the month of the provided date
  const findDuplicatesByNameInMonth = (name: string, date: string) => {
    const key = monthKey(date);
    const norm = normalize(name);
    return expenses.filter(e =>
      !e.is_recurring &&
      monthKey(e.transaction_date) === key &&
      normalize(e.name) === norm
    );
  };

  // Find duplicates for a template in a given month (by exact template instance or by matching name)
  const findDuplicatesForTemplateInMonth = (templateId: string, date?: string) => {
    const template = expenses.find(e => e.id === templateId);
    if (!template) return [] as ExpenseRow[];
    const targetDate = (date ?? new Date().toISOString().slice(0, 10));
    const key = monthKey(targetDate);
    const byTemplate = expenses.filter(e =>
      Array.isArray(e.tags) &&
      e.tags.includes('recurrence-instance') &&
      e.tags.includes(`recurrence-of:${templateId}`) &&
      monthKey(e.transaction_date) === key
    );
    const byName = findDuplicatesByNameInMonth(template.name || '', targetDate);
    const map = new Map<string, ExpenseRow>();
    [...byTemplate, ...byName].forEach(e => map.set(e.id, e));
    return Array.from(map.values());
  };

  const getPendingRecurringForMonth = (date: Date = new Date()) => {
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const templates = getRecurringTemplates();
    return templates
      .filter(t => !hasInstanceForTemplateInMonth(t.id, year, month))
      .map(t => {
        const day = t.recurring_day && t.recurring_day >= 1 && t.recurring_day <= 31 ? t.recurring_day : 1;
        const suggestedDate = new Date(year, month - 1, day);
        const snoozedUntil = getTagValue(t, 'snoozed-until:');
        const snoozedDate = snoozedUntil ? new Date(snoozedUntil) : undefined;
        const today = new Date();
        const lastInstance = expenses
          .filter(e => Array.isArray(e.tags) && e.tags.includes('recurrence-instance') && e.tags.includes(`recurrence-of:${t.id}`))
          .sort((a, b) => (a.transaction_date > b.transaction_date ? -1 : 1))[0];
        const last3 = expenses
          .filter(e => Array.isArray(e.tags) && e.tags.includes('recurrence-instance') && e.tags.includes(`recurrence-of:${t.id}`))
          .sort((a, b) => (a.transaction_date > b.transaction_date ? -1 : 1))
          .slice(0, 3);
        const avg3 = last3.length > 0 ? last3.reduce((s, it) => s + (it.amount || 0), 0) / last3.length : undefined;
        return {
          template: t,
          suggested: {
            amount: (avg3 ?? lastInstance?.amount ?? t.amount),
            date: suggestedDate.toISOString().slice(0, 10),
          },
          snoozed: snoozedDate && snoozedDate > today
        };
      })
      .filter(x => !x.snoozed);
  };

  const snoozeRecurringTemplate = async (templateId: string, days: number = 7) => {
    const template = expenses.find(e => e.id === templateId);
    if (!template) return undefined;
    const until = addDays(new Date(), days).toISOString().slice(0, 10);
    const newTags = [
      ...(template.tags || []).filter(t => !t.startsWith('snoozed-until:')),
      `snoozed-until:${until}`
    ];
    return updateExpense(templateId, { tags: newTags });
  };

  // removed autopay flow

  const getDueSoonRecurring = (referenceDate: Date = new Date()) => {
    const items = getPendingRecurringForMonth(referenceDate);
    const today = new Date(referenceDate.toISOString().slice(0, 10));
    return items.filter(item => {
      const reminderTag = getTagValue(item.template, 'reminder-days:');
      const remindDays = reminderTag ? Number(reminderTag) : 3;
      const due = new Date(item.suggested.date);
      const diff = Math.ceil((due.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
      return diff >= 0 && diff <= remindDays;
    });
  };

  const confirmAllPendingForMonth = async (date: Date = new Date()) => {
    const items = getPendingRecurringForMonth(date);
    let count = 0;
    for (const it of items) {
      const created = await confirmRecurringForMonth(it.template.id, { amount: it.suggested.amount, date: it.suggested.date });
      if (created) count++;
    }
    if (count > 0) toast.success(`Confirmados ${count} recurrentes`);
    else toast.info('No hay recurrentes pendientes');
    return count;
  };

  const isExpensePaid = (e: ExpenseRow) => Array.isArray(e.tags) && e.tags.includes('paid');
  const markExpensePaid = async (id: string, paidAt?: string, options?: { silent?: boolean }) => {
    const exp = expenses.find(e => e.id === id);
    if (!exp) return undefined;
    if (isExpensePaid(exp)) return exp;
    const dateStr = (paidAt ? new Date(paidAt) : new Date()).toISOString().slice(0, 10);
    const newTags = [ ...(exp.tags || []), 'paid', `paid-at:${dateStr}` ];
    // First, write payment record (idempotent by expense_id)
    const currency = exp.currency || 'USD';
    await paymentsApi.upsertPayment({ expense_id: id, amount: exp.amount, currency, paid_at: dateStr }, { silent: options?.silent });
    const updated = await updateExpense(id, { tags: newTags });
    if (updated && !options?.silent) toast.success('Marcado como pagado');
    return updated;
  };

  const undoExpensePaid = async (id: string) => {
    const exp = expenses.find(e => e.id === id);
    if (!exp) return undefined;
    // Remove payment record if exists
    const pay = paymentsApi.getByExpense(id)[0];
    if (pay) await paymentsApi.deletePayment(pay.id);
    const filtered = (exp.tags || []).filter(t => t !== 'paid' && !t.startsWith('paid-at:'));
    const updated = await updateExpense(id, { tags: filtered });
    if (updated) toast.success('Pago desmarcado');
    return updated;
  };

  const confirmRecurringForMonth = async (
    templateId: string,
    options?: { amount?: number; date?: string; currency?: string }
  ) => {
    const template = expenses.find(e => e.id === templateId);
    if (!template) {
      toast.error('Plantilla no encontrada');
      return undefined;
    }
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth() + 1;
    if (hasInstanceForTemplateInMonth(templateId, year, month)) {
      toast.info('Ya confirmado este mes');
      return undefined;
    }
    const day = template.recurring_day && template.recurring_day >= 1 && template.recurring_day <= 31 ? template.recurring_day : 1;
    const defaultDate = new Date(year, month - 1, day).toISOString().slice(0, 10);
    const payload: Omit<CreateExpense, 'user_id'> = {
      name: template.name,
      amount: options?.amount ?? template.amount,
      frequency: template.frequency,
      transaction_date: options?.date ?? defaultDate,
      category_id: template.category_id,
      description: template.description,
      is_recurring: false,
      recurring_day: null,
      card_id: template.card_id,
      currency: options?.currency ?? template.currency,
      due_date: template.due_date,
      expense_type: template.expense_type,
      flexibility_level: template.flexibility_level,
      is_business_expense: template.is_business_expense,
      is_tax_deductible: template.is_tax_deductible,
      location: template.location,
      monthly_amount: template.monthly_amount,
      necessity_score: template.necessity_score,
      notes: template.notes,
      optimization_potential: template.optimization_potential,
      optimization_tags: template.optimization_tags,
      payment_method: template.payment_method,
      receipt_url: null,
      tags: [
        ...(template.tags || []).filter(t => !t.startsWith('recurrence-of:') && t !== 'recurrent-template'),
        'recurrence-instance',
        `recurrence-of:${template.id}`,
        `month:${monthKey(options?.date ?? defaultDate)}`
      ],
      updated_at: null,
      created_at: null,
      vendor_name: template.vendor_name,
    };
    const created = await addExpense(payload);
    return created;
  };

  return {
    expenses,
    loading,
    addExpense,
    addExpensesBulk,
    updateExpense,
    deleteExpense,
    refetch: fetchExpenses,
    // recurrence utils
    getRecurringTemplates,
    getInstancesForMonth,
    getPendingRecurringForMonth,
    confirmRecurringForMonth,
    confirmAllPendingForMonth,
    snoozeRecurringTemplate,
    getDueSoonRecurring,
    isExpensePaid,
    markExpensePaid,
    undoExpensePaid,
    // duplicate detection utils
    findDuplicatesByNameInMonth,
    findDuplicatesForTemplateInMonth,
  };
}
