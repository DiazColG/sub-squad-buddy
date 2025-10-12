import React, { useMemo, useState } from 'react';
import { useIncomeReceipts } from '@/hooks/useIncomeReceipts';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Trash2, Plus, Save } from 'lucide-react';

type Props = {
  incomeId: string;
  getIncomeCurrency: (tags?: string[] | null) => string;
  userCurrency: string;
};

const IncomeHistory: React.FC<Props> = ({ incomeId, userCurrency }) => {
  const { getByIncome, upsertReceipt, deleteReceipt, updateReceipt } = useIncomeReceipts();
  const receipts = getByIncome(incomeId);
  const [form, setForm] = useState<{ amount: string; currency: string; received_at: string }>({
    amount: '',
    currency: userCurrency,
    received_at: new Date().toISOString().slice(0,10)
  });

  const onChange = (k: keyof typeof form, v: string) => setForm(prev => ({ ...prev, [k]: v }));

  const handleAdd = async () => {
    if (!form.amount) return;
    await upsertReceipt({ income_id: incomeId, amount: Number(form.amount), currency: form.currency, received_at: form.received_at });
    setForm({ amount: '', currency: userCurrency, received_at: new Date().toISOString().slice(0,10) });
  };

  const sorted = useMemo(() => receipts.slice().sort((a,b) => (a.received_at < b.received_at ? 1 : -1)), [receipts]);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
        <Input type="date" value={form.received_at} onChange={e => onChange('received_at', e.target.value)} />
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
            <div className="flex-1">
              <div className="text-sm font-medium">{rec.period_month}</div>
              <div className="text-xs text-muted-foreground">Recibido</div>
            </div>
            <div className="flex items-center gap-2">
              <Input type="date" defaultValue={rec.received_at} onBlur={e => { const v = e.target.value; if (v && v !== rec.received_at) updateReceipt(rec.id, { received_at: v }); }} className="w-40" />
              <Input type="number" step="0.01" defaultValue={String(rec.amount)} onBlur={e => { const v = Number(e.target.value); if (!Number.isNaN(v) && v !== rec.amount) updateReceipt(rec.id, { amount: v }); }} className="w-32" />
              <Select value={rec.currency} onValueChange={v => { if (v && v !== rec.currency) updateReceipt(rec.id, { currency: v }); }}>
                <SelectTrigger className="w-28"><SelectValue /></SelectTrigger>
                <SelectContent className="bg-background border shadow-lg">
                  {['USD','EUR','ARS','GBP','CAD','AUD','JPY','CHF','SEK','NOK','DKK','BRL','MXN'].map(c => (
                    <SelectItem key={c} value={c}>{c}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <div className="text-sm font-semibold">{new Intl.NumberFormat(undefined, { style: 'currency', currency: rec.currency }).format(rec.amount)}</div>
              <Button size="icon" variant="ghost" title="Eliminar" onClick={() => deleteReceipt(rec.id)}>
                <Trash2 className="h-4 w-4 text-red-600" />
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default IncomeHistory;
