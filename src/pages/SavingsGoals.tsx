import React, { useState } from 'react';
import { Layout } from '@/components/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { useUserSettings } from '@/hooks/useUserSettings';
import { Target, Plus, DollarSign, Calendar, TrendingUp, CheckCircle, Info } from 'lucide-react';

const SavingsGoals = () => {
  const { isFeatureEnabled } = useUserSettings();
  const [showAddForm, setShowAddForm] = useState(false);

  // Mock data para demostración
  const mockGoals = [
    {
      id: '1',
      name: 'Fondo de Emergencia',
      description: 'Ahorro para emergencias (6 meses de gastos)',
      target_amount: 15000,
      current_amount: 8500,
      target_date: '2024-12-31',
      is_active: true,
      priority: 'high',
      created_at: '2024-01-01'
    },
    {
      id: '2',
      name: 'Vacaciones en Europa',
      description: 'Viaje familiar de 15 días',
      target_amount: 5000,
      current_amount: 2300,
      target_date: '2024-07-15',
      is_active: true,
      priority: 'medium',
      created_at: '2024-01-15'
    },
    {
      id: '3',
      name: 'Auto Nuevo',
      description: 'Anticipo para auto 0km',
      target_amount: 12000,
      current_amount: 12000,
      target_date: '2024-03-01',
      is_active: false,
      priority: 'high',
      created_at: '2023-06-01'
    },
    {
      id: '4',
      name: 'Curso de Programación',
      description: 'Bootcamp de desarrollo web',
      target_amount: 800,
      current_amount: 320,
      target_date: '2024-04-30',
      is_active: true,
      priority: 'low',
      created_at: '2024-02-01'
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
  const activeGoals = mockGoals.filter(goal => goal.is_active);
  const completedGoals = mockGoals.filter(goal => !goal.is_active);
  const totalSaved = mockGoals.reduce((sum, goal) => sum + goal.current_amount, 0);
  const totalTargets = activeGoals.reduce((sum, goal) => sum + goal.target_amount, 0);

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

  const getProgressPercentage = (current: number, target: number) => {
    return Math.min((current / target) * 100, 100);
  };

  const getPriorityBadge = (priority: string) => {
    const colorMap = {
      high: 'bg-red-100 text-red-800',
      medium: 'bg-yellow-100 text-yellow-800',
      low: 'bg-blue-100 text-blue-800'
    };
    
    const labelMap = {
      high: 'Alta',
      medium: 'Media',
      low: 'Baja'
    };

    return (
      <Badge className={colorMap[priority as keyof typeof colorMap] || 'bg-gray-100 text-gray-800'}>
        {labelMap[priority as keyof typeof labelMap] || priority}
      </Badge>
    );
  };

  const getDaysUntilTarget = (targetDate: string) => {
    const today = new Date();
    const target = new Date(targetDate);
    const diffTime = target.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  return (
    <Layout>
      <div className="container mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">🎯 Metas de Ahorro</h1>
            <p className="text-gray-600 mt-1">Define y alcanza tus objetivos financieros</p>
          </div>
          <Button 
            onClick={() => setShowAddForm(true)} 
            className="bg-green-600 hover:bg-green-700"
          >
            <Plus className="h-4 w-4 mr-2" />
            Nueva Meta
          </Button>
        </div>

        {/* Resumen de metas */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Metas Activas</CardTitle>
              <Target className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">
                {activeGoals.length}
              </div>
              <p className="text-xs text-muted-foreground">
                En progreso
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Metas Completadas</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {completedGoals.length}
              </div>
              <p className="text-xs text-muted-foreground">
                Objetivos alcanzados
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Ahorrado</CardTitle>
              <DollarSign className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {formatCurrency(totalSaved)}
              </div>
              <p className="text-xs text-muted-foreground">
                Acumulado en todas las metas
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Objetivos Totales</CardTitle>
              <TrendingUp className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">
                {formatCurrency(totalTargets)}
              </div>
              <p className="text-xs text-muted-foreground">
                Suma de metas activas
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Metas Activas */}
        <Card>
          <CardHeader>
            <CardTitle>Metas en Progreso</CardTitle>
            <CardDescription>
              Tus objetivos de ahorro actuales y su progreso
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {activeGoals.map((goal) => {
                const progress = getProgressPercentage(goal.current_amount, goal.target_amount);
                const daysLeft = getDaysUntilTarget(goal.target_date);
                const remainingAmount = goal.target_amount - goal.current_amount;
                
                return (
                  <div key={goal.id} className="border rounded-lg p-6 space-y-4">
                    <div className="flex items-start justify-between">
                      <div className="space-y-2">
                        <div className="flex items-center space-x-2">
                          <h3 className="text-lg font-medium text-gray-900">{goal.name}</h3>
                          {getPriorityBadge(goal.priority)}
                        </div>
                        <p className="text-sm text-gray-600">{goal.description}</p>
                        <div className="flex items-center space-x-4 text-sm text-gray-500">
                          <span>Meta: {formatCurrency(goal.target_amount)}</span>
                          <span>•</span>
                          <span>Fecha límite: {formatDate(goal.target_date)}</span>
                          <span>•</span>
                          <span className={daysLeft < 30 ? 'text-red-600' : daysLeft < 90 ? 'text-yellow-600' : 'text-green-600'}>
                            {daysLeft > 0 ? `${daysLeft} días restantes` : 'Vencida'}
                          </span>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-green-600">
                          {formatCurrency(goal.current_amount)}
                        </div>
                        <div className="text-sm text-gray-500">
                          de {formatCurrency(goal.target_amount)}
                        </div>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span>Progreso: {progress.toFixed(1)}%</span>
                        <span className="text-gray-600">
                          Faltan {formatCurrency(remainingAmount)}
                        </span>
                      </div>
                      <Progress value={progress} className="w-full" />
                    </div>
                    
                    <div className="flex space-x-2 pt-2">
                      <Button size="sm" variant="outline">
                        Agregar Dinero
                      </Button>
                      <Button size="sm" variant="outline">
                        Editar Meta
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Metas Completadas */}
        {completedGoals.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <span>Metas Completadas</span>
              </CardTitle>
              <CardDescription>
                Objetivos que has alcanzado exitosamente
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {completedGoals.map((goal) => (
                  <div 
                    key={goal.id} 
                    className="flex items-center justify-between p-4 border rounded-lg bg-green-50"
                  >
                    <div className="flex items-center space-x-4">
                      <CheckCircle className="h-8 w-8 text-green-600" />
                      <div>
                        <h3 className="font-medium text-gray-900">{goal.name}</h3>
                        <p className="text-sm text-gray-600">{goal.description}</p>
                        <div className="flex items-center space-x-2 mt-1">
                          <Badge className="bg-green-100 text-green-800">Completada</Badge>
                          {getPriorityBadge(goal.priority)}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-semibold text-green-600">
                        {formatCurrency(goal.target_amount)}
                      </div>
                      <div className="text-xs text-gray-500">
                        Completada
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Estado beta */}
        <Alert>
          <Info className="h-4 w-4" />
          <AlertDescription>
            <strong>Funcionalidad Beta:</strong> Esta función está en desarrollo. 
            Los datos mostrados son ejemplos para demostración. La funcionalidad completa 
            incluirá formularios para crear/editar metas, agregar dinero a las metas y 
            sincronización con la base de datos.
          </AlertDescription>
        </Alert>
      </div>
    </Layout>
  );
};

export default SavingsGoals;