import { useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, DollarSign, TrendingUp, TrendingDown, Plus, Package, Target, ArrowDownCircle, ArrowUpCircle, BarChart3 } from "lucide-react";
import { Link } from "react-router-dom";
import { useUserProfile } from "@/hooks/useUserProfile";
import { useCurrencyExchange } from "@/hooks/useCurrencyExchange";
import { useExpenses, type ExpenseRow } from "@/hooks/useExpenses";
import { useIncomes } from "@/hooks/useIncomes";
import { useIncomeReceipts } from "@/hooks/useIncomeReceipts"; // Mantengo para secciones históricas / futuro cash view
import { useExpensePayments } from "@/hooks/useExpensePayments";
import { accruedIncomeForMonth, accruedExpenseForMonth, normalizeRecurring } from '@/lib/accrual';
import { monthKey } from '@/lib/dateUtils';

const Dashboard = () => {
  const { profile } = useUserProfile();
  const userCurrency = profile?.primary_display_currency || 'USD';
  const { convertCurrency, formatCurrency: fmt, loading: ratesLoading } = useCurrencyExchange();
  const { expenses, loading: expLoading, getRecurringTemplates, getDueSoonRecurring, markExpensePaid } = useExpenses();
  const { incomes, loading: incLoading, markIncomeReceivedForMonth } = useIncomes();
  const { receipts, loading: recLoading, upsertReceipt } = useIncomeReceipts();
  const { payments, loading: payLoading } = useExpensePayments();

  // Usar util central
  const now = useMemo(() => new Date(), []);
  const current = monthKey(now);
  const prev = (() => { const d = new Date(now.getFullYear(), now.getMonth()-1, 1); return monthKey(d); })();

  // Real MTD from normalized tables
  // Ingresos: convertimos cada fuente a la moneda del perfil antes de sumar
  const incMTD = useMemo(() => {
    const key = monthKey(now);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    let total = 0;
    for (const i of incomes) {
      if (!i.is_active) continue;
      if (i.start_date && new Date(i.start_date) > endOfMonth) continue;
      if (i.frequency === 'once' && i.start_date && monthKey(i.start_date) !== key) continue;
      const fromCcy = (Array.isArray(i.tags) ? i.tags.find(t => t.startsWith('currency:')) : undefined)?.replace('currency:', '') || userCurrency;
      const base = normalizeRecurring(i.amount || 0, i.frequency);
      total += convertCurrency(base, fromCcy, userCurrency);
    }
    return total;
  }, [incomes, now, userCurrency, convertCurrency]);
  const expMTD = useMemo(() => {
    // Convertimos cada gasto a la moneda del perfil antes de sumar
    const key = monthKey(now);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    let total = 0;
    for (const e of expenses as ExpenseRow[]) {
      const fromCcy = e.currency || userCurrency;
      if (e.is_recurring) {
        if (e.transaction_date && new Date(e.transaction_date) > endOfMonth) continue;
        const base = accruedExpenseForMonth([{ amount: e.amount, frequency: e.frequency, is_recurring: true, transaction_date: e.transaction_date }], now);
        total += convertCurrency(base, fromCcy, userCurrency);
        continue;
      }
      if (e.transaction_date && monthKey(e.transaction_date) === key) {
        total += convertCurrency(e.amount || 0, fromCcy, userCurrency);
      }
    }
    return total;
  }, [expenses, now, userCurrency, convertCurrency]);

  const netMTD = incMTD - expMTD;
  const srMTD = incMTD > 0 ? netMTD / incMTD : 0;

  const netPrev = useMemo(() => {
    const prevDate = new Date(now.getFullYear(), now.getMonth()-1, 1);
    // Ingresos del mes anterior convertidos a moneda del perfil
    const keyPrevIncome = monthKey(prevDate);
    const endPrevIncome = new Date(prevDate.getFullYear(), prevDate.getMonth() + 1, 0);
    let incomePrev = 0;
    for (const i of incomes) {
      if (!i.is_active) continue;
      if (i.start_date && new Date(i.start_date) > endPrevIncome) continue;
      if (i.frequency === 'once' && i.start_date && monthKey(i.start_date) !== keyPrevIncome) continue;
      const fromCcy = (Array.isArray(i.tags) ? i.tags.find(t => t.startsWith('currency:')) : undefined)?.replace('currency:', '') || userCurrency;
      const base = normalizeRecurring(i.amount || 0, i.frequency);
      incomePrev += convertCurrency(base, fromCcy, userCurrency);
    }
    // Convertir gastos del mes anterior a moneda del perfil
    const keyPrevExp = monthKey(prevDate);
    const endPrev = new Date(prevDate.getFullYear(), prevDate.getMonth() + 1, 0);
    let expPrev = 0;
    for (const e of expenses as ExpenseRow[]) {
      const fromCcy = e.currency || userCurrency;
      if (e.is_recurring) {
        if (e.transaction_date && new Date(e.transaction_date) > endPrev) continue;
        const base = accruedExpenseForMonth([{ amount: e.amount, frequency: e.frequency, is_recurring: true, transaction_date: e.transaction_date }], prevDate);
        expPrev += convertCurrency(base, fromCcy, userCurrency);
        continue;
      }
      if (e.transaction_date && monthKey(e.transaction_date) === keyPrevExp) {
        expPrev += convertCurrency(e.amount || 0, fromCcy, userCurrency);
      }
    }
    return incomePrev - expPrev;
  }, [incomes, expenses, now, userCurrency, convertCurrency]);

  // Coverage and pending
  // Placeholder futuro: cobertura de cobros/pagos (se elimina de la métrica principal devengada)
  type IncomeLike = typeof incomes[number];
  type ExpenseLike = typeof expenses[number];
  const coverage: { incomeCoverage: number; expenseCoverage: number; incomesDue: IncomeLike[]; expensesDue: ExpenseLike[] } = { incomeCoverage: 0, expenseCoverage: 0, incomesDue: [], expensesDue: [] };

  // Latest movements
  const latestReceipts = useMemo(() => {
    return [...receipts].sort((a, b) => new Date(b.received_at || b.created_at || '').getTime() - new Date(a.received_at || a.created_at || '').getTime()).slice(0, 5);
  }, [receipts]);
  const latestPayments = useMemo(() => {
    return [...payments].sort((a, b) => new Date(b.paid_at || b.created_at || '').getTime() - new Date(a.paid_at || a.created_at || '').getTime()).slice(0, 5);
  }, [payments]);

  const loading = expLoading || incLoading || ratesLoading; // receipts/payments ya no bloquean métricas devengadas
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Empty state for new users
  if (expenses.length === 0 && incomes.length === 0) {
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
    <div className="container mx-auto p-4 md:p-6 space-y-6 md:space-y-8">
      {/* Header - Mobile optimized */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">Dashboard</h1>
          <p className="text-sm md:text-base text-muted-foreground">Resumen del mes basado en movimientos reales</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link to="/analytics" className="flex-1 md:flex-none">
            <Button variant="secondary" className="gap-2 w-full md:w-auto">
              <BarChart3 className="h-4 w-4" /> 
              <span className="hidden sm:inline">Ver analíticas</span>
              <span className="sm:hidden">Analíticas</span>
            </Button>
          </Link>
          <Link to="/finance/expenses" className="flex-1 md:flex-none">
            <Button className="gap-2 w-full md:w-auto">
              <Plus className="h-4 w-4" /> 
              <span className="hidden sm:inline">Agregar Gasto</span>
              <span className="sm:hidden">Gasto</span>
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