import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
// removed beta gating
import { useFinancialCategories } from '@/hooks/useFinancialCategories';
import { CreditCard, Plus, TrendingDown, Calendar, Filter, Info, DollarSign, Trash2 } from 'lucide-react';
import { useUserProfile } from '@/hooks/useUserProfile';
import { useCurrencyExchange } from '@/hooks/useCurrencyExchange';
import { useExpenses, type ExpenseRow } from '@/hooks/useExpenses';
import { useExpensePayments } from '@/hooks/useExpensePayments';
import AddExpenseTabs from '@/components/AddExpenseTabs';
import ExpenseHistory from '@/components/ExpenseHistory';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';

const ExpenseManagement = () => {
  // removed beta gating usage
  const { categories, isLoading: categoriesLoading } = useFinancialCategories();
  const [showAddForm, setShowAddForm] = useState(false);
  const { profile } = useUserProfile();
  const { formatCurrency: fmt, convertCurrency } = useCurrencyExchange();
  const userCurrency = profile?.primary_display_currency || 'USD';

  // Mock data para demostración
  const { expenses, loading, getPendingRecurringForMonth, confirmRecurringForMonth, confirmAllPendingForMonth, getDueSoonRecurring, snoozeRecurringTemplate, isExpensePaid, markExpensePaid, undoExpensePaid, deleteExpense, findDuplicatesForTemplateInMonth } = useExpenses();
  const paymentsApi = useExpensePayments();
  const [dismissedTemplates, setDismissedTemplates] = useState<string[]>([]);
  const pendingRecurrent = getPendingRecurringForMonth(new Date()).filter(it => !dismissedTemplates.includes(it.template.id));
  const [editingPending, setEditingPending] = useState<{ templateId: string; amount: string; date: string; currency: string } | null>(null);
  const dueSoon = getDueSoonRecurring(new Date());
  const [confirmAllOpen, setConfirmAllOpen] = useState(false);
  const [dupDialog, setDupDialog] = useState<null | { templateId: string; date: string; amount: number; duplicates: ExpenseRow[] }>(null);

  // removed autopay auto-confirm

  // removed beta gating

  // Calcular estadísticas
  const totalMonthlyExpenses = expenses
    .filter(expense => expense.is_recurring ?? true)
    .reduce((sum, expense) => {
      const freq = expense.frequency || 'monthly';
      const fromCcy = expense.currency || userCurrency;
      const base = expense.amount;
      const monthly = (
        freq === 'monthly' ? base :
        freq === 'weekly' ? base * 4.33 :
        freq === 'daily' ? base * 30 :
        freq === 'yearly' ? base / 12 : base
      );
      const converted = convertCurrency(monthly, fromCcy, userCurrency);
      return sum + converted;
    }, 0);

  const totalAnnualExpenses = totalMonthlyExpenses * 12;

  const getFrequencyBadge = (frequency?: string | null) => {
    const colorMap = {
      daily: 'bg-red-100 text-red-800',
      weekly: 'bg-orange-100 text-orange-800', 
      monthly: 'bg-blue-100 text-blue-800',
      yearly: 'bg-green-100 text-green-800'
    };
    
    const labelMap = {
      daily: 'Diario',
      weekly: 'Semanal',
      monthly: 'Mensual', 
      yearly: 'Anual'
    };

    return (
      <Badge className={colorMap[(frequency || 'monthly') as keyof typeof colorMap] || 'bg-gray-100 text-gray-800'}>
        {labelMap[(frequency || 'monthly') as keyof typeof labelMap] || frequency}
      </Badge>
    );
  };

  const formatCurrency = (amount: number) => fmt(amount, userCurrency);
  const formatExpenseAmount = (expense: ExpenseRow) => fmt(expense.amount, expense.currency || userCurrency);
  const [historyFor, setHistoryFor] = useState<string | null>(null);
  const handleDelete = async (id: string) => {
    const confirmed = typeof window !== 'undefined' ? window.confirm('¿Eliminar permanentemente este gasto? Esta acción no se puede deshacer.') : true;
    if (!confirmed) return;
    await deleteExpense(id);
  };

  return (
      <div className="container mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">💸 Gestión de Gastos</h1>
            <p className="text-gray-600 mt-1">Controla y organiza todos tus gastos</p>
          </div>
          <Button 
            onClick={() => setShowAddForm(true)} 
            className="bg-red-600 hover:bg-red-700"
          >
            <Plus className="h-4 w-4 mr-2" />
            Nuevo Gasto
          </Button>
        </div>

        {/* Recordatorios próximos */}
        {dueSoon.length > 0 && (
          <Alert>
            <AlertDescription>
              Tenés {dueSoon.length} gasto(s) recurrente(s) por vencer pronto. ¡Revisá y confirmá!
            </AlertDescription>
          </Alert>
        )}

        {/* Recurrentes de este mes */}
        {pendingRecurrent.length > 0 && (
          <Card className="border-blue-200">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Recurrentes de este mes</CardTitle>
                  <CardDescription>Confirmá o editá los gastos recurrentes pendientes</CardDescription>
                </div>
                <Button variant="outline" size="sm" onClick={() => setConfirmAllOpen(true)}>Confirmar todo</Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {pendingRecurrent.map(item => (
                  <div key={item.template.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <div className="font-medium">{item.template.name}</div>
                      <div className="text-sm text-muted-foreground">Sugerido: {formatCurrency(item.suggested.amount)} • Fecha {item.suggested.date}</div>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" variant="ghost" onClick={() => snoozeRecurringTemplate(item.template.id, 7)}>Posponer 7 días</Button>
                      <Button size="sm" variant="outline" onClick={() => setEditingPending({ templateId: item.template.id, amount: String(item.suggested.amount), date: item.suggested.date, currency: item.template.currency || userCurrency })}>Editar</Button>
                      <Button size="sm" onClick={() => {
                        const dups = findDuplicatesForTemplateInMonth(item.template.id, item.suggested.date);
                        if (dups.length > 0) {
                          setDupDialog({ templateId: item.template.id, date: item.suggested.date, amount: item.suggested.amount, duplicates: dups });
                          return;
                        }
                        confirmRecurringForMonth(item.template.id, { amount: item.suggested.amount, date: item.suggested.date }).then(created => {
                          if (created) setDismissedTemplates(prev => [...prev, item.template.id]);
                        });
                      }}>Confirmar</Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Confirm All Modal */}
        <Dialog open={confirmAllOpen} onOpenChange={setConfirmAllOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Confirmar todos los recurrentes</DialogTitle>
            </DialogHeader>
            <div className="space-y-2">
              <div>Cantidad: {pendingRecurrent.length}</div>
              <div>Total: {formatCurrency(pendingRecurrent.reduce((s, it) => s + (it.suggested.amount || 0), 0))}</div>
            </div>
            <DialogFooter className="flex gap-2 justify-end">
              <Button variant="outline" onClick={() => setConfirmAllOpen(false)}>Cancelar</Button>
              <Button onClick={async () => {
                // confirm-all with duplicate screening: if any has dups, open dialog for the first and stop
                for (const it of pendingRecurrent) {
                  const dups = findDuplicatesForTemplateInMonth(it.template.id, it.suggested.date);
                  if (dups.length > 0) {
                    setConfirmAllOpen(false);
                    setDupDialog({ templateId: it.template.id, date: it.suggested.date, amount: it.suggested.amount, duplicates: dups });
                    return;
                  }
                }
                const count = await confirmAllPendingForMonth(new Date());
                if (count > 0) setDismissedTemplates(prev => [...prev, ...pendingRecurrent.map(p => p.template.id)]);
                setConfirmAllOpen(false);
              }}>Confirmar</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Resumen de gastos */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Gastos Mensuales</CardTitle>
              <TrendingDown className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">
                {formatCurrency(totalMonthlyExpenses)}
              </div>
              <p className="text-xs text-muted-foreground">
                Total de gastos recurrentes
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Gastos Anuales</CardTitle>
              <Calendar className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">
                {formatCurrency(totalAnnualExpenses)}
              </div>
              <p className="text-xs text-muted-foreground">
                Proyección anual
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Gastos Activos</CardTitle>
              <CreditCard className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">
                {expenses.filter(e => e.is_recurring).length}
              </div>
              <p className="text-xs text-muted-foreground">
                Gastos recurrentes
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Lista de gastos */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Tus Gastos</CardTitle>
                <CardDescription>
                  Lista completa de gastos recurrentes
                </CardDescription>
              </div>
              <Button variant="outline" size="sm">
                <Filter className="h-4 w-4 mr-2" />
                Filtros
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {expenses.map((expense) => (
                <div 
                  key={expense.id} 
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
                      <CreditCard className="h-5 w-5 text-red-600" />
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-900">{expense.name}</h3>
                      <p className="text-sm text-gray-600">{expense.description}</p>
                      <div className="flex items-center space-x-2 mt-1 flex-wrap">
                        {getFrequencyBadge(expense.frequency)}
                            {expense.category_id && (
                              <Badge variant="outline" className="text-xs">
                                {categories.find(c => c.id === expense.category_id)?.name || expense.category_id}
                              </Badge>
                            )}
                            {expense.recurring_day && (
                          <Badge variant="secondary" className="text-xs">
                              Día {expense.recurring_day}
                          </Badge>
                        )}
                        {isExpensePaid(expense) && (
                          <Badge className="text-xs bg-green-100 text-green-800">Pagado</Badge>
                        )}
                        {(() => {
                          const pay = paymentsApi.getByExpense(expense.id)[0];
                          const base = pay?.paid_at
                            ? new Date(pay.paid_at)
                            : (expense.transaction_date ? new Date(expense.transaction_date) : new Date());
                          const monthLabel = base.toLocaleString('es-ES', { month: 'short' });
                          const monthText = monthLabel.charAt(0).toUpperCase() + monthLabel.slice(1);
                          const yearText = String(base.getFullYear());
                          return (
                            <>
                              <Badge variant="outline" className="text-xs">{monthText}</Badge>
                              <Badge variant="outline" className="text-xs">{yearText}</Badge>
                            </>
                          );
                        })()}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
        <div className="text-lg font-semibold text-red-600">
          -{formatExpenseAmount(expense)}
        </div>
                    <div className="text-xs text-gray-500">
                          por {(expense.frequency || 'monthly') === 'monthly' ? 'mes' : 
                               (expense.frequency || 'monthly') === 'weekly' ? 'semana' : 
                               (expense.frequency || 'monthly') === 'daily' ? 'día' : 'año'}
                    </div>
                    <div className="mt-2 flex gap-2 justify-end">
                      <Button size="sm" variant="outline" onClick={() => setHistoryFor(expense.id)}>Historial</Button>
                      {!isExpensePaid(expense) && Array.isArray(expense.tags) && expense.tags.includes('recurrence-instance') ? (
                        <Button size="sm" variant="outline" onClick={() => markExpensePaid(expense.id)}>Marcar pagado</Button>
                      ) : isExpensePaid(expense) ? (
                        <Button size="sm" variant="ghost" onClick={() => undoExpensePaid(expense.id)}>Deshacer</Button>
                      ) : null}
                      <Button size="icon" variant="ghost" title="Eliminar" onClick={() => handleDelete(expense.id)}>
                        <Trash2 className="h-4 w-4 text-red-600" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}

              {!loading && expenses.length === 0 && (
                <div className="text-center py-8">
                  <DollarSign className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium mb-2">No hay gastos registrados</h3>
                  <p className="text-muted-foreground mb-4">
                    Agrega tu primer gasto para comenzar a realizar seguimiento
                  </p>
                  <Button onClick={() => setShowAddForm(true)} className="gap-2">
                    <Plus className="h-4 w-4" />
                    Agregar Primer Gasto
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Edit pending inline modal */}
        {editingPending && (
          <div className="fixed inset-0 bg-black/20 flex items-center justify-center p-4 z-50">
            <div className="bg-background border rounded-lg p-4 w-full max-w-md space-y-3">
              <h3 className="text-lg font-semibold">Editar gasto recurrente</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <Label className="text-sm text-muted-foreground">Monto</Label>
                  <input className="w-full border rounded px-2 py-1" type="number" step="0.01" value={editingPending.amount} onChange={e => setEditingPending(prev => prev && ({ ...prev, amount: e.target.value }))} />
                </div>
                <div>
                  <Label className="text-sm text-muted-foreground">Fecha</Label>
                  <input className="w-full border rounded px-2 py-1" type="date" value={editingPending.date} onChange={e => setEditingPending(prev => prev && ({ ...prev, date: e.target.value }))} />
                </div>
              </div>
              <div>
                <Label className="text-sm text-muted-foreground">Moneda</Label>
                <Select value={editingPending.currency} onValueChange={v => setEditingPending(prev => prev && ({ ...prev, currency: v }))}>
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-background border shadow-lg">
                    {['USD','EUR','ARS','BRL','CLP','UYU'].map(ccy => (
                      <SelectItem key={ccy} value={ccy}>{ccy}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setEditingPending(null)}>Cancelar</Button>
                <Button onClick={() => {
                  const dups = findDuplicatesForTemplateInMonth(editingPending.templateId, editingPending.date);
                  if (dups.length > 0) {
                    setDupDialog({ templateId: editingPending.templateId, date: editingPending.date, amount: Number(editingPending.amount), duplicates: dups });
                    return;
                  }
                  confirmRecurringForMonth(editingPending.templateId, { amount: Number(editingPending.amount), date: editingPending.date, currency: editingPending.currency }).then(created => {
                    if (created) setDismissedTemplates(prev => [...prev, editingPending.templateId]);
                    setEditingPending(null);
                  });
                }}>Confirmar</Button>
              </div>
            </div>
          </div>
        )}

        {/* Form overlay */}
        {showAddForm && (
          <div className="fixed inset-0 bg-black/20 flex items-center justify-center p-4 z-50">
            <div className="max-w-2xl w-full">
              <AddExpenseTabs onClose={() => setShowAddForm(false)} />
              <div className="flex justify-end mt-2">
                <Button variant="outline" onClick={() => setShowAddForm(false)}>Cerrar</Button>
              </div>
            </div>
          </div>
        )}

        {/* Historial de pagos */}
        <Dialog open={Boolean(historyFor)} onOpenChange={v => !v && setHistoryFor(null)}>
          <DialogContent className="max-w-xl">
            <DialogHeader>
              <DialogTitle>Historial de pagos</DialogTitle>
            </DialogHeader>
            {historyFor && (
              <ExpenseHistory expenseId={historyFor} defaultCurrency={userCurrency} />
            )}
          </DialogContent>
        </Dialog>

        {/* */}
        {/* Duplicates review dialog */}
        <Dialog open={Boolean(dupDialog)} onOpenChange={(v) => { if (!v) setDupDialog(null); }}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Posible duplicado detectado</DialogTitle>
            </DialogHeader>
            {dupDialog && (
              <div className="space-y-2">
                <p>Parece que ya existe un gasto para "{expenses.find(e => e.id === dupDialog.templateId)?.name || 'Recurrente'}" en {new Date(dupDialog.date).toLocaleDateString('es-AR', { month: 'long', year: 'numeric' })}.</p>
                <p className="text-sm text-muted-foreground">Revisá los siguientes registros similares y confirmá si querés crear otro o cancelar:</p>
                <div className="max-h-60 overflow-auto border rounded-md p-2 space-y-2">
                  {dupDialog.duplicates.map(d => (
                    <div key={d.id} className="flex items-center justify-between text-sm gap-3">
                      <div className="min-w-0">
                        <div className="font-medium truncate">{d.name}</div>
                        <div className="text-muted-foreground">{d.transaction_date} • {formatExpenseAmount(d)}</div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">#{d.id.slice(0, 6)}</Badge>
                        <Button size="sm" variant="ghost" onClick={async () => { await deleteExpense(d.id); setDupDialog(prev => prev ? { ...prev, duplicates: prev.duplicates.filter(x => x.id !== d.id) } : prev); }}>Eliminar</Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            <DialogFooter className="flex gap-2 justify-end">
              <Button variant="outline" onClick={() => setDupDialog(null)}>Cancelar</Button>
              <Button onClick={async () => {
                if (!dupDialog) return;
                const created = await confirmRecurringForMonth(dupDialog.templateId, { amount: dupDialog.amount, date: dupDialog.date });
                if (created) setDismissedTemplates(prev => [...prev, dupDialog.templateId]);
                setDupDialog(null);
              }}>Crear de todos modos</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
  );
};

export default ExpenseManagement;