import { useEffect, useState, ReactNode } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useIncomes } from '@/hooks/useIncomes';
import { useExpenses } from '@/hooks/useExpenses';
import { useIncomeReceipts } from '@/hooks/useIncomeReceipts';
import { useExpensePayments } from '@/hooks/useExpensePayments';
import { useBudgets } from '@/hooks/useBudgets';
import { useSavingsGoals } from '@/hooks/useSavingsGoals';

interface DevPanelProps {
  visible: boolean;
  onClose: () => void;
  onRefetchAll: () => void;
}

// Minimal badge component (avoid importing extra UI if not needed)
function Badge({ children, variant = 'default' }: { children: ReactNode; variant?: 'default' | 'warn' | 'ok' }) {
  const base = 'inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium';
  const styles = {
    default: 'bg-muted text-foreground',
    warn: 'bg-yellow-500/20 text-yellow-600 dark:text-yellow-400',
    ok: 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400'
  }[variant];
  return <span className={`${base} ${styles}`}>{children}</span>;
}

export const DevPanel: React.FC<DevPanelProps> = ({ visible, onClose, onRefetchAll }) => {
  const { user } = useAuth();
  const incomes = useIncomes();
  const expenses = useExpenses();
  const receipts = useIncomeReceipts();
  const payments = useExpensePayments();
  const budgets = useBudgets();
  const goals = useSavingsGoals();

  // Simple derived diagnostics
  const hasReceipts = receipts.receipts?.length > 0;
  const hasPayments = payments.payments?.length > 0;
  const incomeCount = incomes.incomes.length;
  const expenseCount = expenses.expenses.length;
  const budgetsCount = budgets.rows.length;
  const goalsCount = goals.goals.length;

  const now = new Date();
  const currentBudget = budgets.getCurrentPeriod?.();

  // Guard: don't render at all if not visible (avoid mounting heavy hooks repeatedly) — though hooks already mounted.
  if (!visible) return null;

  return (
    <div
      className="fixed z-[200] top-4 right-4 w-[380px] max-h-[80vh] overflow-auto rounded-lg border bg-background/95 backdrop-blur shadow-lg text-sm p-4 flex flex-col gap-3"
      style={{ fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, Liberation Mono, monospace' }}
    >
      <div className="flex items-center justify-between gap-2">
        <h2 className="text-xs font-semibold tracking-wide text-muted-foreground">DEV PANEL</h2>
        <div className="flex items-center gap-2">
          <button onClick={onRefetchAll} className="text-xs px-2 py-1 rounded bg-muted hover:bg-muted/80 transition">Refetch</button>
          <button onClick={onClose} className="text-xs px-2 py-1 rounded bg-destructive/90 text-destructive-foreground hover:bg-destructive transition">✕</button>
        </div>
      </div>
      <section className="space-y-1">
        <div className="flex justify-between"><span>User</span><span>{user ? user.email : '—'}</span></div>
        <div className="flex justify-between"><span>UserId</span><span className="truncate max-w-[180px]">{user?.id || '—'}</span></div>
        <div className="flex justify-between"><span>Time</span><span>{now.toLocaleTimeString()}</span></div>
        <div className="flex justify-between"><span>Env</span><span>{import.meta.env.MODE}</span></div>
      </section>
      <hr className="border-border/60" />
      <section className="space-y-1">
        <div className="flex justify-between"><span>Incomes</span><span>{incomeCount}</span></div>
        <div className="flex justify-between"><span>Expenses</span><span>{expenseCount}</span></div>
        <div className="flex justify-between"><span>Receipts</span><span>{receipts.receipts?.length || 0}</span></div>
        <div className="flex justify-between"><span>Payments</span><span>{payments.payments?.length || 0}</span></div>
        <div className="flex justify-between"><span>Budgets</span><span>{budgetsCount}</span></div>
        <div className="flex justify-between"><span>Goals</span><span>{goalsCount}</span></div>
      </section>
      <hr className="border-border/60" />
      <section className="space-y-2">
        <div className="flex items-center justify-between">
          <span>Receipts Data</span>
          <Badge variant={hasReceipts ? 'ok' : 'warn'}>{hasReceipts ? 'ok' : 'none'}</Badge>
        </div>
        <div className="flex items-center justify-between">
          <span>Payments Data</span>
          <Badge variant={hasPayments ? 'ok' : 'warn'}>{hasPayments ? 'ok' : 'none'}</Badge>
        </div>
        <div className="flex items-center justify-between">
          <span>Budget Current</span>
          <Badge variant={currentBudget ? 'ok' : 'warn'}>{currentBudget ? 'yes' : 'no'}</Badge>
        </div>
      </section>
      {currentBudget && (
        <div className="mt-1 border rounded p-2">
            <div className="flex justify-between text-xs"><span>Period</span><span>{currentBudget.period_start} → {currentBudget.period_end}</span></div>
            <div className="flex justify-between text-xs"><span>Total</span><span>{currentBudget.total_budget.toFixed(2)}</span></div>
            <div className="flex justify-between text-xs"><span>Spent</span><span>{currentBudget.total_spent.toFixed(2)}</span></div>
            <div className="flex justify-between text-xs"><span>Rem</span><span>{currentBudget.remaining.toFixed(2)}</span></div>
        </div>
      )}
      <details className="mt-2">
        <summary className="cursor-pointer text-xs uppercase tracking-wide text-muted-foreground">Raw objects</summary>
        <pre className="mt-2 text-[10px] leading-tight max-h-64 overflow-auto bg-muted/30 p-2 rounded">{JSON.stringify({
          incomes: incomes.incomes,
          expenses: expenses.expenses,
          receipts: receipts.receipts,
          payments: payments.payments,
          budgets: budgets.rows.slice(0,10),
          goals: goals.goals.slice(0,10)
        }, null, 2)}</pre>
      </details>
  <p className="text-[10px] text-muted-foreground mt-2">Shortcut: Ctrl + Alt + D (toggle). Sólo en desarrollo.</p>
    </div>
  );
};
