import React, { useState } from 'react';
import { Layout } from '@/components/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useUserSettings } from '@/hooks/useUserSettings';
import { useFinancialCategories } from '@/hooks/useFinancialCategories';
import { CreditCard, Plus, TrendingDown, Calendar, Filter, Info, DollarSign } from 'lucide-react';

const ExpenseManagement = () => {
  const { isFeatureEnabled } = useUserSettings();
  const { categories, isLoading: categoriesLoading } = useFinancialCategories();
  const [showAddForm, setShowAddForm] = useState(false);

  // Mock data para demostración
  const mockExpenses = [
    {
      id: '1',
      name: 'Alquiler',
      description: 'Departamento 2 ambientes',
      amount: 1200,
      frequency: 'monthly',
      start_date: '2024-01-01',
      category: 'Vivienda',
      is_active: true,
      payment_day: 5
    },
    {
      id: '2', 
      name: 'Supermercado',
      description: 'Compras semanales',
      amount: 300,
      frequency: 'weekly',
      start_date: '2024-01-01',
      category: 'Alimentación',
      is_active: true,
      payment_day: null
    },
    {
      id: '3',
      name: 'Netflix',
      description: 'Suscripción mensual',
      amount: 15,
      frequency: 'monthly',
      start_date: '2024-01-01',
      category: 'Entretenimiento',
      is_active: true,
      payment_day: 10
    },
    {
      id: '4',
      name: 'Combustible',
      description: 'Gasolina del auto',
      amount: 80,
      frequency: 'monthly',
      start_date: '2024-01-01',
      category: 'Transporte',
      is_active: true,
      payment_day: null
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

  // Calcular estadísticas
  const totalMonthlyExpenses = mockExpenses
    .filter(expense => expense.is_active)
    .reduce((sum, expense) => {
      if (expense.frequency === 'monthly') return sum + expense.amount;
      if (expense.frequency === 'weekly') return sum + (expense.amount * 4.33);
      if (expense.frequency === 'daily') return sum + (expense.amount * 30);
      return sum;
    }, 0);

  const totalAnnualExpenses = totalMonthlyExpenses * 12;

  const getFrequencyBadge = (frequency: string) => {
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
      <Badge className={colorMap[frequency as keyof typeof colorMap] || 'bg-gray-100 text-gray-800'}>
        {labelMap[frequency as keyof typeof labelMap] || frequency}
      </Badge>
    );
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS'
    }).format(amount);
  };

  return (
    <Layout>
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
                {mockExpenses.filter(expense => expense.is_active).length}
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
              {mockExpenses.map((expense) => (
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
                      <div className="flex items-center space-x-2 mt-1">
                        {getFrequencyBadge(expense.frequency)}
                        <Badge variant="outline" className="text-xs">
                          {expense.category}
                        </Badge>
                        {expense.payment_day && (
                          <Badge variant="secondary" className="text-xs">
                            Día {expense.payment_day}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-semibold text-red-600">
                      -{formatCurrency(expense.amount)}
                    </div>
                    <div className="text-xs text-gray-500">
                      por {expense.frequency === 'monthly' ? 'mes' : 
                           expense.frequency === 'weekly' ? 'semana' : 
                           expense.frequency === 'daily' ? 'día' : 'año'}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Estado beta */}
        <Alert>
          <Info className="h-4 w-4" />
          <AlertDescription>
            <strong>Funcionalidad Beta:</strong> Esta función está en desarrollo. 
            Los datos mostrados son ejemplos para demostración. La funcionalidad completa 
            incluirá formularios para agregar/editar gastos y sincronización con la base de datos.
          </AlertDescription>
        </Alert>
      </div>
    </Layout>
  );
};

export default ExpenseManagement;