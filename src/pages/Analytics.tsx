import { useMemo, useCallback } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Layout } from "@/components/Layout";
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line } from 'recharts';
import { TrendingUp, TrendingDown, BarChart3, Target } from 'lucide-react';
import { useUserProfile } from "@/hooks/useUserProfile";
import { useCurrencyExchange } from "@/hooks/useCurrencyExchange";
import { useIncomes } from "@/hooks/useIncomes";
import { useExpenses } from "@/hooks/useExpenses";
import { accruedExpenseForMonth, type BasicExpenseLike, effectiveMonthKey } from '@/lib/accrual';
import { monthKey } from '@/lib/dateUtils';
import { useFinancialCategories } from "@/hooks/useFinancialCategories";
import { useCards } from "@/hooks/useCards";

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D'];

const Analytics = () => {
  const { profile } = useUserProfile();
  const userCurrency = profile?.primary_display_currency || 'USD';
  const { convertCurrency, formatCurrency: fmt } = useCurrencyExchange();
  const { incomes } = useIncomes();
  const { expenses } = useExpenses();
  const { cards } = useCards();
  const { categories } = useFinancialCategories();

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

  // Serie mensual 12m (real, devengado y convertido)
  const months = useMemo(() => lastNMonths(12), [lastNMonths]);
  const monthlySeries = useMemo(() => months.map(period => {
    const d = new Date(period + '-01');
    const key = monthKey(d);
    const endOfMonth = new Date(d.getFullYear(), d.getMonth() + 1, 0);

    // Ingresos devengados convertidos a moneda de usuario
    let incomeTotal = 0;
    for (const i of incomes) {
      if (!i.is_active) continue;
      if (i.start_date && new Date(i.start_date) > endOfMonth) continue;
      if (i.frequency === 'once' && i.start_date && monthKey(i.start_date) !== key) continue;
      const fromCcy = (Array.isArray(i.tags) ? i.tags.find(t => t.startsWith('currency:')) : undefined)?.replace('currency:', '') || userCurrency;
      const amount = i.amount || 0;
      const base = (() => {
        switch (i.frequency) {
          case 'weekly': return amount * 4.33;
          case 'biweekly': return amount * 2.17;
          case 'quarterly': return amount / 3;
          case 'yearly': return amount / 12;
          case 'daily': return amount * 30;
          default: return amount;
        }
      })();
      incomeTotal += convertCurrency(base, fromCcy, userCurrency);
    }

    // Gastos devengados convertidos a moneda de usuario
    let expenseTotal = 0;
    for (const e of expenses) {
      const fromCcy = e.currency || userCurrency;
      if (e.is_recurring) {
        if (e.transaction_date && new Date(e.transaction_date) > endOfMonth) continue;
  const base = accruedExpenseForMonth([{ amount: e.amount, frequency: e.frequency, is_recurring: true, transaction_date: e.transaction_date } as BasicExpenseLike], d);
        expenseTotal += convertCurrency(base, fromCcy, userCurrency);
      } else if (e.transaction_date) {
        const cd = e.card_id ? cards.find(c => c.id === e.card_id) : undefined;
        const effKey = effectiveMonthKey(e.transaction_date, cd?.card_type, cd?.closing_day ?? undefined);
        if (effKey === key) {
          expenseTotal += convertCurrency(e.amount || 0, fromCcy, userCurrency);
        }
      }
    }

    const net = incomeTotal - expenseTotal;
    return { period, income: incomeTotal, expenses: expenseTotal, net, savingsRate: incomeTotal > 0 ? net / incomeTotal : 0 };
  }), [months, incomes, expenses, cards, userCurrency, convertCurrency]);

  // MTD actual
  const mtd = useMemo(() => {
    const fallback: { period?: string; income: number; expenses: number; net: number; savingsRate: number } = { income: 0, expenses: 0, net: 0, savingsRate: 0 };
    return monthlySeries.find(m => m.period === current) || fallback;
  }, [monthlySeries, current]);

  // Planned (devengado y convertido)
  const planned = useMemo(() => {
    const ref = new Date();
    const key = monthKey(ref);
    const endOfMonth = new Date(ref.getFullYear(), ref.getMonth() + 1, 0);
    // Ingresos
    let inc = 0;
    for (const i of incomes) {
      if (!i.is_active) continue;
      if (i.start_date && new Date(i.start_date) > endOfMonth) continue;
      if (i.frequency === 'once' && i.start_date && monthKey(i.start_date) !== key) continue;
      const fromCcy = (Array.isArray(i.tags) ? i.tags.find(t => t.startsWith('currency:')) : undefined)?.replace('currency:', '') || userCurrency;
      const amount = i.amount || 0;
      const base = (() => {
        switch (i.frequency) {
          case 'weekly': return amount * 4.33;
          case 'biweekly': return amount * 2.17;
          case 'quarterly': return amount / 3;
          case 'yearly': return amount / 12;
          case 'daily': return amount * 30;
          default: return amount;
        }
      })();
      inc += convertCurrency(base, fromCcy, userCurrency);
    }
    // Gastos
    let exp = 0;
    for (const e of expenses) {
      const fromCcy = e.currency || userCurrency;
      if (e.is_recurring) {
        if (e.transaction_date && new Date(e.transaction_date) > endOfMonth) continue;
  const base = accruedExpenseForMonth([{ amount: e.amount, frequency: e.frequency, is_recurring: true, transaction_date: e.transaction_date } as BasicExpenseLike], ref);
        exp += convertCurrency(base, fromCcy, userCurrency);
      } else if (e.transaction_date) {
        const cd = e.card_id ? cards.find(c => c.id === e.card_id) : undefined;
        const effKey = effectiveMonthKey(e.transaction_date, cd?.card_type, cd?.closing_day ?? undefined);
        if (effKey === key) {
          exp += convertCurrency(e.amount || 0, fromCcy, userCurrency);
        }
      }
    }
    return { income: inc, expenses: exp, net: inc - exp };
  }, [incomes, expenses, cards, userCurrency, convertCurrency]);

  // Category distribution for current month (converted)
  const categoryData = useMemo(() => {
    const curKey = current;
    const ref = new Date(curKey + '-01');
    const endOfMonth = new Date(ref.getFullYear(), ref.getMonth() + 1, 0);
    const byCat = new Map<string, number>();
    for (const e of expenses) {
      const fromCcy = e.currency || userCurrency;
      let value = 0;
      if (e.is_recurring) {
        if (e.transaction_date && new Date(e.transaction_date) > endOfMonth) continue;
  const base = accruedExpenseForMonth([{ amount: e.amount, frequency: e.frequency, is_recurring: true, transaction_date: e.transaction_date } as BasicExpenseLike], ref);
        value = convertCurrency(base, fromCcy, userCurrency);
      } else if (e.transaction_date) {
        const cd = e.card_id ? cards.find(c => c.id === e.card_id) : undefined;
        const effKey = effectiveMonthKey(e.transaction_date, cd?.card_type, cd?.closing_day ?? undefined);
        if (effKey === curKey) {
          value = convertCurrency(e.amount || 0, fromCcy, userCurrency);
        }
      }
      if (value > 0) {
        const catId = e.category_id || 'uncat';
        byCat.set(catId, (byCat.get(catId) || 0) + value);
      }
    }
    const total = Array.from(byCat.values()).reduce((a,b)=>a+b,0) || 1;
    return Array.from(byCat.entries()).map(([id,value]) => ({
      name: categories.find(c => c.id === id)?.name || 'Sin categoría',
      value,
      percentage: ((value/ total)*100).toFixed(1)
    })).sort((a,b)=>b.value-a.value).slice(0,6);
  }, [expenses, categories, cards, current, userCurrency, convertCurrency]);

  // Data para línea de tendencia
  const monthlyData = useMemo(() => monthlySeries.map(m => ({
    month: new Date(m.period + '-01').toLocaleDateString('es-ES', { month: 'short', year: 'numeric' }),
    income: m.income,
    expenses: m.expenses,
    net: m.net,
  })), [monthlySeries]);

  if (expenses.length === 0 && incomes.length === 0) {
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
                  <div className="text-xl font-semibold">0%</div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">Gastos</div>
                  <div className="text-xl font-semibold">0%</div>
                </div>
              </div>
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

          {/* Gráfico por Categorías (mes actual devengado) */}
          <Card>
            <CardHeader>
              <CardTitle>Gastos por Categoría</CardTitle>
              <CardDescription>Mes en curso (devengado convertido)</CardDescription>
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
        </div>
      </div>
    </Layout>
  );
};

export default Analytics;
