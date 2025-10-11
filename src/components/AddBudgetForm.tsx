import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CalendarIcon, Plus } from 'lucide-react';
import { useBudgets } from '@/hooks/useBudgets';
import { useAuth } from '@/hooks/useAuth';
import { useFinancialCategories } from '@/hooks/useFinancialCategories';
import { toast } from 'sonner';

interface Props { 
  onCreated?: () => void; 
  triggerLabel?: string;
}

export const AddBudgetForm: React.FC<Props> = ({ onCreated, triggerLabel = 'Nuevo Presupuesto' }) => {
  const [open, setOpen] = useState(false);
  const [categoryId, setCategoryId] = useState<string>('');
  const [amount, setAmount] = useState('');
  const [name, setName] = useState('');
  const [threshold, setThreshold] = useState('80');
  const [touched, setTouched] = useState<{amount:boolean; category:boolean}>({amount:false, category:false});
  const [loading, setLoading] = useState(false);
  const { createBudget } = useBudgets();
  const { user } = useAuth();
  const { getExpenseCategories } = useFinancialCategories();
  const expenseCategories = getExpenseCategories();

  const today = new Date();
  const start = new Date(today.getFullYear(), today.getMonth(), 1).toISOString().slice(0,10);
  const end = new Date(today.getFullYear(), today.getMonth()+1, 0).toISOString().slice(0,10);

  // Autocompletar nombre si está vacío al abrir o mes cambia
  useEffect(() => {
    if (!name) {
      const monthName = today.toLocaleDateString('es-AR', { month: 'long', year: 'numeric' });
      setName(`Presupuesto ${monthName.charAt(0).toUpperCase()}${monthName.slice(1)}`);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const amountNumber = parseFloat(amount);
  // Categoría ahora es opcional (permite presupuesto general)
  const isValid = !!amount && amountNumber > 0;

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    if (!isValid) {
      toast.error('Revisa los campos marcados');
      return;
    }
    setLoading(true);
    const numeric = amountNumber;
    try {
      const created = await createBudget({
        user_id: user.id,
        category_id: categoryId,
        name: name || 'Presupuesto Mensual',
        budgeted_amount: numeric,
        period_type: 'monthly',
        period_start: start,
        period_end: end,
        alert_threshold: parseFloat(threshold) || 80,
        notes: null,
        status: 'active'
      });
      if (created) {
        setOpen(false);
        setAmount('');
        setCategoryId('');
        setName('');
        if (onCreated) onCreated();
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-blue-600 hover:bg-blue-700">
          <Plus className="h-4 w-4 mr-2" /> {triggerLabel}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Crear Presupuesto</DialogTitle>
          <DialogDescription>
            Define un presupuesto para el mes actual. La categoría es opcional; si la omites, el presupuesto será general.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={onSubmit} className="space-y-4">
          <div className="space-y-1">
            <label className="text-sm font-medium">Nombre</label>
            <Input value={name} onChange={e => setName(e.target.value)} placeholder="Presupuesto Octubre" />
          </div>
          <div className="space-y-1">
            <label className="text-sm font-medium">Categoría (opcional)</label>
            <Select value={categoryId} onValueChange={(v)=>{ setCategoryId(v === '__none__' ? '' : v); setTouched(t=>({...t, category:true})); }}>
              <SelectTrigger>
                <SelectValue placeholder="Selecciona categoría (opcional)" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="__none__">Sin categoría (general)</SelectItem>
                {expenseCategories.map(cat => (
                  <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                ))}
                {expenseCategories.length === 0 && (
                  <div className="px-3 py-2 text-xs text-muted-foreground">No hay categorías de gasto. Crea una primero.</div>
                )}
              </SelectContent>
            </Select>
            {/* La categoría ahora no es requerida */}
          </div>
          <div className="space-y-1">
            <label className="text-sm font-medium">Monto</label>
            <Input 
              type="number" 
              min="0" 
              step="0.01" 
              value={amount} 
              onChange={e => { setAmount(e.target.value); setTouched(t=>({...t, amount:true})); }} 
              placeholder="500" 
            />
            {touched.amount && (!amount || amountNumber <= 0) && (<p className="text-xs text-red-500">Ingresa un monto mayor a 0</p>)}
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-sm font-medium">Inicio</label>
              <div className="flex items-center text-sm text-gray-600 bg-gray-50 rounded px-3 h-10"><CalendarIcon className="h-4 w-4 mr-2" />{start}</div>
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium">Fin</label>
              <div className="flex items-center text-sm text-gray-600 bg-gray-50 rounded px-3 h-10"><CalendarIcon className="h-4 w-4 mr-2" />{end}</div>
            </div>
          </div>
          <div className="space-y-1">
            <label className="text-sm font-medium">Alerta (%)</label>
            <Input type="number" min="1" max="100" value={threshold} onChange={e => setThreshold(e.target.value)} />
          </div>
          <div className="pt-2 flex justify-end space-x-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancelar</Button>
            <Button type="submit" disabled={loading || !isValid}>{loading ? 'Creando...' : 'Crear'}</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
