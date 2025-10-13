import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
// removed beta gating
import { useUserProfile } from '@/hooks/useUserProfile';
import { useCurrencyExchange } from '@/hooks/useCurrencyExchange';
import { PiggyBank, Plus, DollarSign, TrendingDown, AlertTriangle } from 'lucide-react';
import { useBudgets } from '@/hooks/useBudgets';
import { useFinancialCategories } from '@/hooks/useFinancialCategories';
import { AddBudgetForm } from '@/components/AddBudgetForm';
import { useExpenses, type ExpenseRow } from '@/hooks/useExpenses';
import { monthKey } from '@/lib/dateUtils';
import { normalizeRecurring, effectiveMonthKey } from '@/lib/accrual';
import { useCards } from '@/hooks/useCards';

const BudgetManagement = () => {
  // removed beta gating usage
  // Eliminado showAddForm: el formulario se maneja internamente via DialogTrigger
  const { profile } = useUserProfile();
  const { formatCurrency: fmt, convertCurrency } = useCurrencyExchange();
  const userCurrency = profile?.primary_display_currency || 'USD';

  const { aggregated, loading: loadingBudgets, getCurrentPeriod, localMode, localCount, syncLocalToServer } = useBudgets();
  const { getExpenseCategories } = useFinancialCategories();
  const expenseCats = getExpenseCategories();
  const { expenses } = useExpenses();
  const { cards } = useCards();

  // Periodo actual (si existe en DB)
  const activeBudget = useMemo(() => getCurrentPeriod(), [getCurrentPeriod]);
  
  const formatCurrency = (amount: number) => fmt(amount, userCurrency);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-AR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getSpentPercentage = (spent: number, budgeted: number) => {
    if (!budgeted || budgeted <= 0) return 0;
    return (spent / budgeted) * 100;
  };

  const getBudgetStatus = (spent: number, budgeted: number) => {
    const percentage = getSpentPercentage(spent, budgeted);
    if (percentage > 100) return { status: 'over', color: 'text-red-600', badge: 'Excedido' };
    if (percentage > 80) return { status: 'warning', color: 'text-yellow-600', badge: 'Atención' };
    return { status: 'good', color: 'text-green-600', badge: 'En rango' };
  };

  if (loadingBudgets) {
    return (
      <div className="container mx-auto p-6 space-y-6 animate-pulse">
        <div className="h-8 w-64 bg-muted rounded" />
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-28 bg-muted rounded" />
          ))}
        </div>
        <div className="h-96 bg-muted rounded" />
      </div>
    );
  }

  if (!loadingBudgets && !activeBudget) {
    return (
        <div className="container mx-auto p-6 space-y-6">
          <div className="text-center py-12">
            <PiggyBank className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">No hay presupuestos activos</h2>
            <p className="text-gray-600 mb-6">Crea tu primer presupuesto para comenzar a controlar tus gastos</p>
            <div className="flex justify-center">
              <AddBudgetForm triggerLabel="Crear Presupuesto" />
            </div>
          </div>
        </div>
    );
  }
  const totalBudgeted = activeBudget?.total_budget || 0;
  const categories = activeBudget?.categories ?? [];

  // Calcula gasto devengado (accrual) para un período y categoría opcional
  const computeAccruedSpent = (
    start: string,
    end: string,
    categoryId: string | null
  ) => {
    if (!start || !end) return 0;
    const startDate = new Date(start);
    const endDate = new Date(end);

    // Construir lista de meses entre start y end (inclusive)
    const months: string[] = [];
    const cursor = new Date(startDate.getFullYear(), startDate.getMonth(), 1);
    const endCursor = new Date(endDate.getFullYear(), endDate.getMonth(), 1);
    while (cursor <= endCursor) {
      months.push(monthKey(cursor));
      cursor.setMonth(cursor.getMonth() + 1);
    }

    let total = 0;
    for (const period of months) {
      const d = new Date(period + '-01');
      const endOfMonth = new Date(d.getFullYear(), d.getMonth() + 1, 0);
      for (const e of expenses as ExpenseRow[]) {
        // Filtrar por categoría (si aplica)
        const matchesCategory = categoryId === null ? true : e.category_id === categoryId;
        if (!matchesCategory) continue;
        const fromCcy = e.currency || userCurrency;

        if (e.is_recurring) {
          // Plantillas: contar valor normalizado si arrancó antes de fin de mes
          if (e.transaction_date && new Date(e.transaction_date) > endOfMonth) continue;
          const base = normalizeRecurring(e.amount || 0, e.frequency);
          total += convertCurrency(base, fromCcy, userCurrency);
        } else {
          // Variables: imputar por mes efectivo (fecha de cierre si es tarjeta de crédito)
          if (!e.transaction_date) continue;
          const card = e.card_id ? cards.find(c => c.id === e.card_id) : undefined;
          const effKey = effectiveMonthKey(e.transaction_date, card?.card_type, card?.closing_day ?? undefined);
          if (effKey !== period) continue;
          const txDate = new Date(e.transaction_date);
          if (txDate < startDate || txDate > endDate) continue;
          total += convertCurrency(e.amount || 0, fromCcy, userCurrency);
        }
      }
    }
    return total;
  };

  // Gasto devengado por categoría del presupuesto activo (no hook para evitar reglas de hooks con returns tempranos)
  const accruedByCategory: Map<string, number> = (() => {
    if (!activeBudget) return new Map();
    const map = new Map<string, number>();
    for (const c of categories) {
      const key = c.category_id ?? '__general__';
      const spent = computeAccruedSpent(activeBudget.period_start, activeBudget.period_end, c.category_id);
      map.set(key, spent);
    }
    return map;
  })();

  const totalSpent: number = (() => {
    if (!activeBudget) return 0;
    let sum = 0;
    for (const c of categories) {
      const key = c.category_id ?? '__general__';
      sum += accruedByCategory.get(key) || 0;
    }
    return sum;
  })();

  const remainingBudget = totalBudgeted - totalSpent;
  const categoriesForGrid = categories.filter(c => c.category_id !== null);
  const overBudgetCategories = categoriesForGrid.filter(cat => {
    const key = cat.category_id ?? '__general__';
    const spent = accruedByCategory.get(key) || 0;
    return spent > cat.budgeted_amount;
  });

  return (
      <div className="container mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">🐷 Gestión de Presupuestos</h1>
            <p className="text-gray-600 mt-1">Controla tus gastos por categorías</p>
            {localMode && (
              <div className="mt-2 inline-flex items-center gap-2 text-xs text-yellow-700 bg-yellow-50 border border-yellow-200 px-2 py-1 rounded">
                Modo offline: guardamos los presupuestos localmente hasta sincronizar con el servidor
                {localCount > 0 && (
                  <Button size="sm" variant="outline" className="ml-2" onClick={async ()=>{ await syncLocalToServer(); }}>
                    Sincronizar ({localCount})
                  </Button>
                )}
              </div>
            )}
          </div>
          <AddBudgetForm />
        </div>

        {/* Resumen del presupuesto activo */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Presupuesto Total</CardTitle>
              <PiggyBank className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">
                {formatCurrency(totalBudgeted)}
              </div>
              <p className="text-xs text-muted-foreground">
                Asignado este mes
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Gastado</CardTitle>
              <TrendingDown className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">
                {formatCurrency(totalSpent)}
              </div>
              <p className="text-xs text-muted-foreground">
                {(getSpentPercentage(totalSpent, totalBudgeted)).toFixed(1)}% del presupuesto
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Presupuesto Restante</CardTitle>
              <DollarSign className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${remainingBudget >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {formatCurrency(remainingBudget)}
              </div>
              <p className="text-xs text-muted-foreground">
                {remainingBudget >= 0 ? 'Disponible' : 'Excedido'}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Categorías Excedidas</CardTitle>
              <AlertTriangle className="h-4 w-4 text-yellow-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">
                {overBudgetCategories.length}
              </div>
              <p className="text-xs text-muted-foreground">
                de {categoriesForGrid.length} categorías
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Presupuesto activo */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Presupuesto Actual</CardTitle>
                <CardDescription>
                  {activeBudget?.period_start && formatDate(activeBudget.period_start)} - {activeBudget?.period_end && formatDate(activeBudget.period_end)}
                </CardDescription>
              </div>
              <Badge className="bg-green-100 text-green-800">Activo</Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {/* Progreso general */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">Progreso General</span>
                  <span className="text-sm text-gray-600">
                    {formatCurrency(totalSpent)} / {formatCurrency(totalBudgeted)}
                  </span>
                </div>
                <Progress 
                  value={getSpentPercentage(totalSpent, totalBudgeted)} 
                  className="w-full" 
                />
              </div>

              {/* Categorías */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {categoriesForGrid.map((category) => {
                  const accrued = accruedByCategory.get(category.category_id ?? '__general__') || 0;
                  const percentage = getSpentPercentage(accrued, category.budgeted_amount);
                  const status = getBudgetStatus(accrued, category.budgeted_amount);
                  const remaining = category.budgeted_amount - accrued;
                  
                  return (
                    <div key={category.id} className="border rounded-lg p-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <div 
                            className="w-3 h-3 rounded-full" 
                            style={{ backgroundColor: category.color || '#3b82f6' }}
                          ></div>
                          <h3 className="font-medium text-gray-900">{category.name}</h3>
                        </div>
                        <Badge className={
                          status.status === 'over' ? 'bg-red-100 text-red-800' :
                          status.status === 'warning' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-green-100 text-green-800'
                        }>
                          {status.badge}
                        </Badge>
                      </div>
                      
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span className={status.color}>
                            {formatCurrency(accrued)}
                          </span>
                          <span className="text-gray-600">
                            de {formatCurrency(category.budgeted_amount)}
                          </span>
                        </div>
                        <Progress 
                          value={Math.min(percentage, 100)} 
                          className="w-full" 
                        />
                        <div className="flex items-center justify-between text-xs text-gray-500">
                          <span>{percentage.toFixed(1)}% usado</span>
                          <span>
                            {remaining >= 0 
                              ? `${formatCurrency(remaining)} restantes`
                              : `${formatCurrency(Math.abs(remaining))} excedido`
                            }
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Alertas de presupuesto */}
        {overBudgetCategories.length > 0 && (
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              <strong>Atención:</strong> Tienes {overBudgetCategories.length} categoría(s) que han excedido el presupuesto: {' '}
              {overBudgetCategories.map(cat => cat.name).join(', ')}.
            </AlertDescription>
          </Alert>
        )}

        {/* Historial de presupuestos */}
        <Card>
          <CardHeader>
            <CardTitle>Historial de Presupuestos</CardTitle>
            <CardDescription>
              Presupuestos anteriores y su rendimiento
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {aggregated.filter(a => a !== activeBudget).map(history => {
                // Recalcular gasto devengado para cada período histórico
                const histSpent = history.categories.reduce((s, c) => s + computeAccruedSpent(history.period_start, history.period_end, c.category_id), 0);
                const performance = history.total_budget > 0 ? (histSpent / history.total_budget) * 100 : 0;
                return (
                  <div key={`${history.period_start}-${history.period_end}`} className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <h3 className="font-medium text-gray-900">{formatDate(history.period_start)} - {formatDate(history.period_end)}</h3>
                      <p className="text-sm text-gray-600">{history.categories.length} categorías</p>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-semibold">
                        {formatCurrency(histSpent)} / {formatCurrency(history.total_budget)}
                      </div>
                      <div className={`text-sm ${performance > 100 ? 'text-red-600' : 'text-green-600'}`}>{performance.toFixed(1)}% del presupuesto</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* */}
      </div>
  );
};

export default BudgetManagement;