
import { useMemo, useCallback } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Layout } from "@/components/Layout";
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line } from 'recharts';
import { TrendingUp, TrendingDown, PieChart as PieChartIcon, BarChart3, Target } from 'lucide-react';
import { useUserProfile } from "@/hooks/useUserProfile";
import { useCurrencyExchange } from "@/hooks/useCurrencyExchange";
import { useIncomeReceipts } from "@/hooks/useIncomeReceipts";
import { useExpensePayments } from "@/hooks/useExpensePayments";
import { useIncomes } from "@/hooks/useIncomes";
import { useExpenses } from "@/hooks/useExpenses";
import { useFinancialCategories } from "@/hooks/useFinancialCategories";

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D'];

const Analytics = () => {
  const { profile } = useUserProfile();
  const userCurrency = profile?.primary_display_currency || 'USD';
  const { convertCurrency, formatCurrency: fmt } = useCurrencyExchange();
  const { receipts } = useIncomeReceipts();
  const { payments } = useExpensePayments();
  const { incomes } = useIncomes();
  const { expenses } = useExpenses();
  const { categories } = useFinancialCategories();

  const monthKey = (d: Date | string) => {
    const date = typeof d === 'string' ? new Date(d) : d;
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    return `${y}-${m}`;
  };
  const current = monthKey(new Date());
  const lastNMonths = useCallback((n: number) => {
    const res: string[] = [];
    const now = new Date();
    for (let i = n - 1; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      res.push(monthKey(d));
    }
    return res;
  }, []);
  const normalizeMonthlyIncome = (amount: number, frequency: string) => {
    switch (frequency) {
      case 'weekly': return amount * 4.33;
      case 'biweekly': return amount * 2.17;
      case 'quarterly': return amount / 3;
      case 'yearly': return amount / 12;
      default: return amount; // monthly/once
    }
  };

  // Índices por período
  const receiptsByPeriod = useMemo(() => {
    const map = new Map<string, { amount: number; currency: string; income_id: string }[]>();
    for (const r of receipts) {
      const list = map.get(r.period_month) || [];
      list.push({ amount: r.amount || 0, currency: r.currency || userCurrency, income_id: r.income_id });
      map.set(r.period_month, list);
    }
    return map;
  }, [receipts, userCurrency]);

  const paymentsByPeriod = useMemo(() => {
    const map = new Map<string, { amount: number; currency: string; expense_id: string }[]>();
    for (const p of payments) {
      const list = map.get(p.period_month) || [];
      list.push({ amount: p.amount || 0, currency: p.currency || userCurrency, expense_id: p.expense_id });
      map.set(p.period_month, list);
    }
    return map;
  }, [payments, userCurrency]);

  // Serie mensual 12m (real)
  const months = useMemo(() => lastNMonths(12), [lastNMonths]);
  const monthlySeries = useMemo(() => months.map(period => {
    const incs = (receiptsByPeriod.get(period) || []).reduce((s, it) => s + convertCurrency(it.amount, it.currency, userCurrency), 0);
    const exps = (paymentsByPeriod.get(period) || []).reduce((s, it) => s + convertCurrency(it.amount, it.currency, userCurrency), 0);
    const net = incs - exps;
    const savingsRate = incs > 0 ? (net / incs) : 0;
    return { period, income: incs, expenses: exps, net, savingsRate };
  }), [months, receiptsByPeriod, paymentsByPeriod, convertCurrency, userCurrency]);

  // MTD (real)
  const mtd = useMemo(() => {
    const cur = monthlySeries.find(m => m.period === current) || { income: 0, expenses: 0, net: 0, savingsRate: 0 };
    return cur;
  }, [monthlySeries, current]);

  // Presupuesto mensual (planned)
  const planned = useMemo(() => {
    const plannedIncome = incomes
      .filter(i => i.is_active)
      .reduce((s, i) => {
        const ccy = Array.isArray(i.tags) ? (i.tags.find(t => t.startsWith('currency:'))?.replace('currency:', '') || userCurrency) : userCurrency;
        const monthly = normalizeMonthlyIncome(i.amount || 0, i.frequency || 'monthly');
        return s + convertCurrency(monthly, ccy, userCurrency);
      }, 0);
    const plannedExpenses = expenses
      .filter(e => e.is_recurring)
      .reduce((s, e) => {
        const monthly = (e.frequency === 'weekly') ? (e.amount || 0) * 4.33
          : (e.frequency === 'daily') ? (e.amount || 0) * 30
          : (e.frequency === 'yearly') ? (e.amount || 0) / 12
          : (e.amount || 0);
        const ccy = e.currency || userCurrency;
        return s + convertCurrency(monthly, ccy, userCurrency);
      }, 0);
    return { income: plannedIncome, expenses: plannedExpenses, net: plannedIncome - plannedExpenses };
  }, [incomes, expenses, convertCurrency, userCurrency]);

  // Cobertura y alertas
  const coverage = useMemo(() => {
    const today = new Date();
    const curKey = current;
    const receivedIds = new Set(receipts.filter(r => r.period_month === curKey).map(r => r.income_id));
    const incomesActive = incomes.filter(i => i.is_active);
    const incomeCoverage = incomesActive.length > 0 ? (receivedIds.size / incomesActive.length) : 0;
    const incomesDue = incomesActive.filter(i => i.payment_day && i.payment_day <= today.getDate() && !receivedIds.has(i.id)).slice(0, 5);

    // Instancias de gastos del mes
    const instancesThisMonth = expenses.filter(e => {
      if (!Array.isArray(e.tags) || !e.tags.includes('recurrence-instance')) return false;
      if (!e.transaction_date) return false;
      return monthKey(e.transaction_date) === curKey;
    });
    const paidIds = new Set(payments.filter(p => p.period_month === curKey).map(p => p.expense_id));
    const expenseCoverage = instancesThisMonth.length > 0 ? (instancesThisMonth.filter(e => paidIds.has(e.id)).length / instancesThisMonth.length) : 0;
    const expensesDue = instancesThisMonth.filter(e => {
      const d = e.transaction_date ? new Date(e.transaction_date) : today;
      return d <= today && !paidIds.has(e.id);
    }).slice(0, 5);

    return { incomeCoverage, expenseCoverage, incomesDue, expensesDue };
  }, [incomes, receipts, expenses, payments, current]);

  // Categorías (gasto real del mes actual por categoría)
  const categoryData = useMemo(() => {
    const curPays = payments.filter(p => p.period_month === current);
    const byCat = new Map<string, number>();
    for (const p of curPays) {
      const exp = expenses.find(e => e.id === p.expense_id);
      const catId = exp?.category_id || 'uncat';
      const key = String(catId);
      const valConv = convertCurrency(p.amount || 0, p.currency || userCurrency, userCurrency);
      byCat.set(key, (byCat.get(key) || 0) + valConv);
    }
    const total = Array.from(byCat.values()).reduce((a, b) => a + b, 0) || 1;
    const items = Array.from(byCat.entries()).map(([id, value]) => {
      const catName = categories.find(c => c.id === id)?.name || 'Sin categoría';
      return { name: catName, value, percentage: ((value / total) * 100).toFixed(1) };
    });
    return items.sort((a, b) => b.value - a.value).slice(0, 6);
  }, [payments, expenses, categories, convertCurrency, userCurrency, current]);

  // Tendencia mensual para chart (últimos 12)
  const monthlyData = useMemo(() => monthlySeries.map(m => ({
    month: new Date(m.period + '-01').toLocaleDateString('es-ES', { month: 'short', year: 'numeric' }),
    income: m.income,
    expenses: m.expenses,
    net: m.net,
  })), [monthlySeries]);

  // Optimización (basado en pagos del mes)
  const optimizationData = useMemo(() => {
    const curPays = payments.filter(p => p.period_month === current);
    const buckets: Record<string, number> = {
      'Alto potencial (8-10)': 0,
      'Medio (5-7)': 0,
      'Optimizado (0-4)': 0,
    };
    for (const p of curPays) {
      const exp = expenses.find(e => e.id === p.expense_id);
      const score = exp?.optimization_potential || 0;
      const val = convertCurrency(p.amount || 0, p.currency || userCurrency, userCurrency);
      if (score >= 8) buckets['Alto potencial (8-10)'] += val;
      else if (score >= 5) buckets['Medio (5-7)'] += val;
      else buckets['Optimizado (0-4)'] += val;
    }
    const total = Object.values(buckets).reduce((a, b) => a + b, 0) || 1;
    return Object.entries(buckets).map(([name, value]) => ({ name, value, percentage: ((value / total) * 100).toFixed(1) }));
  }, [payments, expenses, convertCurrency, userCurrency, current]);

  if (expenses.length === 0 && receipts.length === 0 && payments.length === 0) {
    return (
      <Layout>
        <div className="space-y-6">
          <div className="flex items-center gap-3">
            <TrendingUp className="w-8 h-8 text-primary" />
            <div>
              <h1 className="text-3xl font-bold">Analíticas</h1>
              <p className="text-muted-foreground">
                Análisis de ingresos y gastos basado en historial real
              </p>
            </div>
          </div>

          <Card>
            <CardContent className="flex flex-col items-center justify-center py-16">
              <BarChart3 className="w-16 h-16 text-muted-foreground/50 mb-4" />
              <h3 className="text-xl font-semibold mb-2">No hay datos para analizar</h3>
              <p className="text-muted-foreground text-center mb-4">
                Registra algunos ingresos y gastos para ver analíticas detalladas
              </p>
            </CardContent>
          </Card>

        </div>
      </Layout>
    );
  }


  const incMTD = mtd.income;
  const expMTD = mtd.expenses;
  const netMTD = mtd.net;
  const srMTD = mtd.income > 0 ? (mtd.net / mtd.income) : 0;
  const prev = monthlySeries.length > 1 ? monthlySeries[monthlySeries.length - 2] : undefined;
  const netMoM = prev ? netMTD - prev.net : 0;

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <TrendingUp className="w-8 h-8 text-primary" />
          <div>
            <h1 className="text-3xl font-bold">Analíticas</h1>
            <p className="text-muted-foreground">
              Análisis inteligente de tus gastos y patrones financieros
            </p>
          </div>
        </div>

        {/* Resumen MTD + Cobertura */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Ingresos MTD</CardTitle>
              <TrendingUp className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-700">{fmt(incMTD, userCurrency)}</div>
              <p className="text-xs text-muted-foreground">Mes actual</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Gastos MTD</CardTitle>
              <BarChart3 className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-700">{fmt(expMTD, userCurrency)}</div>
              <p className="text-xs text-muted-foreground">Mes actual</p>

            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">

              <CardTitle className="text-sm font-medium">Neto MTD</CardTitle>
              {netMTD >= 0 ? <TrendingUp className="h-4 w-4 text-green-600" /> : <TrendingDown className="h-4 w-4 text-red-600" />}
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${netMTD>=0?'text-green-700':'text-red-700'}`}>{fmt(netMTD, userCurrency)}</div>
              <p className="text-xs text-muted-foreground flex items-center gap-2">
                Savings rate: <Badge variant="outline">{(srMTD*100).toFixed(1)}%</Badge>
                {prev && (
                  <span className="text-xs">MoM: {netMoM>=0?'+':''}{fmt(netMoM, userCurrency)}</span>
                )}

              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">

              <CardTitle className="text-sm font-medium">Cobertura del Mes</CardTitle>
              <Target className="h-4 w-4 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="flex gap-4 items-end">
                <div>
                  <div className="text-sm text-muted-foreground">Ingresos</div>
                  <div className="text-xl font-semibold">{Math.round(coverage.incomeCoverage*100)}%</div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">Gastos</div>
                  <div className="text-xl font-semibold">{Math.round(coverage.expenseCoverage*100)}%</div>
                </div>
              </div>
              {(coverage.incomesDue.length>0 || coverage.expensesDue.length>0) && (
                <p className="text-xs text-muted-foreground mt-2">Pendientes: {coverage.incomesDue.length} ingresos • {coverage.expensesDue.length} gastos</p>
              )}

            </CardContent>
          </Card>
        </div>

        <div className="grid gap-6 md:grid-cols-2">

          {/* Tendencia mensual */}
          <Card>
            <CardHeader>
              <CardTitle>Tendencia últimos 12 meses</CardTitle>
              <CardDescription>Evolución de ingresos, gastos y neto</CardDescription>

            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">

                  <LineChart data={monthlyData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip formatter={(value:number) => fmt(Number(value), userCurrency)} />
                    <Legend />
                    <Line type="monotone" dataKey="income" stroke="#16a34a" name="Ingresos" />
                    <Line type="monotone" dataKey="expenses" stroke="#dc2626" name="Gastos" />
                    <Line type="monotone" dataKey="net" stroke="#7c3aed" name="Neto" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Gráfico por Categorías (mes actual real) */}
          <Card>
            <CardHeader>
              <CardTitle>Gastos por Categoría</CardTitle>
              <CardDescription>Mes en curso (pagos efectivos)</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">

                  <PieChart>
                    <Pie
                      data={categoryData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percentage }) => `${name}: ${percentage}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {categoryData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>

                    <Tooltip formatter={(value) => fmt(Number(value), userCurrency)} />

                  </PieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>


          {/* Presupuesto vs Real (Mes actual) */}
          <Card>
            <CardHeader>
              <CardTitle>Presupuesto vs Real (mes actual)</CardTitle>
              <CardDescription>Comparativa rápida</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="border rounded p-3">
                  <div className="text-sm mb-2">Ingresos</div>
                  <ResponsiveContainer width="100%" height={200}>
                    <BarChart data={[{ name: 'Planned', value: planned.income }, { name: 'Real', value: incMTD }] }>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip formatter={(value) => fmt(Number(value), userCurrency)} />
                      <Bar dataKey="value" fill="#16a34a" />
                    </BarChart>
                  </ResponsiveContainer>
                  <div className="text-xs text-muted-foreground mt-2">
                    Variancia: {fmt(incMTD - planned.income, userCurrency)}
                  </div>
                </div>
                <div className="border rounded p-3">
                  <div className="text-sm mb-2">Gastos</div>
                  <ResponsiveContainer width="100%" height={200}>
                    <BarChart data={[{ name: 'Planned', value: planned.expenses }, { name: 'Real', value: expMTD }] }>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip formatter={(value) => fmt(Number(value), userCurrency)} />
                      <Bar dataKey="value" fill="#dc2626" />
                    </BarChart>
                  </ResponsiveContainer>
                  <div className="text-xs text-muted-foreground mt-2">
                    Variancia: {fmt(expMTD - planned.expenses, userCurrency)}
                  </div>
                </div>

              </div>
            </CardContent>
          </Card>
        </div>


        {/* Análisis de Optimización (ponderado por pagos del mes) */}
        <Card>
          <CardHeader>
            <CardTitle>Análisis de Optimización</CardTitle>
            <CardDescription>Distribución por potencial (sobre lo efectivamente pagado este mes)</CardDescription>

          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={optimizationData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percentage }) => `${percentage}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      <Cell fill="#FF8042" />
                      <Cell fill="#FFBB28" />
                      <Cell fill="#00C49F" />
                    </Pie>

                    <Tooltip formatter={(value) => fmt(Number(value), userCurrency)} />

                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              
              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold mb-3">Insights de Optimización</h4>
                  <div className="space-y-3">
                    {optimizationData.map((item, index) => (
                      <div key={item.name} className="flex items-center justify-between p-3 rounded-lg border">
                        <div className="flex items-center gap-3">
                          <div 
                            className="w-4 h-4 rounded-full"
                            style={{ backgroundColor: ['#FF8042', '#FFBB28', '#00C49F'][index] }}
                          />
                          <span className="text-sm font-medium">{item.name}</span>
                        </div>
                        <Badge variant="outline">

                          {fmt(item.value as number, userCurrency)}

                        </Badge>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default Analytics;