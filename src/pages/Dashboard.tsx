import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, DollarSign, TrendingUp, Plus, Package } from "lucide-react";
import { Link } from "react-router-dom";
import { useUserProfile } from "@/hooks/useUserProfile";
import { useCurrencyExchange } from "@/hooks/useCurrencyExchange";
import { useExpenses } from "@/hooks/useExpenses";

const Dashboard = () => {
  const { expenses, loading, getRecurringTemplates, getDueSoonRecurring } = useExpenses();
  const { profile } = useUserProfile();
  const { convertCurrency, formatCurrency, loading: ratesLoading } = useCurrencyExchange();

  // Totales del mes actual en moneda preferida del usuario
  const calculateMonthlyTotals = () => {
    if (!expenses.length || !profile?.primary_display_currency) {
      return { monthly: 0 };
    }
    const targetCurrency = profile.primary_display_currency;
    const now = new Date();
    const y = now.getFullYear();
    const m = String(now.getMonth() + 1).padStart(2, '0');
    const key = `${y}-${m}`;
    let total = 0;
    expenses
      .filter(e => {
        const d = new Date(e.transaction_date);
        const ek = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
        return ek === key;
      })
      .forEach(e => {
        const amount = e.amount || 0;
        const sourceCurrency = e.currency || 'USD';
        total += convertCurrency(amount, sourceCurrency, targetCurrency);
      });
    return { monthly: total };
  };

  const { monthly: totalMonthly } = calculateMonthlyTotals();
  const userCurrency = profile?.primary_display_currency || 'USD';
  
  const monthlyDisplay = formatCurrency(totalMonthly, userCurrency);

  const dueSoon = getDueSoonRecurring();
  const latestExpenses = [...expenses]
    .sort((a, b) => new Date(b.transaction_date).getTime() - new Date(a.transaction_date).getTime())
    .slice(0, 5);

  if (loading || ratesLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Empty state for new users
  if (expenses.length === 0) {
    return (
      <div className="container mx-auto p-6 space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Dashboard</h1>
            <p className="text-muted-foreground">
              ¡Bienvenido! Comienza agregando tus primeros gastos.
            </p>
          </div>
        </div>

        {/* Empty State */}
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <div className="rounded-full bg-muted p-6 mb-4">
            <Package className="h-12 w-12 text-muted-foreground" />
          </div>
          <h3 className="text-xl font-semibold mb-2">No tienes gastos aún</h3>
          <p className="text-muted-foreground mb-6 max-w-md">
            Comienza a gestionar tus finanzas agregando tus primeros gastos.
            Podrás ver tus gastos consolidados y configurar recordatorios por gasto recurrente.
          </p>
          <Link to="/finance/expenses">
            <Button size="lg" className="gap-2">
              <Plus className="h-4 w-4" />
              Agregar mi primer gasto
            </Button>
          </Link>
        </div>

        {/* Stats Cards - Show zeros */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Gasto Mensual</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">$0.00</div>
              <p className="text-xs text-muted-foreground">por mes</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Recurrentes Activos</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">0</div>
              <p className="text-xs text-muted-foreground">plantillas activas</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Gastos Totales</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">0</div>
              <p className="text-xs text-muted-foreground">registrados</p>
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
          <p className="text-muted-foreground">
            Resumen de tus gastos personales y compartidos
          </p>
        </div>
        <Link to="/finance/expenses">
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            Agregar Gasto
          </Button>
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Gastos Personales</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{monthlyDisplay}</div>
            <p className="text-xs text-muted-foreground">mes actual</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Gastos Compartidos</CardTitle>
            <DollarSign className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$0.00</div>
            <p className="text-xs text-muted-foreground">con tu pareja/familia</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Mensual</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{monthlyDisplay}</div>
            <p className="text-xs text-muted-foreground">por mes</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Recurrentes Activos</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{getRecurringTemplates().length}</div>
            <p className="text-xs text-muted-foreground">plantillas activas</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Próximos recurrentes (a confirmar) */}
        <Card>
          <CardHeader>
            <CardTitle>Próximos Recurrentes</CardTitle>
            <CardDescription>Gastos recurrentes a confirmar pronto</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {dueSoon.length > 0 ? (
              dueSoon.map((item) => (
                <div key={item.template.id} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-destructive rounded-full animate-pulse"></div>
                    <div>
                      <p className="text-sm font-medium">{item.template.name}</p>
                      <p className="text-xs text-muted-foreground">
                        Sugerido: {new Date(item.suggested.date).toLocaleDateString('es-ES')}
                      </p>
                    </div>
                  </div>
                  <Badge variant="outline">
                    {formatCurrency(
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

        {/* Últimos gastos */}
        <Card>
          <CardHeader>
            <CardTitle>Últimos Gastos</CardTitle>
            <CardDescription>Los 5 gastos registrados más recientemente</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {latestExpenses.length > 0 ? (
              latestExpenses.map((e) => (
                <div key={e.id} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-primary rounded-full"></div>
                    <div>
                      <p className="text-sm font-medium">{e.name}</p>
                      <p className="text-xs text-muted-foreground">
                        Fecha: {new Date(e.transaction_date).toLocaleDateString('es-ES')}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <Badge variant="secondary">
                      {formatCurrency(
                        convertCurrency(e.amount || 0, e.currency || 'USD', userCurrency),
                        userCurrency
                      )}
                    </Badge>
                    {e.expense_type && (
                      <p className="text-xs text-muted-foreground mt-1 capitalize">
                        {e.expense_type.replace('-', ' ')}
                      </p>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <p className="text-muted-foreground text-center py-4">No hay gastos</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;