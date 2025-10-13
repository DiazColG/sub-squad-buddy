import React, { useMemo, useState } from 'react';
import { useExpensePayments } from '@/hooks/useExpensePayments';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Trash2, Plus } from 'lucide-react';

type Props = {
  expenseId: string;
  defaultCurrency: string;
};

const ExpenseHistory: React.FC<Props> = ({ expenseId, defaultCurrency }) => {
  const { getByExpense, upsertPayment, deletePayment } = useExpensePayments();
  const payments = getByExpense(expenseId);
  const [form, setForm] = useState<{ amount: string; currency: string; paid_at: string }>(
    { amount: '', currency: defaultCurrency || 'USD', paid_at: new Date().toISOString().slice(0,10) }
  );

  const onChange = (k: keyof typeof form, v: string) => setForm(prev => ({ ...prev, [k]: v }));

  const handleAdd = async () => {
    if (!form.amount) return;
    await upsertPayment({ expense_id: expenseId, amount: Number(form.amount), currency: form.currency, paid_at: form.paid_at });
    setForm({ amount: '', currency: defaultCurrency || 'USD', paid_at: new Date().toISOString().slice(0,10) });
  };

  const sorted = useMemo(() => payments.slice().sort((a,b) => (a.paid_at < b.paid_at ? 1 : -1)), [payments]);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
        <Input type="date" value={form.paid_at} onChange={e => onChange('paid_at', e.target.value)} />
        <Input type="number" step="0.01" placeholder="Monto" value={form.amount} onChange={e => onChange('amount', e.target.value)} />
        <Select value={form.currency} onValueChange={v => onChange('currency', v)}>
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent className="bg-background border shadow-lg">
            {['USD','EUR','ARS','GBP','CAD','AUD','JPY','CHF','SEK','NOK','DKK','BRL','MXN'].map(c => (
              <SelectItem key={c} value={c}>{c}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button onClick={handleAdd} className="gap-2"><Plus className="h-4 w-4" /> Registrar</Button>
      </div>

      <div className="border rounded-md divide-y">
        {sorted.length === 0 && (
          <div className="p-4 text-sm text-muted-foreground">Sin registros aún.</div>
        )}
        {sorted.map(rec => (
          <div key={rec.id} className="p-3 flex items-center justify-between gap-3">
            <div>
              <div className="text-sm font-medium">{rec.period_month}</div>
              <div className="text-xs text-muted-foreground">Pagado: {rec.paid_at}</div>
            </div>
            <div className="flex items-center gap-2">
              <Input
                className="w-28"
                type="number"
                step="0.01"
                value={String(rec.amount)}
                onChange={e => upsertPayment({ expense_id: rec.expense_id, amount: Number(e.target.value || 0), currency: rec.currency, paid_at: rec.paid_at })}
              />
              <Select value={rec.currency} onValueChange={v => upsertPayment({ expense_id: rec.expense_id, amount: rec.amount, currency: v, paid_at: rec.paid_at })}>
                <SelectTrigger className="w-28"><SelectValue /></SelectTrigger>
                <SelectContent className="bg-background border shadow-lg">
                  {['USD','EUR','ARS','GBP','CAD','AUD','JPY','CHF','SEK','NOK','DKK','BRL','MXN'].map(c => (
                    <SelectItem key={c} value={c}>{c}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button size="icon" variant="ghost" title="Eliminar" onClick={() => deletePayment(rec.id)}>
                <Trash2 className="h-4 w-4 text-red-600" />
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ExpenseHistory;
