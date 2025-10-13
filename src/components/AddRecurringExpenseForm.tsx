import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { useExpenses, type CreateExpense } from '@/hooks/useExpenses';
import { useUserProfile } from '@/hooks/useUserProfile';
import { useFinancialCategories } from '@/hooks/useFinancialCategories';
import { useCards } from '@/hooks/useCards';
import { toast } from 'sonner';

export default function AddRecurringExpenseForm({ onSuccess }: { onSuccess?: () => void }) {
  const { addExpense } = useExpenses();
  const { profile } = useUserProfile();
  const { getExpenseCategories } = useFinancialCategories();
  const categories = getExpenseCategories();
  const { cards } = useCards();

  const [form, setForm] = useState({
    name: '',
    amount: '',
    recurring_day: '' as string | number | null,
    category_id: '' as string | null,
    description: '',
    currency: (profile?.primary_display_currency || 'USD') as string,
    payment_method: '' as string,
    card_id: '' as string,
    is_variable: false,
    reminder_days: '3',
  });
  const [submitting, setSubmitting] = useState(false);

  const onChange = (k: string, v: unknown) => setForm(prev => ({ ...prev, [k]: v }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.amount || !form.recurring_day) {
      toast.error('Completá nombre, monto y día');
      return;
    }
    setSubmitting(true);
    try {
      const tags = [
        'recurrent-template',
        ...(form.reminder_days ? [`reminder-days:${form.reminder_days}`] : []),
        ...(form.is_variable ? ['type:variable'] : ['type:fixed']),
      ];
      const payload: Omit<CreateExpense, 'user_id'> = {
        name: form.name,
        amount: Number(form.amount),
        frequency: 'monthly',
        transaction_date: new Date().toISOString().slice(0,10),
        category_id: form.category_id || null,
        description: form.description || null,
        is_recurring: true,
        recurring_day: Number(form.recurring_day),
        card_id: form.card_id || null,
        currency: form.currency || (profile?.primary_display_currency || null),
        due_date: null,
        expense_type: form.is_variable ? 'variable' : 'fixed',
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
        tags,
        updated_at: null,
        created_at: null,
        vendor_name: null,
      };
      const created = await addExpense(payload);
      if (created) {
        toast.success('Plantilla recurrente creada');
        onSuccess?.();
        setForm({
          name: '', amount: '', recurring_day: '', category_id: '', description: '',
          currency: profile?.primary_display_currency || 'USD', payment_method: '', card_id: '', is_variable: false, reminder_days: '3'
        });
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Card>
      <CardContent className="pt-6">
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Nombre</Label>
            <Input value={form.name} onChange={e=>onChange('name', e.target.value)} placeholder="Alquiler, Luz, Internet..." />
          </div>
          <div className="space-y-2">
            <Label>Monto</Label>
            <Input type="number" step="0.01" value={form.amount} onChange={e=>onChange('amount', e.target.value)} placeholder="0.00" />
          </div>
          <div className="space-y-2">
            <Label>Día del mes</Label>
            <Input type="number" min={1} max={31} value={String(form.recurring_day || '')} onChange={e=>onChange('recurring_day', e.target.value)} />
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
          <div className="flex items-center gap-2">
            <Checkbox id="is_variable" checked={form.is_variable} onCheckedChange={v=>onChange('is_variable', Boolean(v))} />
            <Label htmlFor="is_variable">Monto variable</Label>
          </div>
          <div className="space-y-2">
            <Label>Recordatorio (días antes)</Label>
            <Input type="number" min={0} max={30} value={form.reminder_days} onChange={e=>onChange('reminder_days', e.target.value)} />
          </div>
          <div className="md:col-span-2 space-y-2">
            <Label>Descripción (opcional)</Label>
            <Input value={form.description} onChange={e=>onChange('description', e.target.value)} placeholder="Detalle" />
          </div>
          <div className="md:col-span-2 flex justify-end">
            <Button type="submit" disabled={submitting}>{submitting ? 'Guardando...' : 'Guardar'}</Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
