import React, { useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
// removed beta gating
import { useUserProfile } from '@/hooks/useUserProfile';
import { useCurrencyExchange } from '@/hooks/useCurrencyExchange';
import { useNavigate } from 'react-router-dom';
import { 
  DollarSign, 
  TrendingUp, 
  TrendingDown, 
  Target, 
  PiggyBank, 
  CreditCard,
  Calendar,
  Info,
  ArrowRight,
  AlertTriangle,
  CheckCircle
} from 'lucide-react';
import SmartStart from '@/components/SmartStart';
import { useIncomes } from '@/hooks/useIncomes';
import { useExpenses } from '@/hooks/useExpenses';
import { useIncomeReceipts } from '@/hooks/useIncomeReceipts';
import { useExpensePayments } from '@/hooks/useExpensePayments';
import { useBudgets } from '@/hooks/useBudgets';
import { useSavingsGoals } from '@/hooks/useSavingsGoals';

const FinanceDashboard = () => {
  // Removed user settings for beta gating
  const navigate = useNavigate();
  const { profile } = useUserProfile();
  const { formatCurrency: fmt } = useCurrencyExchange();
  const userCurrency = profile?.primary_display_currency || 'USD';

  // Verificar si la feature está habilitada
  // Removed beta gating check

  // Hooks con datos reales
  const { incomes, loading: loadingIncomes } = useIncomes();
  const { expenses, loading: loadingExpenses } = useExpenses();
  const { receipts, loading: loadingReceipts } = useIncomeReceipts();
  const { payments, loading: loadingPayments } = useExpensePayments();
  const { getCurrentPeriod } = useBudgets();
  const { goals } = useSavingsGoals();

  const monthKey = (d: Date) => `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}`;
  const todayKey = monthKey(new Date());

  const incomeMonthly = useMemo(() => {
    const fromReceipts = receipts
      .filter(r => r.period_month === todayKey)
      .reduce((s, r) => s + (r.amount || 0), 0);
    if (fromReceipts > 0) return fromReceipts;
    // Fallback: sumar ingresos activos aproximados cuando aún no hay receipts (primer mes, etc.)
    const today = new Date();
    return incomes
      .filter(i => i.is_active && (!i.start_date || new Date(i.start_date) <= today))
      .reduce((s,i)=> s + (i.amount || 0),0);
  }, [receipts, incomes, todayKey]);

  const expenseMonthly = useMemo(() => {
    const paymentsMonth = payments.filter(p => p.period_month === todayKey);
    const paymentByExpense = new Map(paymentsMonth.map(p => [p.expense_id, p]));
    const paidTotal = paymentsMonth.reduce((s, p) => s + (p.amount || 0), 0);
    const variableAndUnpaid = expenses.filter(e => {
      const isFixed = e.expense_type === 'fixed';
      if (isFixed && paymentByExpense.has(e.id)) return false;
      return e.transaction_date?.startsWith(todayKey);
    }).reduce((s, e) => s + (e.amount || 0), 0);
    const combined = paidTotal + variableAndUnpaid;
    if (combined > 0) return combined;
    // Fallback: si no hay movimientos del mes, estimar usando la suma de gastos fijos (aprox mensual)
    const estimatedFixed = expenses.filter(e => e.expense_type === 'fixed').reduce((s,e)=> s + (e.amount || 0),0);
    return estimatedFixed;
  }, [payments, expenses, todayKey]);

  const incomeAnnual = useMemo(() => {
    const year = new Date().getFullYear();
    return receipts.filter(r => r.period_month.startsWith(year.toString()))
      .reduce((s, r) => s + (r.amount || 0), 0);
  }, [receipts]);

  const expenseAnnual = useMemo(() => {
    const year = new Date().getFullYear().toString();
    const yearPayments = payments.filter(p => p.period_month.startsWith(year));
    const paymentIds = new Set(yearPayments.map(p => p.expense_id));
    const paidTotal = yearPayments.reduce((s, p) => s + (p.amount || 0), 0);
    const variableAndUnpaid = expenses.filter(e => {
      const isFixed = e.expense_type === 'fixed';
      if (isFixed && paymentIds.has(e.id)) return false;
      return e.transaction_date?.startsWith(year);
    }).reduce((s, e) => s + (e.amount || 0), 0);
    return paidTotal + variableAndUnpaid;
  }, [payments, expenses]);

  const currentBudget = getCurrentPeriod();

  const goalsActive = goals.filter(g => g.status === 'active');
  const goalsCompleted = goals.filter(g => g.status === 'completed');
  const goalsTargetTotal = goalsActive.reduce((s,g)=> s + (g.target_amount||0),0);
  const goalsCurrentTotal = goalsActive.reduce((s,g)=> s + (g.current_amount||0),0);
  const goalsProgress = goalsTargetTotal > 0 ? (goalsCurrentTotal / goalsTargetTotal) * 100 : 0;

  const financialData = {
    income: {
      monthly: incomeMonthly,
      annual: incomeAnnual,
      sources: incomes.length
    },
    expenses: {
      monthly: expenseMonthly,
      annual: expenseAnnual,
      categories: new Set(expenses.map(e => e.category_id)).size
    },
    savings: {
      current: goalsCurrentTotal,
      goals: { active: goalsActive.length, completed: goalsCompleted.length, total_target: goalsTargetTotal, total_progress: goalsProgress }
    },
    budget: {
      total: currentBudget?.total_budget || 0,
      spent: currentBudget?.total_spent || 0,
      remaining: currentBudget?.remaining || 0,
      categories_over: currentBudget?.categories_over || 0
    }
  };

  const netIncome = financialData.income.monthly - financialData.expenses.monthly;
  const savingsRate = financialData.income.monthly > 0 ? (netIncome / financialData.income.monthly) * 100 : 0;
  const loadingAny = loadingIncomes || loadingExpenses || loadingReceipts || loadingPayments;

  const formatCurrency = (amount: number) => fmt(amount, userCurrency);

  const upcomingEvents = [
    { type: 'expense', name: 'Alquiler', amount: 1200, date: '2024-10-05', category: 'Vivienda' },
    { type: 'income', name: 'Freelance', amount: 800, date: '2024-10-15', category: 'Trabajo' },
    { type: 'goal', name: 'Vacaciones Europa', amount: 200, date: '2024-10-20', category: 'Meta' },
    { type: 'expense', name: 'Netflix', amount: 15, date: '2024-10-10', category: 'Entretenimiento' }
  ];

  const quickActions = [
    { 
      title: 'Registrar Ingreso', 
      description: 'Agregar nuevo ingreso',
      icon: TrendingUp,
      color: 'bg-green-100 text-green-600',
      action: () => navigate('/finance/income')
    },
    {
      title: 'Registrar Gasto',
      description: 'Agregar nuevo gasto', 
      icon: CreditCard,
      color: 'bg-red-100 text-red-600',
      action: () => navigate('/finance/expenses')
    },
    {
      title: 'Nueva Meta',
      description: 'Crear meta de ahorro',
      icon: Target,
      color: 'bg-blue-100 text-blue-600', 
      action: () => navigate('/finance/goals')
    },
    {
      title: 'Nuevo Presupuesto',
      description: 'Planificar gastos',
      icon: PiggyBank,
      color: 'bg-purple-100 text-purple-600',
      action: () => navigate('/finance/budgets')
    }
  ];

  return (
      <div className="container mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">💰 Dashboard Financiero</h1>
            <p className="text-gray-600 mt-1">Resumen completo de tu situación financiera</p>
          </div>
          {/* Removed beta label */}
        </div>

  {/* Smart Start Onboarding */}
  <SmartStart />

  {/* Métricas principales */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Ingresos Mensuales</CardTitle>
              <TrendingUp className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {loadingAny ? '...' : formatCurrency(financialData.income.monthly)}
              </div>
              <p className="text-xs text-muted-foreground">
                {financialData.income.sources} fuentes activas
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Gastos Mensuales</CardTitle>
              <TrendingDown className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">
                {loadingAny ? '...' : formatCurrency(financialData.expenses.monthly)}
              </div>
              <p className="text-xs text-muted-foreground">
                {financialData.expenses.categories} categorías
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Ingresos Netos</CardTitle>
              <DollarSign className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${netIncome >= 0 ? 'text-blue-600' : 'text-red-600'}`}>
                {loadingAny ? '...' : formatCurrency(netIncome)}
              </div>
              <p className="text-xs text-muted-foreground">
                Tasa de ahorro: {savingsRate.toFixed(1)}%
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Ahorros</CardTitle>
              <Target className="h-4 w-4 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-600">
                {loadingAny ? '...' : formatCurrency(financialData.savings.current)}
              </div>
              <p className="text-xs text-muted-foreground">
                {financialData.savings.goals.active} metas activas
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Sección de progreso de metas y presupuesto */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Progreso de Metas */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center space-x-2">
                    <Target className="h-5 w-5 text-blue-600" />
                    <span>Metas de Ahorro</span>
                  </CardTitle>
                  <CardDescription>
                    Progreso hacia tus objetivos financieros
                  </CardDescription>
                </div>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => navigate('/finance/goals')}
                >
                  Ver todas <ArrowRight className="h-3 w-3 ml-1" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Progreso General</span>
                <span className="text-sm text-gray-600">
                  {financialData.savings.goals.total_progress.toFixed(1)}%
                </span>
              </div>
              <Progress value={financialData.savings.goals.total_progress} className="w-full" />
              
              <div className="grid grid-cols-3 gap-4 pt-2">
                <div className="text-center">
                  <div className="text-lg font-bold text-blue-600">{financialData.savings.goals.active}</div>
                  <div className="text-xs text-gray-600">Activas</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold text-green-600">{financialData.savings.goals.completed}</div>
                  <div className="text-xs text-gray-600">Completadas</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold text-purple-600">
                    {formatCurrency(financialData.savings.goals.total_target)}
                  </div>
                  <div className="text-xs text-gray-600">Objetivo Total</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Estado del Presupuesto */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center space-x-2">
                    <PiggyBank className="h-5 w-5 text-green-600" />
                    <span>Presupuesto Actual</span>
                  </CardTitle>
                  <CardDescription>
                    Control de gastos del mes
                  </CardDescription>
                </div>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => navigate('/finance/budgets')}
                >
                  Ver detalles <ArrowRight className="h-3 w-3 ml-1" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Gasto del Presupuesto</span>
                <span className="text-sm text-gray-600">
                  {financialData.budget.total > 0 ? ((financialData.budget.spent / financialData.budget.total) * 100).toFixed(1) : '0.0'}%
                </span>
              </div>
              <Progress 
                value={financialData.budget.total > 0 ? (financialData.budget.spent / financialData.budget.total) * 100 : 0} 
                className="w-full" 
              />
              
              <div className="grid grid-cols-3 gap-4 pt-2">
                <div className="text-center">
                  <div className="text-lg font-bold text-blue-600">
                    {loadingAny ? '...' : formatCurrency(financialData.budget.total)}
                  </div>
                  <div className="text-xs text-gray-600">Presupuesto</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold text-red-600">
                    {loadingAny ? '...' : formatCurrency(financialData.budget.spent)}
                  </div>
                  <div className="text-xs text-gray-600">Gastado</div>
                </div>
                <div className="text-center">
                  <div className={`text-lg font-bold ${financialData.budget.remaining >= 0 ? 'text-green-600' : 'text-red-600'}`}> 
                    {loadingAny ? '...' : formatCurrency(financialData.budget.remaining)}
                  </div>
                  <div className="text-xs text-gray-600">Restante</div>
                </div>
              </div>

              {financialData.budget.categories_over > 0 && (
                <Alert>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription className="text-sm">
                    {financialData.budget.categories_over} categoría(s) excedida(s)
                  </AlertDescription>
                </Alert>
              )}
              {!loadingAny && financialData.income.monthly === 0 && incomes.length === 0 && (
                <Alert>
                  <Info className="h-4 w-4" />
                  <AlertDescription className="text-sm">Aún no registraste ingresos este mes. Usa "Registrar Ingreso" para empezar.</AlertDescription>
                </Alert>
              )}
              {!loadingAny && financialData.expenses.monthly === 0 && expenses.length === 0 && (
                <Alert>
                  <Info className="h-4 w-4" />
                  <AlertDescription className="text-sm">No hay gastos este mes. Agrega uno con "Registrar Gasto".</AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Acciones rápidas */}
        <Card>
          <CardHeader>
            <CardTitle>Acciones Rápidas</CardTitle>
            <CardDescription>
              Registra movimientos financieros rápidamente
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {quickActions.map((action, index) => (
                <Button
                  key={index}
                  variant="outline"
                  className="h-20 flex flex-col items-center justify-center space-y-2 hover:bg-gray-50"
                  onClick={action.action}
                >
                  <div className={`p-2 rounded-full ${action.color}`}>
                    <action.icon className="h-4 w-4" />
                  </div>
                  <div className="text-center">
                    <div className="text-sm font-medium">{action.title}</div>
                    <div className="text-xs text-gray-500">{action.description}</div>
                  </div>
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Próximos eventos financieros */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Calendar className="h-5 w-5" />
              <span>Próximos Eventos</span>
            </CardTitle>
            <CardDescription>
              Ingresos y gastos programados para los próximos días
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {upcomingEvents.map((event, index) => {
                const isIncome = event.type === 'income';
                const isGoal = event.type === 'goal';
                const Icon = isIncome ? TrendingUp : isGoal ? Target : CreditCard;
                const colorClass = isIncome ? 'text-green-600' : isGoal ? 'text-blue-600' : 'text-red-600';
                
                return (
                  <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center space-x-3">
                      <Icon className={`h-4 w-4 ${colorClass}`} />
                      <div>
                        <div className="font-medium text-gray-900">{event.name}</div>
                        <div className="text-sm text-gray-600">{event.category}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className={`font-semibold ${colorClass}`}>
                        {isIncome ? '+' : '-'}{formatCurrency(event.amount)}
                      </div>
                      <div className="text-xs text-gray-500">{event.date}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Estado beta */}
        {/* Removed beta status alert */}
      </div>
  );
};

export default FinanceDashboard;