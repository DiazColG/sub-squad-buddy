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

const BudgetManagement = () => {
  // removed beta gating usage
  const [showAddForm, setShowAddForm] = useState(false);
  const { profile } = useUserProfile();
  const { formatCurrency: fmt } = useCurrencyExchange();
  const userCurrency = profile?.primary_display_currency || 'USD';

  const { aggregated, loading: loadingBudgets, getCurrentPeriod } = useBudgets();
  const { getExpenseCategories } = useFinancialCategories();
  const expenseCats = getExpenseCategories();

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
    return (spent / budgeted) * 100;
  };

  const getBudgetStatus = (spent: number, budgeted: number) => {
    const percentage = getSpentPercentage(spent, budgeted);
    if (percentage > 100) return { status: 'over', color: 'text-red-600', badge: 'Excedido' };
    if (percentage > 80) return { status: 'warning', color: 'text-yellow-600', badge: 'Atención' };
    return { status: 'good', color: 'text-green-600', badge: 'En rango' };
  };

  if (!loadingBudgets && !activeBudget) {
    return (
        <div className="container mx-auto p-6 space-y-6">
          <div className="text-center py-12">
            <PiggyBank className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">No hay presupuestos activos</h2>
            <p className="text-gray-600 mb-6">Crea tu primer presupuesto para comenzar a controlar tus gastos</p>
            <Button onClick={() => setShowAddForm(true)} className="bg-blue-600 hover:bg-blue-700">
              <Plus className="h-4 w-4 mr-2" />
              Crear Presupuesto
            </Button>
          </div>
        </div>
    );
  }
  const totalSpent = activeBudget?.total_spent || 0;
  const totalBudgeted = activeBudget?.total_budget || 0;
  const remainingBudget = activeBudget?.remaining || 0;
  const overBudgetCategories = activeBudget?.categories.filter(cat => cat.spent_amount > cat.budgeted_amount) || [];

  return (
      <div className="container mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">🐷 Gestión de Presupuestos</h1>
            <p className="text-gray-600 mt-1">Controla tus gastos por categorías</p>
          </div>
          <Button 
            onClick={() => setShowAddForm(true)} 
            className="bg-blue-600 hover:bg-blue-700"
          >
            <Plus className="h-4 w-4 mr-2" />
            Nuevo Presupuesto
          </Button>
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
                {((totalSpent / totalBudgeted) * 100).toFixed(1)}% del presupuesto
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
                de {activeBudget.categories.length} categorías
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
                {activeBudget.categories.map((category) => {
                  const percentage = getSpentPercentage(category.spent_amount, category.budgeted_amount);
                  const status = getBudgetStatus(category.spent_amount, category.budgeted_amount);
                  const remaining = category.budgeted_amount - category.spent_amount;
                  
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
                            {formatCurrency(category.spent_amount)}
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
                const performance = history.total_budget > 0 ? (history.total_spent / history.total_budget) * 100 : 0;
                return (
                  <div key={`${history.period_start}-${history.period_end}`} className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <h3 className="font-medium text-gray-900">{formatDate(history.period_start)} - {formatDate(history.period_end)}</h3>
                      <p className="text-sm text-gray-600">{history.categories.length} categorías</p>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-semibold">
                        {formatCurrency(history.total_spent)} / {formatCurrency(history.total_budget)}
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