import React, { useState } from 'react';
import { Layout } from '@/components/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useUserSettings } from '@/hooks/useUserSettings';
import { useFinancialCategories } from '@/hooks/useFinancialCategories';
import { DollarSign, Plus, TrendingUp, Calendar, Filter, Info } from 'lucide-react';

const IncomeManagement = () => {
  const { isFeatureEnabled } = useUserSettings();
  const { categories, isLoading: categoriesLoading } = useFinancialCategories();
  const [showAddForm, setShowAddForm] = useState(false);

  // Mock data para demostración
  const mockIncomes = [
    {
      id: '1',
      name: 'Salario Principal',
      description: 'Trabajo tiempo completo',
      amount: 3500,
      frequency: 'monthly',
      start_date: '2024-01-01',
      category: 'Salario',
      is_active: true,
      payment_day: 25
    },
    {
      id: '2', 
      name: 'Freelance Desarrollo',
      description: 'Proyectos de desarrollo web',
      amount: 800,
      frequency: 'monthly',
      start_date: '2024-02-01',
      category: 'Freelance',
      is_active: true,
      payment_day: 15
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
              Ve a <strong>Configuración</strong> para activar las finanzas personales.
            </AlertDescription>
          </Alert>
        </div>
      </Layout>
    );
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
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

  const calculateMonthlyTotal = () => {
    return mockIncomes
      .filter(income => income.is_active)
      .reduce((total, income) => {
        let monthlyAmount = income.amount;
        
        switch (income.frequency) {
          case 'weekly':
            monthlyAmount = income.amount * 4.33;
            break;
          case 'biweekly':
            monthlyAmount = income.amount * 2.17;
            break;
          case 'quarterly':
            monthlyAmount = income.amount / 3;
            break;
          case 'yearly':
            monthlyAmount = income.amount / 12;
            break;
        }
        
        return total + monthlyAmount;
      }, 0);
  };

  return (
    <Layout>
      <div className="container mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-foreground flex items-center gap-2">
              <DollarSign className="h-6 w-6 text-green-600" />
              Gestión de Ingresos
              <Badge variant="secondary" className="text-xs">BETA</Badge>
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
                {formatCurrency(calculateMonthlyTotal())}
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
                {mockIncomes.filter(i => i.is_active).length}
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
                {formatCurrency(calculateMonthlyTotal() / 4.33)}
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
              <Button variant="outline" size="sm" className="gap-2">
                <Filter className="h-4 w-4" />
                Filtros
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {mockIncomes.map((income) => (
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
                        <div className="flex items-center gap-4 mt-1">
                          <Badge variant="outline" className="text-xs">
                            {income.category}
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            {getFrequencyLabel(income.frequency)}
                          </span>
                          {income.payment_day && (
                            <span className="text-xs text-muted-foreground">
                              Día {income.payment_day}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-semibold text-green-600">
                      {formatCurrency(income.amount)}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {getFrequencyLabel(income.frequency)}
                    </div>
                  </div>
                  <div className="ml-4">
                    <Badge 
                      variant={income.is_active ? "default" : "secondary"}
                      className="text-xs"
                    >
                      {income.is_active ? 'Activo' : 'Inactivo'}
                    </Badge>
                  </div>
                </div>
              ))}

              {mockIncomes.length === 0 && (
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

        {/* Beta Notice */}
        <Alert>
          <Info className="h-4 w-4" />
          <AlertDescription>
            <strong>Funcionalidad Beta:</strong> Esta es una versión de prueba del módulo de ingresos. 
            Los datos mostrados son de demostración. Las funcionalidades completas estarán disponibles próximamente.
          </AlertDescription>
        </Alert>
      </div>
    </Layout>
  );
};

export default IncomeManagement;