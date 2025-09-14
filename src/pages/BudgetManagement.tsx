import React, { useState } from 'react';
import { Layout } from '@/components/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { useUserSettings } from '@/hooks/useUserSettings';
import { PiggyBank, Plus, DollarSign, TrendingDown, AlertTriangle, CheckCircle, Info } from 'lucide-react';

const BudgetManagement = () => {
  const { isFeatureEnabled } = useUserSettings();
  const [showAddForm, setShowAddForm] = useState(false);

  // Mock data para demostración
  const mockBudgets = [
    {
      id: '1',
      name: 'Presupuesto Mensual Octubre',
      description: 'Presupuesto para gastos del mes de octubre',
      total_budget: 3000,
      start_date: '2024-10-01',
      end_date: '2024-10-31',
      is_active: true,
      categories: [
        {
          id: '1',
          name: 'Alimentación',
          budgeted_amount: 800,
          spent_amount: 650,
          color: '#10B981'
        },
        {
          id: '2', 
          name: 'Transporte',
          budgeted_amount: 400,
          spent_amount: 420,
          color: '#F59E0B'
        },
        {
          id: '3',
          name: 'Entretenimiento',
          budgeted_amount: 300,
          spent_amount: 180,
          color: '#8B5CF6'
        },
        {
          id: '4',
          name: 'Vivienda',
          budgeted_amount: 1200,
          spent_amount: 1200,
          color: '#EF4444'
        },
        {
          id: '5',
          name: 'Salud',
          budgeted_amount: 200,
          spent_amount: 85,
          color: '#06B6D4'
        },
        {
          id: '6',
          name: 'Varios',
          budgeted_amount: 100,
          spent_amount: 45,
          color: '#84CC16'
        }
      ]
    },
    {
      id: '2',
      name: 'Presupuesto Mensual Septiembre',
      description: 'Presupuesto para gastos del mes de septiembre',
      total_budget: 2800,
      start_date: '2024-09-01',
      end_date: '2024-09-30',
      is_active: false,
      categories: [
        {
          id: '1',
          name: 'Alimentación',
          budgeted_amount: 750,
          spent_amount: 780,
          color: '#10B981'
        },
        {
          id: '2',
          name: 'Transporte', 
          budgeted_amount: 350,
          spent_amount: 320,
          color: '#F59E0B'
        },
        {
          id: '3',
          name: 'Entretenimiento',
          budgeted_amount: 200,
          spent_amount: 240,
          color: '#8B5CF6'
        },
        {
          id: '4',
          name: 'Vivienda',
          budgeted_amount: 1200,
          spent_amount: 1200,
          color: '#EF4444'
        },
        {
          id: '5',
          name: 'Salud',
          budgeted_amount: 200,
          spent_amount: 150,
          color: '#06B6D4'
        },
        {
          id: '6',
          name: 'Varios',
          budgeted_amount: 100,
          spent_amount: 110,
          color: '#84CC16'
        }
      ]
    }
  ];

  // Verificar si la feature está habilitada
  if (!isFeatureEnabled('personal_finance')) {
    return (
      <Layout>
        <div className="container mx-auto p-6">
          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription>
              Esta funcionalidad está disponible en el programa beta. 
              Activa las funciones beta en Configuración para acceder.
            </AlertDescription>
          </Alert>
        </div>
      </Layout>
    );
  }

  const activeBudget = mockBudgets.find(budget => budget.is_active);
  
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS'
    }).format(amount);
  };

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

  if (!activeBudget) {
    return (
      <Layout>
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
      </Layout>
    );
  }

  const totalSpent = activeBudget.categories.reduce((sum, cat) => sum + cat.spent_amount, 0);
  const totalBudgeted = activeBudget.categories.reduce((sum, cat) => sum + cat.budgeted_amount, 0);
  const remainingBudget = totalBudgeted - totalSpent;
  const overBudgetCategories = activeBudget.categories.filter(cat => cat.spent_amount > cat.budgeted_amount);

  return (
    <Layout>
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
                <CardTitle>{activeBudget.name}</CardTitle>
                <CardDescription>
                  {formatDate(activeBudget.start_date)} - {formatDate(activeBudget.end_date)}
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
                            style={{ backgroundColor: category.color }}
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
              {mockBudgets.filter(budget => !budget.is_active).map((budget) => {
                const totalSpentHistory = budget.categories.reduce((sum, cat) => sum + cat.spent_amount, 0);
                const totalBudgetedHistory = budget.categories.reduce((sum, cat) => sum + cat.budgeted_amount, 0);
                const performancePercentage = (totalSpentHistory / totalBudgetedHistory) * 100;
                
                return (
                  <div 
                    key={budget.id} 
                    className="flex items-center justify-between p-4 border rounded-lg"
                  >
                    <div>
                      <h3 className="font-medium text-gray-900">{budget.name}</h3>
                      <p className="text-sm text-gray-600">
                        {formatDate(budget.start_date)} - {formatDate(budget.end_date)}
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-semibold">
                        {formatCurrency(totalSpentHistory)} / {formatCurrency(totalBudgetedHistory)}
                      </div>
                      <div className={`text-sm ${performancePercentage > 100 ? 'text-red-600' : 'text-green-600'}`}>
                        {performancePercentage.toFixed(1)}% del presupuesto
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Estado beta */}
        <Alert>
          <Info className="h-4 w-4" />
          <AlertDescription>
            <strong>Funcionalidad Beta:</strong> Esta función está en desarrollo. 
            Los datos mostrados son ejemplos para demostración. La funcionalidad completa 
            incluirá formularios para crear/editar presupuestos, categorías personalizadas 
            y sincronización automática con gastos reales.
          </AlertDescription>
        </Alert>
      </div>
    </Layout>
  );
};

export default BudgetManagement;