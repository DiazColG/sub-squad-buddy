import React, { useMemo, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
// removed beta gating
import { DollarSign, Plus, TrendingUp, Calendar, Filter, Info, Trash2, Pencil, CheckCircle2, Undo2, History } from 'lucide-react';
import { useUserProfile } from '@/hooks/useUserProfile';
import { useCurrencyExchange } from '@/hooks/useCurrencyExchange';
import { useIncomes, type UpdateIncome } from '@/hooks/useIncomes';
import { useIncomeReceipts } from '@/hooks/useIncomeReceipts';
import AddIncomeForm from '@/components/AddIncomeForm';
import AddSalariedIncomeForm from '@/components/AddSalariedIncomeForm';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import IncomeHistory from '../components/IncomeHistory';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

const IncomeManagement = () => {
  // removed beta gating usage
  const [showAddForm, setShowAddForm] = useState(false);
  const { profile } = useUserProfile();
  const { formatCurrency: fmt, convertCurrency } = useCurrencyExchange();
  const userCurrency = profile?.primary_display_currency || 'USD';

  const { incomes, loading, updateIncome, deleteIncome, isIncomeReceivedForMonth, markIncomeReceivedForMonth, clearIncomeReceivedForMonth } = useIncomes();
  const receiptsApi = useIncomeReceipts();

  // removed beta gating

  const formatCurrency = (amount: number) => fmt(amount, userCurrency);
  const getIncomeCurrency = (tags?: string[] | null) => {
    const t = (tags || []).find(x => x.startsWith('currency:'));
    return t ? t.replace('currency:', '') : userCurrency;
  };

  const getFrequencyLabel = (frequency: string) => {
    const labels = {
      once: 'Una vez',
      weekly: 'Semanal',
      biweekly: 'Quincenal', 
      monthly: 'Mensual',
      quarterly: 'Trimestral',
      yearly: 'Anual'
    };
    return labels[frequency as keyof typeof labels] || frequency;
  };

  const normalizeMonthly = (amount: number, frequency: string) => {
    switch (frequency) {
      case 'weekly':
        return amount * 4.33;
      case 'biweekly':
        return amount * 2.17;
      case 'quarterly':
        return amount / 3;
      case 'yearly':
        return amount / 12;
      default:
        return amount;
    }
  };

  const monthlyTotal = incomes
    .filter(income => income.is_active)
    .reduce((acc, income) => {
      const incomeCurrency = getIncomeCurrency(income.tags);
      const monthlyAmount = normalizeMonthly(income.amount, income.frequency);
      const converted = convertCurrency(monthlyAmount, incomeCurrency, userCurrency);
      return acc + converted;
    }, 0);

  const [search, setSearch] = useState('');
  // category removed
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'inactive'>('all');
  const [filterFrequency, setFilterFrequency] = useState<string>('all');
  const [editOpen, setEditOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<{ name: string; amount: string; frequency: string; start_date: string; currency: string; description: string; is_active: boolean; payment_day: string | number | null; } | null>(null);
  const [showConverted, setShowConverted] = useState(false);

  const filteredIncomes = useMemo(() => {
    return incomes.filter(i => {
      if (filterStatus !== 'all') {
        if (filterStatus === 'active' && !i.is_active) return false;
        if (filterStatus === 'inactive' && i.is_active) return false;
      }
      if (filterFrequency !== 'all' && i.frequency !== filterFrequency) return false;
      if (search) {
        const q = search.toLowerCase();
        if (!(i.name?.toLowerCase().includes(q) || i.description?.toLowerCase().includes(q))) return false;
      }
      return true;
    });
  }, [incomes, filterStatus, filterFrequency, search]);

  const handleToggleActive = async (id: string, current: boolean) => {
    await updateIncome(id, { is_active: !current } as UpdateIncome);
  };

  const handleDelete = async (id: string) => {
    if (confirm('¿Eliminar este ingreso?')) {
      await deleteIncome(id);
    }
  };

  const handleMarkReceived = async (id: string) => {
    const income = incomes.find(x => x.id === id);
    if (income) {
      const incomeCurrency = getIncomeCurrency(income.tags);
      await receiptsApi.upsertReceipt({ income_id: id, amount: income.amount, currency: incomeCurrency });
    }
    await markIncomeReceivedForMonth(id);
  };

  const handleUndoReceived = async (id: string) => {
    const now = new Date();
    const key = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    const rec = receiptsApi.getByIncome(id).find(r => r.period_month === key);
    if (rec) await receiptsApi.deleteReceipt(rec.id);
    await clearIncomeReceivedForMonth(id);
  };

  const openEdit = (income: { id: string; name: string; amount: number; frequency: string; start_date: string; description: string | null; is_active: boolean; payment_day: number | null; tags?: string[] | null; }) => {
    setEditId(income.id);
    setEditForm({
      name: income.name || '',
      amount: String(income.amount ?? ''),
      frequency: income.frequency || 'monthly',
      start_date: income.start_date || new Date().toISOString().slice(0,10),
      currency: getIncomeCurrency(income.tags),
      description: income.description || '',
      is_active: Boolean(income.is_active),
      payment_day: income.payment_day ? String(income.payment_day) : ''
    });
    setEditOpen(true);
  };

  const saveEdit = async () => {
    if (!editId || !editForm) return;
    const updates: UpdateIncome = {
      name: editForm.name,
      amount: Number(editForm.amount),
      frequency: editForm.frequency as UpdateIncome['frequency'],
      start_date: editForm.start_date,
      description: editForm.description || null,
      is_active: editForm.is_active,
      payment_day: editForm.payment_day ? Number(editForm.payment_day) : null,
      tags: [`currency:${editForm.currency}`],
    } as UpdateIncome;
    await updateIncome(editId, updates);
    setEditOpen(false);
    setEditId(null);
    setEditForm(null);
  };

  // History dialog state
  const [historyFor, setHistoryFor] = useState<string | null>(null);

  return (
      <div className="container mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-foreground flex items-center gap-2">
              <DollarSign className="h-6 w-6 text-green-600" />
              Gestión de Ingresos
            </h1>
            <p className="text-muted-foreground">
              Gestiona y controla todos tus ingresos de manera organizada
            </p>
          </div>
          <Button onClick={() => setShowAddForm(true)} className="gap-2">
            <Plus className="h-4 w-4" />
            Agregar Ingreso
          </Button>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-green-600" />
                Ingresos Mensuales
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {formatCurrency(monthlyTotal)}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Total estimado mensual
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Calendar className="h-4 w-4 text-blue-600" />
                Fuentes Activas
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {incomes.filter(i => i.is_active).length}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Ingresos configurados
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <DollarSign className="h-4 w-4 text-purple-600" />
                Promedio Semanal
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {formatCurrency((monthlyTotal || 0) / 4.33)}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Estimado semanal
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Incomes List */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Mis Ingresos</CardTitle>
                <CardDescription>
                  Lista de todas tus fuentes de ingresos configuradas
                </CardDescription>
              </div>
              <div className="flex items-center gap-2">
                <Input placeholder="Buscar..." value={search} onChange={e => setSearch(e.target.value)} className="w-48" />
                {/* categoría eliminada */}
                <Select value={filterStatus} onValueChange={v => setFilterStatus(v as 'all' | 'active' | 'inactive')}>
                  <SelectTrigger className="w-36"><SelectValue placeholder="Estado" /></SelectTrigger>
                  <SelectContent className="bg-background border shadow-lg">
                    <SelectItem value="all">Todos</SelectItem>
                    <SelectItem value="active">Activos</SelectItem>
                    <SelectItem value="inactive">Inactivos</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={filterFrequency} onValueChange={v => setFilterFrequency(v)}>
                  <SelectTrigger className="w-40"><SelectValue placeholder="Frecuencia" /></SelectTrigger>
                  <SelectContent className="bg-background border shadow-lg">
                    <SelectItem value="all">Todas</SelectItem>
                    <SelectItem value="once">Una vez</SelectItem>
                    <SelectItem value="weekly">Semanal</SelectItem>
                    <SelectItem value="biweekly">Quincenal</SelectItem>
                    <SelectItem value="monthly">Mensual</SelectItem>
                    <SelectItem value="quarterly">Trimestral</SelectItem>
                    <SelectItem value="yearly">Anual</SelectItem>
                  </SelectContent>
                </Select>
                <div className="flex items-center gap-2 pl-2">
                  <Checkbox id="toggle-convert" checked={showConverted} onCheckedChange={v => setShowConverted(Boolean(v))} />
                  <label htmlFor="toggle-convert" className="text-xs text-muted-foreground">Ver en {userCurrency}</label>
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {filteredIncomes.map((income) => (
                <div 
                  key={income.id} 
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                        <DollarSign className="h-5 w-5 text-green-600" />
                      </div>
                      <div>
                        <h3 className="font-medium">{income.name}</h3>
                        <p className="text-sm text-muted-foreground">
                          {income.description}
                        </p>
                        <div className="flex items-center gap-2 flex-wrap mt-1">
                          <Badge variant="outline" className="text-xs">
                            {getFrequencyLabel(income.frequency)}
                          </Badge>
                          {income.payment_day && (
                            <Badge variant="outline" className="text-xs">
                              Día {income.payment_day}
                            </Badge>
                          )}
                          {(() => {
                            const tags = Array.isArray(income.tags) ? income.tags : [];
                            const status = (tags.find(t => t.startsWith('status:')) || 'status:active').replace('status:','');
                            const today = new Date();
                            const due = income.payment_day && income.payment_day <= today.getDate();
                            const received = isIncomeReceivedForMonth(income);
                            const rec = receiptsApi.getByIncome(income.id).find(r => r.period_month === `${today.getFullYear()}-${String(today.getMonth()+1).padStart(2,'0')}`);
                            const base = rec?.received_at ? new Date(rec.received_at) : today;
                            const monthLabel = base.toLocaleString('es-ES', { month: 'short' });
                            const monthText = monthLabel.charAt(0).toUpperCase() + monthLabel.slice(1);
                            const yearText = String(base.getFullYear());
                            return (
                              <>
                                <Badge className={`text-xs ${status==='active' ? 'bg-green-600' : status==='paused' ? 'bg-amber-500' : 'bg-gray-500'}`}>{status==='active'?'Activo':status==='paused'?'Pausado':'Finalizado'}</Badge>
                                {received ? (
                                  <Badge className="text-xs bg-green-700">Recibido</Badge>
                                ) : due ? (
                                  <Badge className="text-xs bg-red-600">Vencido</Badge>
                                ) : (
                                  <Badge variant="secondary" className="text-xs">Pendiente</Badge>
                                )}
                                {/* Mes y año basados en registro de income_receipts si existe */}
                                <Badge variant="outline" className="text-xs">{monthText}</Badge>
                                <Badge variant="outline" className="text-xs">{yearText}</Badge>
                              </>
                            );
                          })()}
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-semibold text-green-600">
                      {(() => {
                        const incomeCcy = getIncomeCurrency(income.tags);
                        const amountToShow = showConverted ? convertCurrency(income.amount, incomeCcy, userCurrency) : income.amount;
                        const ccy = showConverted ? userCurrency : incomeCcy;
                        return fmt(amountToShow, ccy);
                      })()}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {getFrequencyLabel(income.frequency)}
                    </div>
                  </div>
                  <div className="ml-4 flex items-center gap-2">
                    <Button size="icon" variant="ghost" title="Cambiar estado" onClick={() => {/* cycle status through tags */ const tags=Array.isArray(income.tags)?income.tags:[]; const statusTag=tags.find(t=>t.startsWith('status:'))||'status:active'; const cur=statusTag.replace('status:',''); const next=cur==='active'?'paused':cur==='paused'?'ended':'active'; const filtered=tags.filter(t=>!t.startsWith('status:')); updateIncome(income.id,{ tags:[...filtered,`status:${next}`] } as UpdateIncome); }}>
                      <Info className="h-4 w-4" />
                    </Button>
                    <Button size="icon" variant="ghost" title="Ver historial" onClick={() => setHistoryFor(income.id)}>
                      <History className="h-4 w-4" />
                    </Button>
                    {isIncomeReceivedForMonth(income) ? (
                      <Button size="icon" variant="ghost" title="Desmarcar recibido" onClick={() => handleUndoReceived(income.id)}>
                        <Undo2 className="h-4 w-4" />
                      </Button>
                    ) : (
                      <Button size="icon" variant="ghost" title="Marcar recibido" onClick={() => handleMarkReceived(income.id)}>
                        <CheckCircle2 className="h-4 w-4 text-green-600" />
                      </Button>
                    )}
                    <Button size="icon" variant="ghost" title="Editar" onClick={() => openEdit(income)}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button size="icon" variant="ghost" title="Eliminar" onClick={() => handleDelete(income.id)}>
                      <Trash2 className="h-4 w-4 text-red-600" />
                    </Button>
                  </div>
                </div>
              ))}

              {!loading && filteredIncomes.length === 0 && (
                <div className="text-center py-8">
                  <DollarSign className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium mb-2">No hay ingresos configurados</h3>
                  <p className="text-muted-foreground mb-4">
                    Comienza agregando tu primer ingreso para llevar un mejor control
                  </p>
                  <Button onClick={() => setShowAddForm(true)} className="gap-2">
                    <Plus className="h-4 w-4" />
                    Agregar Primer Ingreso
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {showAddForm && (
          <div className="fixed inset-0 bg-black/20 flex items-center justify-center p-4 z-50">
            <div className="max-w-2xl w-full space-y-2">
              <Tabs defaultValue="salaried">
                <TabsList>
                  <TabsTrigger value="salaried">Relación de dependencia</TabsTrigger>
                  <TabsTrigger value="independent">Independiente</TabsTrigger>
                </TabsList>
                <TabsContent value="salaried">
                  <AddSalariedIncomeForm onSuccess={() => setShowAddForm(false)} />
                </TabsContent>
                <TabsContent value="independent">
                  <AddIncomeForm onSuccess={() => setShowAddForm(false)} />
                </TabsContent>
              </Tabs>
              <div className="flex justify-end">
                <Button variant="outline" onClick={() => setShowAddForm(false)}>Cerrar</Button>
              </div>
            </div>
          </div>
        )}

        <Dialog open={editOpen} onOpenChange={setEditOpen}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Editar ingreso</DialogTitle>
            </DialogHeader>
            {editForm && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm">Nombre</label>
                    <Input value={editForm.name} onChange={e => setEditForm({ ...editForm, name: e.target.value })} />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm">Monto</label>
                    <Input type="number" step="0.01" value={editForm.amount} onChange={e => setEditForm({ ...editForm, amount: e.target.value })} />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm">Moneda</label>
                    <Select value={editForm.currency} onValueChange={v => setEditForm({ ...editForm, currency: v })}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent className="bg-background border shadow-lg">
                        {['USD','EUR','ARS','GBP','CAD','AUD','JPY','CHF','SEK','NOK','DKK','BRL','MXN'].map(c => (
                          <SelectItem key={c} value={c}>{c}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm">Frecuencia</label>
                    <Select value={editForm.frequency} onValueChange={v => setEditForm({ ...editForm, frequency: v })}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent className="bg-background border shadow-lg">
                        <SelectItem value="once">Una vez</SelectItem>
                        <SelectItem value="weekly">Semanal</SelectItem>
                        <SelectItem value="biweekly">Quincenal</SelectItem>
                        <SelectItem value="monthly">Mensual</SelectItem>
                        <SelectItem value="quarterly">Trimestral</SelectItem>
                        <SelectItem value="yearly">Anual</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm">Fecha de inicio</label>
                    <Input type="date" value={editForm.start_date} onChange={e => setEditForm({ ...editForm, start_date: e.target.value })} />
                  </div>
                  {/* campo categoría eliminado */}
                  <div className="space-y-2">
                    <label className="text-sm">Día de pago</label>
                    <Input type="number" min={1} max={31} value={editForm.payment_day as string} onChange={e => setEditForm({ ...editForm, payment_day: e.target.value })} />
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <label className="text-sm">Descripción</label>
                    <Input value={editForm.description} onChange={e => setEditForm({ ...editForm, description: e.target.value })} />
                  </div>
                  <div className="flex items-center gap-2 md:col-span-2">
                    <Checkbox id="edit-active" checked={editForm.is_active} onCheckedChange={v => setEditForm({ ...editForm, is_active: Boolean(v) })} />
                    <label htmlFor="edit-active" className="text-sm">Activo</label>
                  </div>
                </div>
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setEditOpen(false)}>Cancelar</Button>
                  <Button onClick={saveEdit}>Guardar cambios</Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Historial dialog */}
        <Dialog open={Boolean(historyFor)} onOpenChange={(open) => { if (!open) setHistoryFor(null); }}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Historial del ingreso</DialogTitle>
            </DialogHeader>
            {historyFor && (
              <IncomeHistory
                incomeId={historyFor}
                getIncomeCurrency={getIncomeCurrency}
                userCurrency={userCurrency}
              />
            )}
          </DialogContent>
        </Dialog>
      </div>
  );
};

export default IncomeManagement;