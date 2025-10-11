import { monthKey } from './dateUtils';

export interface BasicIncomeLike {
  amount?: number | null;
  frequency?: string | null;
  is_active?: boolean | null;
  start_date?: string | null;
}

export interface BasicExpenseLike {
  amount?: number | null;
  frequency?: string | null;
  is_recurring?: boolean | null;
  transaction_date?: string | null;
}

// Normaliza un monto recurrente a su equivalente mensual aproximado
export function normalizeRecurring(amount: number, frequency?: string | null) {
  if (!amount) return 0;
  switch (frequency) {
    case 'weekly': return amount * 4.33;
    case 'biweekly': return amount * 2.17;
    case 'quarterly': return amount / 3;
    case 'yearly': return amount / 12;
    case 'daily': return amount * 30; // simple approx
    default: return amount; // monthly / once
  }
}

// Ingresos devengados del mes: suma de ingresos activos cuyo período aplica al mes
export function accruedIncomeForMonth(incomes: BasicIncomeLike[], date: Date): number {
  const key = monthKey(date);
  const endOfMonth = new Date(date.getFullYear(), date.getMonth() + 1, 0);
  return incomes.filter(i => {
    if (!i.is_active) return false;
    if (i.start_date && new Date(i.start_date) > endOfMonth) return false;
    if (i.frequency === 'once' && i.start_date && monthKey(i.start_date) !== key) return false;
    return true;
  }).reduce((s, i) => s + normalizeRecurring(i.amount || 0, i.frequency), 0);
}

// Gastos devengados del mes: gastos variables del mes + gastos recurrentes normalizados
export function accruedExpenseForMonth(expenses: BasicExpenseLike[], date: Date): number {
  const key = monthKey(date);
  const endOfMonth = new Date(date.getFullYear(), date.getMonth() + 1, 0);
  let total = 0;
  for (const e of expenses) {
    // Recurrente: lo contamos como su valor mensual siempre que el inicio (transaction_date) no sea posterior al fin de mes
    if (e.is_recurring) {
      if (e.transaction_date && new Date(e.transaction_date) > endOfMonth) continue;
      total += normalizeRecurring(e.amount || 0, e.frequency);
      continue;
    }
    // Variable / once: sólo si cae en el mes
    if (e.transaction_date && monthKey(e.transaction_date) === key) {
      total += e.amount || 0;
    }
  }
  return total;
}

// Serie devengada para n meses atrás (incluyendo mes actual)
export interface AccruedPoint { period: string; income: number; expenses: number; net: number; savingsRate: number; }

export function accruedSeries(incomes: BasicIncomeLike[], expenses: BasicExpenseLike[], months: string[]): AccruedPoint[] {
  return months.map(period => {
    const d = new Date(period + '-01');
    const income = accruedIncomeForMonth(incomes, d);
    const expense = accruedExpenseForMonth(expenses, d);
    return { period, income, expenses: expense, net: income - expense, savingsRate: income > 0 ? (income - expense) / income : 0 };
  });
}
