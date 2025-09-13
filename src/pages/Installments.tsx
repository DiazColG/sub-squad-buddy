import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Plus, Calendar, DollarSign, CreditCard, TrendingUp, TrendingDown, BarChart3 } from "lucide-react";
import { useInstallments } from "@/hooks/useInstallments";
import { AddInstallmentForm } from "@/components/AddInstallmentForm";
import { EconomicAnalysisComponent } from "@/components/EconomicAnalysisComponent";
import { economicService, type EconomicIndicator } from "@/lib/economicService";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

export const Installments = () => {
  const { installments, isLoading } = useInstallments();
  const [showAddForm, setShowAddForm] = useState(false);
  const [economicIndicators, setEconomicIndicators] = useState<EconomicIndicator[]>([]);

  // Load economic indicators when component mounts
  useEffect(() => {
    const loadIndicators = async () => {
      try {
        const indicators = await economicService.getEconomicIndicators();
        setEconomicIndicators(indicators);
      } catch (error) {
        console.error('Error loading economic indicators:', error);
        // Set empty array as fallback
        setEconomicIndicators([]);
      }
    };

    loadIndicators();
  }, []);

  if (isLoading) {
    return (
      <div className="container mx-auto p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-48 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const activeInstallments = installments?.filter(i => i.status === 'active') || [];
  const totalMonthlyCommitment = activeInstallments.reduce(
    (sum, installment) => sum + Number(installment.installment_amount), 0
  );

  const upcomingPayments = activeInstallments
    .filter(i => {
      const dueDate = new Date(i.next_due_date);
      const today = new Date();
      const diffTime = dueDate.getTime() - today.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return diffDays <= 7 && diffDays >= 0;
    })
    .sort((a, b) => new Date(a.next_due_date).getTime() - new Date(b.next_due_date).getTime());

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-500';
      case 'completed': return 'bg-blue-500';
      case 'paused': return 'bg-yellow-500';
      default: return 'bg-gray-500';
    }
  };

  const getCategoryEmoji = (category: string) => {
    const emojis: Record<string, string> = {
      electronics: '📱',
      clothing: '👕',
      home: '🏠',
      automotive: '🚗',
      education: '📚',
      health: '⚕️',
      general: '🛍️'
    };
    return emojis[category] || '🛍️';
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const calculateProgress = (paid: number, total: number) => {
    return (paid / total) * 100;
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">💰 Cuotas</h1>
          <p className="text-gray-600 mt-1">
            Gestiona tus compras en cuotas y analiza su impacto económico
          </p>
        </div>
        
        <Dialog open={showAddForm} onOpenChange={setShowAddForm}>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-2">
              <Plus className="w-4 h-4" />
              Agregar Cuota
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Agregar Nueva Compra en Cuotas</DialogTitle>
            </DialogHeader>
            <AddInstallmentForm onSuccess={() => setShowAddForm(false)} />
          </DialogContent>
        </Dialog>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Cuotas Activas</p>
                <p className="text-2xl font-bold">{activeInstallments.length}</p>
              </div>
              <CreditCard className="w-8 h-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Compromiso Mensual</p>
                <p className="text-2xl font-bold">{formatCurrency(totalMonthlyCommitment)}</p>
              </div>
              <DollarSign className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Próximos Venc.</p>
                <p className="text-2xl font-bold">{upcomingPayments.length}</p>
              </div>
              <Calendar className="w-8 h-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Análisis Económico</p>
                <div className="flex items-center gap-1">
                  <TrendingDown className="w-4 h-4 text-red-500" />
                  <span className="text-sm text-gray-600">Licuación promedio</span>
                </div>
              </div>
              <TrendingUp className="w-8 h-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Upcoming Payments */}
      {upcomingPayments.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              Próximos Vencimientos (7 días)
            </CardTitle>
            <CardDescription>
              Cuotas que vencen en los próximos 7 días
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {upcomingPayments.map((installment) => {
                const dueDate = new Date(installment.next_due_date);
                const today = new Date();
                const diffDays = Math.ceil((dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
                
                return (
                  <div key={installment.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{getCategoryEmoji(installment.category)}</span>
                      <div>
                        <p className="font-medium">{installment.purchase_name}</p>
                        <p className="text-sm text-gray-600">
                          Cuota {installment.paid_installments + 1} de {installment.total_installments}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">{formatCurrency(Number(installment.installment_amount))}</p>
                      <Badge variant={diffDays <= 2 ? "destructive" : "secondary"}>
                        {diffDays === 0 ? "Hoy" : diffDays === 1 ? "Mañana" : `${diffDays} días`}
                      </Badge>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Active Installments */}
      <Card>
        <CardHeader>
          <CardTitle>Cuotas Activas</CardTitle>
          <CardDescription>
            Todas tus compras en cuotas actualmente en curso
          </CardDescription>
        </CardHeader>
        <CardContent>
          {activeInstallments.length === 0 ? (
            <div className="text-center py-8">
              <CreditCard className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 mb-2">No tienes cuotas activas</p>
              <p className="text-sm text-gray-500">Agrega tu primera compra en cuotas para comenzar</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {activeInstallments.map((installment) => {
                const progress = calculateProgress(installment.paid_installments, installment.total_installments);
                const remaining = installment.total_installments - installment.paid_installments;
                const remainingAmount = remaining * Number(installment.installment_amount);
                
                return (
                  <Card key={installment.id} className="hover:shadow-md transition-shadow">
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-2xl">{getCategoryEmoji(installment.category)}</span>
                          <div>
                            <CardTitle className="text-lg">{installment.purchase_name}</CardTitle>
                            <p className="text-sm text-gray-600 capitalize">{installment.category}</p>
                          </div>
                        </div>
                        <Badge className={`${getStatusColor(installment.status)} text-white`}>
                          {installment.status}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Progreso</span>
                          <span>{installment.paid_installments}/{installment.total_installments}</span>
                        </div>
                        <Progress value={progress} className="h-2" />
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <p className="text-gray-600">Cuota</p>
                          <p className="font-semibold">{formatCurrency(Number(installment.installment_amount))}</p>
                        </div>
                        <div>
                          <p className="text-gray-600">Restante</p>
                          <p className="font-semibold">{formatCurrency(remainingAmount)}</p>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <p className="text-gray-600">Total</p>
                          <p className="font-semibold">{formatCurrency(Number(installment.total_amount))}</p>
                        </div>
                        <div>
                          <p className="text-gray-600">Próximo venc.</p>
                          <p className="font-semibold">
                            {new Date(installment.next_due_date).toLocaleDateString('es-AR')}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Economic Analysis Section */}
      {activeInstallments.length > 0 && (
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5" />
              <CardTitle>Análisis Económico</CardTitle>
            </div>
            <CardDescription>
              Análisis de inflación, licuación y proyecciones en USD para tus cuotas
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {activeInstallments.map((installment) => (
                <div key={`analysis-${installment.id}`} className="border rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-4">
                    <span className="text-xl">{getCategoryEmoji(installment.category)}</span>
                    <h3 className="text-lg font-semibold">{installment.purchase_name}</h3>
                    <Badge variant="outline" className="ml-auto">
                      {installment.paid_installments}/{installment.total_installments} cuotas
                    </Badge>
                  </div>
                  <EconomicAnalysisComponent 
                    installment={installment}
                    indicators={economicIndicators}
                  />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};