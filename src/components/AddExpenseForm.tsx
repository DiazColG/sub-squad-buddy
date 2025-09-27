import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from 'sonner';
import { useExpenses, CreateExpense } from '@/hooks/useExpenses';
import { useUserProfile } from '@/hooks/useUserProfile';
import { useCards } from '@/hooks/useCards';
import { useFinancialCategories } from '@/hooks/useFinancialCategories';

const frequencyOptions = [
  { value: 'daily', label: 'Diario' },
  { value: 'weekly', label: 'Semanal' },
  { value: 'monthly', label: 'Mensual' },
  { value: 'yearly', label: 'Anual' },
];

export default function AddExpenseForm({ onSuccess }: { onSuccess?: () => void }) {
  const { addExpense } = useExpenses();
  const { getExpenseCategories } = useFinancialCategories();
  const categories = getExpenseCategories();
  const { profile } = useUserProfile();
  const { cards } = useCards();

  const presets = [
    { key: 'rent', label: 'Alquiler', day: 1, names: ['Alquiler', 'Vivienda'] },
    { key: 'hoa', label: 'Expensas', day: 10, names: ['Expensas'] },
    { key: 'electricity', label: 'Luz', day: 15, names: ['Luz', 'Electricidad', 'Servicios'] },
    { key: 'gas', label: 'Gas', day: 15, names: ['Gas', 'Servicios'] },
    { key: 'water', label: 'Agua', day: 15, names: ['Agua', 'Servicios'] },
    { key: 'internet', label: 'Internet', day: 5, names: ['Internet', 'Telecomunicaciones', 'Servicios'] },
    { key: 'mobile', label: 'Celular', day: 5, names: ['Celular', 'Telefonía', 'Servicios'] },
    { key: 'health', label: 'Obra social', day: 1, names: ['Salud', 'Obra social'] },
    { key: 'car-ins', label: 'Seguro auto', day: 10, names: ['Seguros'] },
    { key: 'car-tax', label: 'Patente', day: 20, names: ['Impuestos', 'Patente'] },
  ];

  const [form, setForm] = useState({
    name: '',
    amount: '',
    frequency: 'monthly',
    transaction_date: new Date().toISOString().slice(0, 10),
    category_id: '' as string | null,
    description: '',
   is_recurring: true,
is_variable: false,
recurring_day: '' as string | number | null,
reminder_days: '3',
currency: '' as string,
payment_method: '' as string,
card_id: '' as string,
});
const [submitting, setSubmitting] = useState(false);

  const onChange = (key: string, value: unknown) => setForm(prev => ({ ...prev, [key]: value }));

  const findCategoryIdByNames = (names: string[]) => {
    const lower = names.map(n => n.toLowerCase());
    const match = categories.find(c => lower.includes(c.name.toLowerCase()));
    return match?.id || '';
  };

  const applyPreset = (presetKey: string) => {
    const p = presets.find(x => x.key === presetKey);
    if (!p) return;
    const catId = findCategoryIdByNames(p.names);
    const today = new Date().toISOString().slice(0, 10);
    setForm(prev => ({
      ...prev,
      name: p.label,
      frequency: 'monthly',
      is_recurring: true,
      recurring_day: String(p.day),
      category_id: catId,
      transaction_date: today,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  if (!form.name || !form.amount) {
    toast.error('Completa nombre y monto');
    return;
  }
  // Basic validations per new logic
  if (form.is_recurring) {
    if (!form.frequency) {
      toast.error('Selecciona una frecuencia');
      return;
    }
  }
  setSubmitting(true);
  try {
    const templateTags = [
  ...(form.is_recurring ? ['recurrent-template'] : []),
  ...(form.reminder_days ? [`reminder-days:${form.reminder_days}`] : []),
];
const payload: Omit<CreateExpense, 'user_id'> = {
        name: form.name,
        amount: Number(form.amount),
        frequency: form.frequency as CreateExpense['frequency'],
        transaction_date: form.transaction_date,
        category_id: form.category_id || null,
        description: form.description || null,
        is_recurring: form.is_recurring,
       recurring_day: form.recurring_day ? Number(form.recurring_day) : null,
// new optional fields
card_id: form.card_id || null,
currency: form.currency || (profile?.primary_display_currency || null),
due_date: null,
expense_type: form.is_recurring ? (form.is_variable ? 'variable' : 'fixed') : 'occasional',
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
        tags: templateTags.length ? templateTags : null,
        updated_at: null,
        created_at: null,
        vendor_name: null,
      };
      const created = await addExpense(payload);
      if (created) {
        toast.success('Gasto creado');
        onSuccess?.();
        setForm({
         name: '', amount: '', frequency: 'monthly', transaction_date: new Date().toISOString().slice(0, 10),
category_id: '', description: '', is_recurring: true, is_variable: false, recurring_day: '', reminder_days: '3',
currency: profile?.primary_display_currency || '', payment_method: '', card_id: ''

  return (
    <Card>
      <CardHeader>
        <CardTitle>Agregar gasto</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Presets rápidos */}
          <div className="space-y-2">
            <Label>Rápidos</Label>
            <div className="flex flex-wrap gap-2">
              {presets.map(p => (
                <Button key={p.key} type="button" variant="outline" size="sm" onClick={() => applyPreset(p.key)}>
                  {p.label}
                </Button>
              ))}
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Nombre</Label>
              <Input value={form.name} onChange={e => onChange('name', e.target.value)} placeholder="Alquiler, Supermercado..." />
            </div>
            <div className="space-y-2">
              <Label>Monto</Label>
              <Input type="number" step="0.01" value={form.amount} onChange={e => onChange('amount', e.target.value)} placeholder="0.00" />
           </div>

<div className="flex items-center gap-6 md:col-span-2">
  <div className="flex items-center gap-2">
    <Checkbox
      id="is_recurring"
      checked={form.is_recurring}
      onCheckedChange={(v) => onChange('is_recurring', Boolean(v))}
    />
    <Label htmlFor="is_recurring">Recurrente</Label>
  </div>
  {form.is_recurring && (
    <div className="flex items-center gap-2">
      <Checkbox
        id="is_variable"
        checked={form.is_variable}
        onCheckedChange={(v) => onChange('is_variable', Boolean(v))}
      />
      <Label htmlFor="is_variable">Variable</Label>
    </div>
  )}
</div>

<div className="space-y-2">
  <Label>Moneda</Label>
  <Select
    value={form.currency || (profile?.primary_display_currency || '')}
    onValueChange={(v) => onChange('currency', v)}
  >
    <SelectTrigger>
      <SelectValue placeholder="Selecciona" />
    </SelectTrigger>
    <SelectContent className="bg-background border shadow-lg">
      {['USD', 'EUR', 'ARS', 'BRL', 'CLP', 'UYU'].map((ccy) => (
        <SelectItem key={ccy} value={ccy}>
          {ccy}
        </SelectItem>
      ))}
    </SelectContent>
  </Select>
</div>

<div className="space-y-2">
              <Label>Frecuencia</Label>
              <Select value={form.frequency} onValueChange={v => onChange('frequency', v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent className="bg-background border shadow-lg">
                  {frequencyOptions.map(opt => (<SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Fecha</Label>
              <Input type="date" value={form.transaction_date} onChange={e => onChange('transaction_date', e.target.value)} />
            </div>
            <div className="space-y-2">
             <Label>Categoría</Label>
<Select
  value={form.category_id || 'none'}
  onValueChange={(v) => onChange('category_id', v === 'none' ? '' : v)}
>
  <SelectTrigger>
    <SelectValue placeholder="Selecciona" />
  </SelectTrigger>
                <SelectContent className="bg-background border shadow-lg">
                  <SelectItem value="none">Sin categoría</SelectItem>
                  {categories.map(c => (<SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>))}
                </SelectContent>
              </Select>
            </div>
           <div className="space-y-2">
  <Label>Método de pago</Label>
  <Select
    value={form.payment_method || 'none'}
    onValueChange={(v) => onChange('payment_method', v === 'none' ? '' : v)}
  >
    <SelectTrigger>
      <SelectValue placeholder="Selecciona" />
    </SelectTrigger>
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
    <Select
      value={form.card_id || 'none'}
      onValueChange={(v) => onChange('card_id', v === 'none' ? '' : v)}
    >
      <SelectTrigger>
        <SelectValue placeholder="Selecciona" />
      </SelectTrigger>
      <SelectContent className="bg-background border shadow-lg">
        <SelectItem value="none">Sin tarjeta</SelectItem>
        {cards.map((card) => (
          <SelectItem key={card.id} value={card.id}>
            {`${card.bank_name} •••• ${card.card_last_digits} (${card.card_type})`}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  </div>
)}

<div className="space-y-2">
  <Label>Día de cobro (si es recurrente)</Label>
              <Input type="number" min={1} max={31} value={form.recurring_day as string} onChange={e => onChange('recurring_day', e.target.value)} />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label>Descripción</Label>
              <Input value={form.description} onChange={e => onChange('description', e.target.value)} placeholder="Detalle opcional" />
           </div>

<div className="space-y-2">
              <Label>Recordatorio (días antes)</Label>
              <Input type="number" min={0} max={30} value={form.reminder_days} onChange={e => onChange('reminder_days', e.target.value)} />
            </div>
          </div>
          <div className="flex gap-2 justify-end">
            <Button type="submit" disabled={submitting}>{submitting ? 'Guardando...' : 'Guardar'}</Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
