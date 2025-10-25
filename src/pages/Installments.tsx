import { useState, useEffect, useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Calendar, DollarSign, CreditCard, TrendingUp, TrendingDown, BarChart3 } from "lucide-react";
import { EconomicAnalysisComponent } from "@/components/EconomicAnalysisComponent";
import { economicService, type EconomicIndicator } from "@/lib/economicService";
// Removed add-installment modal from this page (creation is done in Gastos)
import { useExpenses, type ExpenseRow } from "@/hooks/useExpenses";
import type { InstallmentData } from "@/hooks/useInstallments";
import { useAuth } from "@/hooks/useAuth";
import { useSubscriptionsView } from "@/hooks/useSubscriptionsView";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export const Installments = () => {
  // Source of truth: expenses with installment tags
  const { expenses, loading, isExpensePaid, markExpensePaid } = useExpenses();
  const { user } = useAuth();
  const [economicIndicators, setEconomicIndicators] = useState<EconomicIndicator[]>([]);
  // Subscriptions (read-only) view hook
  const subsApi = useSubscriptionsView();

  // Helpers for tags
  const hasTag = (e: ExpenseRow, tag: string) => Array.isArray(e.tags) && e.tags.includes(tag);
  const getTagValue = (e: ExpenseRow, prefix: string) => {
    if (!Array.isArray(e.tags)) return undefined;
    const found = e.tags.find(t => t.startsWith(prefix));
    return found ? found.substring(prefix.length) : undefined;
  };

  // Auto-mark overdue installment instances as paid (persistently)
  useEffect(() => {
    const todayStr = new Date().toISOString().slice(0, 10);
    const toAutopay = (expenses as ExpenseRow[] || [])
      .filter(e => hasTag(e, 'installment-instance'))
      .filter(e => !isExpensePaid(e))
      .filter(e => e.due_date && e.due_date <= todayStr);
    if (toAutopay.length === 0) return;
    (async () => {
      for (const e of toAutopay) {
        // Mark with the due_date as paid_at for accurate accrual history
        await markExpensePaid(e.id, e.due_date || todayStr, { silent: true });
      }
    })();
  }, [expenses, isExpensePaid, markExpensePaid]);

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

  // Build grouped installments from expenses
  const groups = useMemo(() => {
    const items = (expenses as ExpenseRow[] || []).filter(e => hasTag(e, 'installment-instance'));
    const byGroup = new Map<string, ExpenseRow[]>();
    for (const e of items) {
      const gid = getTagValue(e, 'installment-group:');
      if (!gid) continue;
      const arr = byGroup.get(gid) || [];
      arr.push(e);
      byGroup.set(gid, arr);
    }
    const today = new Date().toISOString().slice(0, 10);
    const toNumber = (s?: string) => (s ? Number(s) : undefined);
    const adapt = (gid: string, rows: ExpenseRow[]): InstallmentData => {
      const sorted = rows.slice().sort((a,b) => (a.due_date || a.transaction_date).localeCompare(b.due_date || b.transaction_date));
      const nameBase = (sorted[0]?.name || '').split(' — Cuota')[0] || sorted[0]?.name || 'Compra en cuotas';
      const totalInstallments = toNumber(getTagValue(sorted[0], 'installment-total:')) || rows.length;
      const paidCount = rows.filter(r => (Array.isArray(r.tags) && r.tags.includes('paid')) || ((r.due_date || '') <= today)).length;
      const unpaid = rows.filter(r => !((Array.isArray(r.tags) && r.tags.includes('paid')) || ((r.due_date || '') <= today)));
      const nextDue = unpaid.length > 0 ? (unpaid[0].due_date || unpaid[0].transaction_date) : (rows[rows.length-1].due_date || rows[rows.length-1].transaction_date);
      const perAmount = rows[0]?.amount || 0;
      const totalAmount = rows.reduce((s, r) => s + (r.amount || 0), 0);
      const firstDate = sorted[0]?.transaction_date || sorted[0]?.due_date || today;
      const dueDay = new Date(nextDue).getDate();
      const status: InstallmentData['status'] = paidCount >= totalInstallments ? 'completed' : 'active';
      return {
        id: gid,
        user_id: user?.id || '',
        purchase_name: nameBase,
        total_amount: totalAmount,
        installment_amount: perAmount,
        total_installments: totalInstallments,
        paid_installments: Math.min(paidCount, totalInstallments),
        due_day: dueDay,
        card_id: rows[0]?.card_id || undefined,
        category: 'general',
        purchase_date: firstDate,
        next_due_date: nextDue,
        status,
        created_at: rows[0]?.created_at || firstDate,
        updated_at: rows[0]?.updated_at || firstDate,
      } as InstallmentData;
    };
    return Array.from(byGroup.entries()).map(([gid, rows]) => adapt(gid, rows));
  }, [expenses, user]);

  if (loading) {
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

  const activeInstallments = groups.filter(i => i.status === 'active');
  const totalMonthlyCommitment = activeInstallments.reduce((sum, inst) => sum + Number(inst.installment_amount || 0), 0);

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

      {/* Suscripciones (solo ver/control) */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>🧩 Suscripciones</CardTitle>
              <CardDescription>Vista de tus suscripciones activas y próximas renovaciones</CardDescription>
            </div>
            <div className="text-right">
              <div className="text-sm text-gray-600">Activas</div>
              <div className="text-2xl font-bold">{subsApi.activeCount}</div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Próximas renovaciones */}
          {subsApi.upcoming7.length > 0 && (
            <div>
              <div className="font-medium mb-2">Próximas renovaciones (7 días)</div>
              <div className="space-y-2">
                {subsApi.upcoming7.map(s => {
                  const due = new Date(s.nextRenewalDate);
                  const today = new Date();
                  const diff = Math.ceil((due.getTime()-today.getTime())/(1000*60*60*24));
                  return (
                    <div key={`upcoming-${s.id}`} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <span className="text-xl">📦</span>
                        <div>
                          <div className="font-medium">{s.serviceName}</div>
                          <div className="text-xs text-gray-500">{s.cycle}</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold">{formatCurrency(s.amountPerCycle)} {s.currency}</div>
                        <Badge variant={diff <= 2 ? 'destructive' : 'secondary'}>
                          {diff === 0 ? 'Hoy' : diff === 1 ? 'Mañana' : `${diff} días`}
                        </Badge>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Listado */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {subsApi.subscriptions.map(s => (
              <Card key={s.id} className="border rounded-lg">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg flex items-center gap-2">
                        <span>📦</span>
                        {s.serviceName}
                      </CardTitle>
                      <CardDescription className="capitalize">{s.cycle}</CardDescription>
                    </div>
                    <Badge>{s.status}</Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <div className="text-gray-600">Costo</div>
                      <div className="font-semibold">{formatCurrency(s.amountPerCycle)} {s.currency}</div>
                    </div>
                    <div>
                      <div className="text-gray-600">Próx. renovación</div>
                      <div className="font-semibold">{new Date(s.nextRenewalDate).toLocaleDateString('es-AR')}</div>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <div className="text-gray-600">Medio de pago</div>
                      <div className="font-semibold">
                        {s.payment?.bank ? `${s.payment.bank} •••• ${s.payment.cardLast4}` : (s.payment?.kind || '—')}
                      </div>
                    </div>
                    <div>
                      <div className="text-gray-600">Mensual equivalente</div>
                      <div className="font-semibold">{formatCurrency(s.monthlyEquivalent)} {s.currency}</div>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor={`user-${s.id}`}>Usuario (opcional)</Label>
                    <Input id={`user-${s.id}`} defaultValue={s.username || ''} onBlur={(e) => subsApi.setUsername(s.id, e.target.value)} placeholder="tu usuario en el servicio" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};