import { useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, DollarSign, TrendingUp, TrendingDown, Plus, Package, Target, ArrowDownCircle, ArrowUpCircle, BarChart3 } from "lucide-react";
import { Link } from "react-router-dom";
import { useUserProfile } from "@/hooks/useUserProfile";
import { useCurrencyExchange } from "@/hooks/useCurrencyExchange";
import { useExpenses } from "@/hooks/useExpenses";
import { useIncomes } from "@/hooks/useIncomes";
import { useIncomeReceipts } from "@/hooks/useIncomeReceipts";
import { useExpensePayments } from "@/hooks/useExpensePayments";

const Dashboard = () => {
  const { profile } = useUserProfile();
  const userCurrency = profile?.primary_display_currency || 'USD';
  const { convertCurrency, formatCurrency: fmt, loading: ratesLoading } = useCurrencyExchange();
  const { expenses, loading: expLoading, getRecurringTemplates, getDueSoonRecurring, markExpensePaid } = useExpenses();
  const { incomes, loading: incLoading, markIncomeReceivedForMonth } = useIncomes();
  const { receipts, loading: recLoading, upsertReceipt } = useIncomeReceipts();
  const { payments, loading: payLoading } = useExpensePayments();

  const monthKey = (d: Date | string) => {
    const date = typeof d === 'string' ? new Date(d) : d;
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    return `${y}-${m}`;
  };
  const now = useMemo(() => new Date(), []);
  const current = monthKey(now);
  const prev = (() => { const d = new Date(now.getFullYear(), now.getMonth()-1, 1); return monthKey(d); })();

  // Real MTD from normalized tables
  const incMTD = useMemo(() => {
    return receipts
      .filter(r => r.period_month === current)
      .reduce((s, r) => s + convertCurrency(r.amount || 0, r.currency || userCurrency, userCurrency), 0);
  }, [receipts, current, convertCurrency, userCurrency]);

  const expMTD = useMemo(() => {
    return payments
      .filter(p => p.period_month === current)
      .reduce((s, p) => s + convertCurrency(p.amount || 0, p.currency || userCurrency, userCurrency), 0);
  }, [payments, current, convertCurrency, userCurrency]);

  const netMTD = incMTD - expMTD;
  const srMTD = incMTD > 0 ? netMTD / incMTD : 0;

  const netPrev = useMemo(() => {
    const incPrev = receipts.filter(r => r.period_month === prev)
      .reduce((s, r) => s + convertCurrency(r.amount || 0, r.currency || userCurrency, userCurrency), 0);
    const expPrev = payments.filter(p => p.period_month === prev)
      .reduce((s, p) => s + convertCurrency(p.amount || 0, p.currency || userCurrency, userCurrency), 0);
    return incPrev - expPrev;
  }, [receipts, payments, prev, convertCurrency, userCurrency]);

  // Coverage and pending
  const coverage = useMemo(() => {
    const today = now;
    const receivedIds = new Set(receipts.filter(r => r.period_month === current).map(r => r.income_id));
    const incomesActive = incomes.filter(i => i.is_active);
    const incomeCoverage = incomesActive.length > 0 ? (receivedIds.size / incomesActive.length) : 0;
    const incomesDue = incomesActive.filter(i => i.payment_day && i.payment_day <= today.getDate() && !receivedIds.has(i.id)).slice(0, 5);

    const instancesThisMonth = expenses.filter(e => {
      if (!Array.isArray(e.tags) || !e.tags.includes('recurrence-instance')) return false;
      if (!e.transaction_date) return false;
      return monthKey(e.transaction_date) === current;
    });
    const paidIds = new Set(payments.filter(p => p.period_month === current).map(p => p.expense_id));
    const expenseCoverage = instancesThisMonth.length > 0 ? (instancesThisMonth.filter(e => paidIds.has(e.id)).length / instancesThisMonth.length) : 0;
    const expensesDue = instancesThisMonth.filter(e => {
      const d = e.transaction_date ? new Date(e.transaction_date) : today;
      return d <= today && !paidIds.has(e.id);
    }).slice(0, 5);

    return { incomeCoverage, expenseCoverage, incomesDue, expensesDue };
  }, [incomes, receipts, expenses, payments, current, now]);

  // Latest movements
  const latestReceipts = useMemo(() => {
    return [...receipts].sort((a, b) => new Date(b.received_at || b.created_at || '').getTime() - new Date(a.received_at || a.created_at || '').getTime()).slice(0, 5);
  }, [receipts]);
  const latestPayments = useMemo(() => {
    return [...payments].sort((a, b) => new Date(b.paid_at || b.created_at || '').getTime() - new Date(a.paid_at || a.created_at || '').getTime()).slice(0, 5);
  }, [payments]);

  const loading = expLoading || incLoading || recLoading || payLoading || ratesLoading;
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Empty state for new users
  if (expenses.length === 0 && receipts.length === 0 && payments.length === 0) {
    return (
      <div className="container mx-auto p-6 space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Dashboard</h1>
            <p className="text-muted-foreground">
              ¡Bienvenido! Comienza agregando tus primeros ingresos y gastos.
            </p>
          </div>
        </div>

        {/* Empty State */}
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <div className="rounded-full bg-muted p-6 mb-4">
            <Package className="h-12 w-12 text-muted-foreground" />
          </div>
          <h3 className="text-xl font-semibold mb-2">No tienes movimientos aún</h3>
          <p className="text-muted-foreground mb-6 max-w-md">
            Comienza a gestionar tus finanzas agregando tus primeros ingresos y gastos.
            Podrás ver tu resumen consolidado y configurar recordatorios por gastos recurrentes.
          </p>
          <Link to="/finance/expenses">
            <Button size="lg" className="gap-2">
              <Plus className="h-4 w-4" />
              Agregar mi primer gasto
            </Button>
          </Link>
        </div>

        {/* Stats Cards - Show zeros */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Ingresos MTD</CardTitle>
              <ArrowDownCircle className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{fmt(0, userCurrency)}</div>
              <p className="text-xs text-muted-foreground">mes actual</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Gastos MTD</CardTitle>
              <ArrowUpCircle className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{fmt(0, userCurrency)}</div>
              <p className="text-xs text-muted-foreground">mes actual</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Neto MTD</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{fmt(0, userCurrency)}</div>
              <p className="text-xs text-muted-foreground">savings rate 0%</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Cobertura</CardTitle>
              <Target className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">0% / 0%</div>
              <p className="text-xs text-muted-foreground">ingresos / gastos</p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground">Resumen del mes basado en movimientos reales</p>
        </div>
        <div className="flex gap-2">
          <Link to="/analytics">
            <Button variant="secondary" className="gap-2">
              <BarChart3 className="h-4 w-4" /> Ver analíticas
            </Button>
          </Link>
          <Link to="/finance/expenses">
            <Button className="gap-2">
              <Plus className="h-4 w-4" /> Agregar Gasto
            </Button>
          </Link>
        </div>
      </div>

      {/* Top KPI cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ingresos MTD</CardTitle>
            <ArrowDownCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-700">{fmt(incMTD, userCurrency)}</div>
            <p className="text-xs text-muted-foreground">mes actual</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Gastos MTD</CardTitle>
            <ArrowUpCircle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-700">{fmt(expMTD, userCurrency)}</div>
            <p className="text-xs text-muted-foreground">mes actual</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Neto MTD</CardTitle>
            {netMTD >= 0 ? <TrendingUp className="h-4 w-4 text-green-600" /> : <TrendingDown className="h-4 w-4 text-red-600" />}
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${netMTD>=0?'text-green-700':'text-red-700'}`}>{fmt(netMTD, userCurrency)}</div>
            <p className="text-xs text-muted-foreground">Savings rate: {(srMTD*100).toFixed(1)}% • MoM: {netMTD - netPrev >= 0 ? '+' : ''}{fmt(netMTD - netPrev, userCurrency)}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Cobertura del mes</CardTitle>
            <Target className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="flex gap-6 items-end">
              <div>
                <div className="text-xs text-muted-foreground">Ingresos</div>
                <div className="text-xl font-semibold">{Math.round(coverage.incomeCoverage*100)}%</div>
              </div>
              <div>
                <div className="text-xs text-muted-foreground">Gastos</div>
                <div className="text-xl font-semibold">{Math.round(coverage.expenseCoverage*100)}%</div>
              </div>
            </div>
            {(coverage.incomesDue.length>0 || coverage.expensesDue.length>0) && (
              <p className="text-xs text-muted-foreground mt-2">Pendientes: {coverage.incomesDue.length} ingresos • {coverage.expensesDue.length} gastos</p>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Próximos recurrentes */}
        <Card>
          <CardHeader>
            <CardTitle>Próximos recurrentes</CardTitle>
            <CardDescription>Gastos recurrentes a confirmar pronto</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {getDueSoonRecurring().length > 0 ? (
              getDueSoonRecurring().map((item) => (
                <div key={item.template.id} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-destructive rounded-full animate-pulse"></div>
                    <div>
                      <p className="text-sm font-medium">{item.template.name}</p>
                      <p className="text-xs text-muted-foreground">Sugerido: {new Date(item.suggested.date).toLocaleDateString('es-ES')}</p>
                    </div>
                  </div>
                  <Badge variant="outline">
                    {fmt(
                      convertCurrency(item.suggested.amount || 0, item.template.currency || 'USD', userCurrency),
                      userCurrency
                    )}
                  </Badge>
                </div>
              ))
            ) : (
              <p className="text-muted-foreground text-center py-4">No hay renovaciones próximas</p>
            )}
          </CardContent>
        </Card>

        {/* Pendientes del mes */}
        <Card>
          <CardHeader>
            <CardTitle>Pendientes del mes</CardTitle>
            <CardDescription>Ingresos por recibir y gastos por pagar</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-2">
            <div>
              <h4 className="text-sm font-medium mb-2">Ingresos</h4>
              {coverage.incomesDue.length > 0 ? (
                <div className="space-y-2">
                  {coverage.incomesDue.map(i => (
                    <div key={i.id} className="flex items-center justify-between gap-2">
                      <span className="text-sm">{i.name || 'Ingreso'}</span>
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary">día {i.payment_day || '-'}</Badge>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={async () => {
                            const currencyTag = Array.isArray(i.tags) ? i.tags.find(t => t.startsWith('currency:')) : undefined;
                            const ccy = currencyTag ? currencyTag.replace('currency:', '') : userCurrency;
                            const todayStr = new Date().toISOString().slice(0,10);
                            await upsertReceipt({ income_id: i.id, amount: i.amount || 0, currency: ccy, received_at: todayStr });
                            await markIncomeReceivedForMonth(i.id, now);
                          }}
                        >
                          Marcar recibido
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : <p className="text-muted-foreground text-sm">Sin pendientes</p>}
            </div>
            <div>
              <h4 className="text-sm font-medium mb-2">Gastos</h4>
              {coverage.expensesDue.length > 0 ? (
                <div className="space-y-2">
                  {coverage.expensesDue.map(e => (
                    <div key={e.id} className="flex items-center justify-between gap-2">
                      <span className="text-sm">{e.name}</span>
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary">{new Date(e.transaction_date!).toLocaleDateString('es-ES')}</Badge>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={async () => {
                            await markExpensePaid(e.id);
                          }}
                        >
                          Marcar pagado
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : <p className="text-muted-foreground text-sm">Sin pendientes</p>}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Últimos movimientos */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Últimos ingresos</CardTitle>
            <CardDescription>Registros más recientes</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {latestReceipts.length > 0 ? latestReceipts.map(r => (
              <div key={r.id} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-green-600 rounded-full"></div>
                  <div>
                    <p className="text-sm font-medium">{r.period_month}</p>
                    <p className="text-xs text-muted-foreground">{new Date(r.received_at || r.created_at || '').toLocaleDateString('es-ES')}</p>
                  </div>
                </div>
                <Badge variant="secondary">{fmt(convertCurrency(r.amount || 0, r.currency || userCurrency, userCurrency), userCurrency)}</Badge>
              </div>
            )) : <p className="text-muted-foreground text-center py-4">Sin ingresos</p>}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Últimos pagos</CardTitle>
            <CardDescription>Gastos pagados más recientes</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {latestPayments.length > 0 ? latestPayments.map(p => (
              <div key={p.id} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-red-600 rounded-full"></div>
                  <div>
                    <p className="text-sm font-medium">{p.period_month}</p>
                    <p className="text-xs text-muted-foreground">{new Date(p.paid_at || p.created_at || '').toLocaleDateString('es-ES')}</p>
                  </div>
                </div>
                <Badge variant="secondary">{fmt(convertCurrency(p.amount || 0, p.currency || userCurrency, userCurrency), userCurrency)}</Badge>
              </div>
            )) : <p className="text-muted-foreground text-center py-4">Sin pagos</p>}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;