import React from 'react';
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

const FinanceDashboard = () => {
  // Removed user settings for beta gating
  const navigate = useNavigate();
  const { profile } = useUserProfile();
  const { formatCurrency: fmt } = useCurrencyExchange();
  const userCurrency = profile?.primary_display_currency || 'USD';

  // Verificar si la feature está habilitada
  // Removed beta gating check

  // Mock data consolidado de todos los módulos
  const financialData = {
    income: {
      monthly: 4300,
      annual: 51600,
      sources: 2
    },
    expenses: {
      monthly: 2485,
      annual: 29820,
      categories: 6
    },
    savings: {
      current: 10820,
      goals: {
        active: 3,
        completed: 1,
        total_target: 17800,
        total_progress: 60.8
      }
    },
    budget: {
      total: 3000,
      spent: 2580,
      remaining: 420,
      categories_over: 1
    }
  };

  const netIncome = financialData.income.monthly - financialData.expenses.monthly;
  const savingsRate = (netIncome / financialData.income.monthly) * 100;

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
                {formatCurrency(financialData.income.monthly)}
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
                {formatCurrency(financialData.expenses.monthly)}
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
                {formatCurrency(netIncome)}
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
                {formatCurrency(financialData.savings.current)}
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
                  {((financialData.budget.spent / financialData.budget.total) * 100).toFixed(1)}%
                </span>
              </div>
              <Progress 
                value={(financialData.budget.spent / financialData.budget.total) * 100} 
                className="w-full" 
              />
              
              <div className="grid grid-cols-3 gap-4 pt-2">
                <div className="text-center">
                  <div className="text-lg font-bold text-blue-600">
                    {formatCurrency(financialData.budget.total)}
                  </div>
                  <div className="text-xs text-gray-600">Presupuesto</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold text-red-600">
                    {formatCurrency(financialData.budget.spent)}
                  </div>
                  <div className="text-xs text-gray-600">Gastado</div>
                </div>
                <div className="text-center">
                  <div className={`text-lg font-bold ${financialData.budget.remaining >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {formatCurrency(financialData.budget.remaining)}
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