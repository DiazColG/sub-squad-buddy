import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useExpenses, type CreateExpense } from '@/hooks/useExpenses';
import { useUserProfile } from '@/hooks/useUserProfile';
import { useFinancialCategories } from '@/hooks/useFinancialCategories';
import { useCards } from '@/hooks/useCards';
import { toast } from 'sonner';

export default function AddInstallmentExpenseForm({ onSuccess }: { onSuccess?: () => void }) {
  const { addExpensesBulk } = useExpenses();
  const { profile } = useUserProfile();
  const { getExpenseCategories } = useFinancialCategories();
  const categories = getExpenseCategories();
  const { cards } = useCards();

  const [form, setForm] = useState({
    name: '',
    financed_total: '',
    installments: 1,
    first_due_date: new Date().toISOString().slice(0,10),
    category_id: '' as string | null,
    description: '',
    currency: (profile?.primary_display_currency || 'USD') as string,
    payment_method: '' as string,
    card_id: '' as string,
  });
  const [submitting, setSubmitting] = useState(false);

  const onChange = (k: string, v: unknown) => setForm(prev => ({ ...prev, [k]: v }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.financed_total || !form.first_due_date) {
      toast.error('Completá nombre, total financiado y primer vencimiento');
      return;
    }
    const total = Number(form.financed_total);
    const n = Number(form.installments);
    if (total <= 0 || n < 1) {
      toast.error('Verificá los valores');
      return;
    }
    setSubmitting(true);
    try {
      const perInstallment = Math.round((total / n) * 100) / 100;
      const first = new Date(form.first_due_date);
      // Creamos cada cuota como instancia con tags para agrupar (bulk)
      const groupId = crypto.randomUUID();
      const payloads: Array<Omit<CreateExpense, 'user_id'>> = [];
      for (let i = 0; i < n; i++) {
        const d = new Date(first);
        d.setMonth(d.getMonth() + i);
        payloads.push({
          name: `${form.name} — Cuota ${i+1}/${n}`,
          amount: perInstallment,
          frequency: 'once',
          transaction_date: d.toISOString().slice(0,10),
          category_id: form.category_id || null,
          description: form.description || null,
          is_recurring: false,
          recurring_day: null,
          card_id: form.card_id || null,
          currency: form.currency || (profile?.primary_display_currency || null),
          due_date: d.toISOString().slice(0,10),
          expense_type: 'occasional',
          flexibility_level: null,
          is_business_expense: null,
          is_tax_deductible: null,
          location: null,
          monthly_amount: null,
          necessity_score: null,
          notes: null,
          optimization_potential: null,
          optimization_tags: null,
          payment_method: form.payment_method || null,
          receipt_url: null,
          tags: [
            'installment-instance',
            `installment-group:${groupId}`,
            `installment-index:${i+1}`,
            `installment-total:${n}`,
            `month:${d.toISOString().slice(0,7)}`,
          ],
          updated_at: null,
          created_at: null,
          vendor_name: null,
        });
      }
      const created = await addExpensesBulk(payloads, { silent: true });
      if (created.length === n) {
        toast.success(`Cuotas creadas (${n})`);
      } else if (created.length > 0) {
        toast.warning(`Se crearon ${created.length} de ${n} cuotas`);
      } else {
        // addExpensesBulk ya emitió error, no duplicar
      }
      onSuccess?.();
      setForm({
        name: '', financed_total: '', installments: 1, first_due_date: new Date().toISOString().slice(0,10),
        category_id: '', description: '', currency: profile?.primary_display_currency || 'USD', payment_method: '', card_id: ''
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Card>
      <CardContent className="pt-6">
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Compra</Label>
            <Input value={form.name} onChange={e=>onChange('name', e.target.value)} placeholder="Notebook, Televisor..." />
          </div>
          <div className="space-y-2">
            <Label>Total financiado</Label>
            <Input type="number" step="0.01" value={form.financed_total} onChange={e=>onChange('financed_total', e.target.value)} placeholder="0.00" />
          </div>
          <div className="space-y-2">
            <Label>Cuotas</Label>
            <Select value={String(form.installments)} onValueChange={v=>onChange('installments', Number(v))}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent className="bg-background border shadow-lg">
                {Array.from({ length: 60 }, (_, i) => i + 1).map(num => (
                  <SelectItem key={num} value={String(num)}>{num}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Primer vencimiento</Label>
            <Input type="date" value={form.first_due_date} onChange={e=>onChange('first_due_date', e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>Categoría</Label>
            <Select value={form.category_id || 'none'} onValueChange={v=>onChange('category_id', v==='none'?'':v)}>
              <SelectTrigger><SelectValue placeholder="Selecciona" /></SelectTrigger>
              <SelectContent className="bg-background border shadow-lg">
                <SelectItem value="none">Sin categoría</SelectItem>
                {categories.map(c=> <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Moneda</Label>
            <Select value={form.currency} onValueChange={v=>onChange('currency', v)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent className="bg-background border shadow-lg">
                {['USD','EUR','ARS','BRL','CLP','UYU'].map(ccy => (
                  <SelectItem key={ccy} value={ccy}>{ccy}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Método de pago</Label>
            <Select value={form.payment_method || 'none'} onValueChange={v=>onChange('payment_method', v==='none'?'':v)}>
              <SelectTrigger><SelectValue placeholder="Selecciona" /></SelectTrigger>
              <SelectContent className="bg-background border shadow-lg">
                <SelectItem value="none">Sin método</SelectItem>
                <SelectItem value="cash">Efectivo</SelectItem>
                <SelectItem value="bank_transfer">Transferencia</SelectItem>
                <SelectItem value="debit_card">Débito</SelectItem>
                <SelectItem value="credit_card">Crédito</SelectItem>
                <SelectItem value="crypto">Cripto</SelectItem>
              </SelectContent>
            </Select>
          </div>
          {(form.payment_method === 'credit_card' || form.payment_method === 'debit_card') && (
            <div className="space-y-2">
              <Label>Tarjeta</Label>
              <Select value={form.card_id || 'none'} onValueChange={v=>onChange('card_id', v==='none'?'':v)}>
                <SelectTrigger><SelectValue placeholder="Selecciona" /></SelectTrigger>
                <SelectContent className="bg-background border shadow-lg">
                  <SelectItem value="none">Sin tarjeta</SelectItem>
                  {cards.map(card => (
                    <SelectItem key={card.id} value={card.id}>
                      {`${card.bank_name} •••• ${card.card_last_digits} (${card.card_type})`}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
          <div className="md:col-span-2 space-y-2">
            <Label>Descripción (opcional)</Label>
            <Input value={form.description} onChange={e=>onChange('description', e.target.value)} placeholder="Detalle" />
          </div>
          <div className="md:col-span-2 flex justify-end">
            <Button type="submit" disabled={submitting}>{submitting ? 'Creando...' : 'Crear cuotas'}</Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
