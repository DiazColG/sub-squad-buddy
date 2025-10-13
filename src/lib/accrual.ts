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
  card_type?: string | null;
  closing_day?: number | null;
}

// Determina el monthKey efectivo de una transacción según el ciclo de cierre de la tarjeta de crédito.
// Si no es tarjeta de crédito o no hay closing_day, usa el mes de la transacción.
export function effectiveMonthKey(transactionDate: string, cardType?: string | null, closingDay?: number | null): string {
  const tx = new Date(transactionDate);
  if ((cardType === 'credit' || cardType === 'CREDIT') && closingDay && closingDay >= 1 && closingDay <= 31) {
    // Compras posteriores al día de cierre se imputan al resumen del mes siguiente
    if (tx.getDate() > closingDay) {
      const next = new Date(tx.getFullYear(), tx.getMonth() + 1, 1);
      return monthKey(next);
    }
    return monthKey(new Date(tx.getFullYear(), tx.getMonth(), 1));
  }
  return monthKey(tx);
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
    // Variable / once: usamos mes de transacción, salvo tarjetas de crédito con fecha de cierre
    if (e.transaction_date) {
      const tx = new Date(e.transaction_date);
      let effective = monthKey(tx);
      if ((e.card_type === 'credit' || e.card_type === 'CREDIT') && e.closing_day && e.closing_day >= 1 && e.closing_day <= 31) {
        // Si la compra es posterior al día de cierre del mes, cuenta para el resumen del mes siguiente
        if (tx.getDate() > e.closing_day) {
          const nextMonth = new Date(tx.getFullYear(), tx.getMonth() + 1, 1);
          effective = monthKey(nextMonth);
        } else {
          effective = monthKey(new Date(tx.getFullYear(), tx.getMonth(), 1));
        }
      }
      if (effective === key) total += e.amount || 0;
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
