import React, { useState } from 'react';
import { Layout } from '@/components/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useUserSettings } from '@/hooks/useUserSettings';
import { useIncomes } from '@/hooks/useIncomes';
import { AddIncomeForm } from '@/components/AddIncomeForm';
import { DollarSign, Plus, TrendingUp, Calendar, Filter, Info, Edit, Trash2 } from 'lucide-react';

const IncomeManagement = () => {
  const { isFeatureEnabled } = useUserSettings();
  const { incomes, isLoading, getTotalMonthlyIncome, getActiveIncomesCount, deleteIncome } = useIncomes();
  const [showAddForm, setShowAddForm] = useState(false);

  // Manejar eliminación de ingresos
  const handleDeleteIncome = async (id: string) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar este ingreso?')) {
      await deleteIncome(id);
    }
  };

  // Formatear frecuencia para mostrar
  const formatFrequency = (frequency: string) => {
    const frequencies: Record<string, string> = {
      'once': 'Una vez',
      'weekly': 'Semanal',
      'biweekly': 'Quincenal', 
      'monthly': 'Mensual',
      'quarterly': 'Trimestral',
      'yearly': 'Anual'
    };
    return frequencies[frequency] || frequency;
  };

  // Verificar si la feature está habilitada
  if (!isFeatureEnabled('personal_finance')) {
    return (
      <Layout>
        <div className="container mx-auto p-6">
          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription>
              Esta funcionalidad está disponible en el programa beta. 
              Ve a Settings para activarla.
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

  if (isLoading) {
    return (
      <Layout>
        <div className="container mx-auto p-6 space-y-6">
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
              <p className="mt-4 text-muted-foreground">Cargando ingresos...</p>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

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

        {/* Dialog para agregar ingreso */}
        <Dialog open={showAddForm} onOpenChange={setShowAddForm}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Agregar Nuevo Ingreso</DialogTitle>
            </DialogHeader>
            <AddIncomeForm 
              onSuccess={() => setShowAddForm(false)}
              onCancel={() => setShowAddForm(false)}
            />
          </DialogContent>
        </Dialog>

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
                {formatCurrency(getTotalMonthlyIncome())}
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
                {getActiveIncomesCount()}
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
                {formatCurrency(getTotalMonthlyIncome() / 4.33)}
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
              {incomes.length === 0 ? (
                <div className="text-center py-12">
                  <DollarSign className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-muted-foreground mb-2">
                    No tienes ingresos registrados
                  </h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Comienza agregando tu primer ingreso para empezar a gestionar tus finanzas
                  </p>
                  <Button onClick={() => setShowAddForm(true)} className="gap-2">
                    <Plus className="h-4 w-4" />
                    Agregar Mi Primer Ingreso
                  </Button>
                </div>
              ) : (
                incomes.map((income) => (
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
                            {income.description || 'Sin descripción'}
                          </p>
                          <div className="flex items-center gap-4 mt-1">
                            <Badge 
                              variant={income.is_active ? "default" : "secondary"} 
                              className="text-xs"
                            >
                              {income.is_active ? 'Activo' : 'Inactivo'}
                            </Badge>
                            <span className="text-xs text-muted-foreground">
                              {formatFrequency(income.frequency)}
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
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <div className="font-semibold text-green-600">
                          {formatCurrency(income.amount)}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {formatFrequency(income.frequency)}
                        </div>
                        {income.monthly_amount && (
                          <div className="text-xs text-muted-foreground">
                            ~{formatCurrency(income.monthly_amount)}/mes
                          </div>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <Button variant="ghost" size="sm">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => income.id && handleDeleteIncome(income.id)}
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default IncomeManagement;