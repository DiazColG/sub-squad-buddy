import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, DollarSign, TrendingUp, Plus, Package } from "lucide-react";
import { useSubscriptions } from "@/hooks/useSubscriptions";
import { Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useUserProfile } from "@/hooks/useUserProfile";
import { useCurrencyExchange } from "@/hooks/useCurrencyExchange";

const Dashboard = () => {
  const { subscriptions, loading } = useSubscriptions();
  const { user } = useAuth();
  const { profile } = useUserProfile();
  const { convertCurrency, formatCurrency, loading: ratesLoading } = useCurrencyExchange();

  // Calculate totals converting all to user's preferred currency
  const calculateConvertedTotals = () => {
    if (!subscriptions.length || !profile?.primary_display_currency) {
      return { monthly: 0, annual: 0 };
    }

    const targetCurrency = profile.primary_display_currency;
    let totalMonthly = 0;

    subscriptions.forEach(sub => {
      const cost = sub.cost || 0;
      const sourceCurrency = sub.currency || 'USD';
      
      let monthlyAmount = 0;
      switch (sub.billing_cycle) {
        case 'Monthly':
          monthlyAmount = cost;
          break;
        case 'Quarterly':
          monthlyAmount = cost / 3;
          break;
        case 'Semi-Annually':
          monthlyAmount = cost / 6;
          break;
        case 'Annually':
          monthlyAmount = cost / 12;
          break;
        default:
          monthlyAmount = cost;
      }

      // Convert to user's preferred currency
      const convertedAmount = convertCurrency(monthlyAmount, sourceCurrency, targetCurrency);
      totalMonthly += convertedAmount;
    });

    return {
      monthly: totalMonthly,
      annual: totalMonthly * 12
    };
  };

  const { monthly: totalMonthly, annual: totalAnnual } = calculateConvertedTotals();
  const userCurrency = profile?.primary_display_currency || 'USD';
  
  const monthlyDisplay = formatCurrency(totalMonthly, userCurrency);
  const annualDisplay = formatCurrency(totalAnnual, userCurrency);

  // Get upcoming renewals (next 30 days)
  const getUpcomingRenewals = () => {
    const today = new Date();
    const thirtyDaysFromNow = new Date(today);
    thirtyDaysFromNow.setDate(today.getDate() + 30);
    
    return subscriptions.filter(sub => {
      const renewalDate = new Date(sub.next_renewal_date);
      return renewalDate >= today && renewalDate <= thirtyDaysFromNow;
    }).slice(0, 3); // Show only first 3
  };

  const upcomingRenewals = getUpcomingRenewals();

  if (loading || ratesLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Empty state for new users
  if (subscriptions.length === 0) {
    return (
      <div className="container mx-auto p-6 space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Dashboard</h1>
            <p className="text-muted-foreground">
              ¡Bienvenido! Comienza agregando tus primeras suscripciones.
            </p>
          </div>
        </div>

        {/* Empty State */}
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <div className="rounded-full bg-muted p-6 mb-4">
            <Package className="h-12 w-12 text-muted-foreground" />
          </div>
          <h3 className="text-xl font-semibold mb-2">No tienes suscripciones</h3>
          <p className="text-muted-foreground mb-6 max-w-md">
            Comienza a gestionar tus gastos agregando tus primeras suscripciones.
            Podrás ver todos tus gastos consolidados y recibir alertas de renovación.
          </p>
          <Link to="/subscriptions">
            <Button size="lg" className="gap-2">
              <Plus className="h-4 w-4" />
              Agregar mi primera suscripción
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
              <CardTitle className="text-sm font-medium">Gasto Anual</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">$0.00</div>
              <p className="text-xs text-muted-foreground">por año</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Suscripciones Activas</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">0</div>
              <p className="text-xs text-muted-foreground">servicios activos</p>
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
            Resumen de tus suscripciones y gastos
          </p>
        </div>
        <Link to="/subscriptions">
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            Agregar Suscripción
          </Button>
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Gasto Mensual</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{monthlyDisplay}</div>
            <p className="text-xs text-muted-foreground">por mes</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Gasto Anual</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{annualDisplay}</div>
            <p className="text-xs text-muted-foreground">por año</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Suscripciones Activas</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{subscriptions.length}</div>
            <p className="text-xs text-muted-foreground">servicios activos</p>
          </CardContent>
        </Card>
      </div>

      {/* Upcoming Renewals */}
      <Card>
        <CardHeader>
          <CardTitle>Próximas Renovaciones</CardTitle>
          <CardDescription>Suscripciones que se renuevan en los próximos 30 días</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {upcomingRenewals.length > 0 ? (
            upcomingRenewals.map((subscription) => (
              <div key={subscription.id} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-primary rounded-full"></div>
                  <div>
                    <p className="text-sm font-medium">{subscription.service_name}</p>
                    <p className="text-xs text-muted-foreground">
                      Renueva: {new Date(subscription.next_renewal_date).toLocaleDateString('es-ES')}
                    </p>
                  </div>
                </div>
                <Badge variant="outline">
                  {formatCurrency(
                    convertCurrency(subscription.cost || 0, subscription.currency || 'USD', userCurrency),
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
    </div>
  );
};

export default Dashboard;