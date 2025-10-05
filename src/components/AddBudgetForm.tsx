import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CalendarIcon, Plus } from 'lucide-react';
import { useBudgets } from '@/hooks/useBudgets';
import { useAuth } from '@/hooks/useAuth';
import { useFinancialCategories } from '@/hooks/useFinancialCategories';
import { toast } from 'sonner';

interface Props { onCreated?: () => void; }

export const AddBudgetForm: React.FC<Props> = ({ onCreated }) => {
  const [open, setOpen] = useState(false);
  const [categoryId, setCategoryId] = useState<string>('');
  const [amount, setAmount] = useState('');
  const [name, setName] = useState('');
  const [threshold, setThreshold] = useState('80');
  const [loading, setLoading] = useState(false);
  const { createBudget } = useBudgets();
  const { user } = useAuth();
  const { getExpenseCategories } = useFinancialCategories();
  const expenseCategories = getExpenseCategories();

  const today = new Date();
  const start = new Date(today.getFullYear(), today.getMonth(), 1).toISOString().slice(0,10);
  const end = new Date(today.getFullYear(), today.getMonth()+1, 0).toISOString().slice(0,10);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    if (!categoryId || !amount) {
      toast.error('Completa los campos requeridos');
      return;
    }
    setLoading(true);
    const numeric = parseFloat(amount);
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
          <Plus className="h-4 w-4 mr-2" /> Nuevo Presupuesto
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Crear Presupuesto</DialogTitle>
        </DialogHeader>
        <form onSubmit={onSubmit} className="space-y-4">
          <div className="space-y-1">
            <label className="text-sm font-medium">Nombre</label>
            <Input value={name} onChange={e => setName(e.target.value)} placeholder="Presupuesto Octubre" />
          </div>
          <div className="space-y-1">
            <label className="text-sm font-medium">Categoría</label>
            <Select value={categoryId} onValueChange={setCategoryId}>
              <SelectTrigger>
                <SelectValue placeholder="Selecciona categoría" />
              </SelectTrigger>
              <SelectContent>
                {expenseCategories.map(cat => (
                  <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1">
            <label className="text-sm font-medium">Monto</label>
            <Input type="number" min="0" step="0.01" value={amount} onChange={e => setAmount(e.target.value)} placeholder="500" />
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
            <Button type="submit" disabled={loading}>{loading ? 'Creando...' : 'Crear'}</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
