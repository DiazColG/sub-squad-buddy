import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  DollarSign, 
  TrendingUp, 
  Calendar, 
  AlertCircle,
  Plus,
  CreditCard,
  Target,
  Clock
} from "lucide-react";
import { Separator } from "@/components/ui/separator";

const Dashboard = () => {
  // Mock data - will be replaced with real data
  const monthlySpend = 89.97;
  const annualSpend = 1079.64;
  const totalSubscriptions = 8;
  const upcomingRenewals = [
    { name: "Netflix Premium", cost: 15.99, date: "2024-01-15", daysLeft: 3 },
    { name: "Spotify Family", cost: 12.99, date: "2024-01-18", daysLeft: 6 },
    { name: "Adobe Creative", cost: 52.99, date: "2024-01-22", daysLeft: 10 }
  ];

  const recentSubscriptions = [
    { name: "GitHub Pro", cost: 4.00, category: "Software", added: "Hace 2 días" },
    { name: "Figma Professional", cost: 12.00, category: "Software", added: "Hace 1 semana" }
  ];

  return (
    <div className="min-h-screen bg-background-subtle">
      {/* Header */}
      <div className="border-b bg-background px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-foreground">Dashboard</h1>
            <p className="text-muted-foreground">Resumen de tus suscripciones</p>
          </div>
          <Button className="bg-gradient-primary">
            <Plus className="h-4 w-4 mr-2" />
            Nueva Suscripción
          </Button>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="shadow-card border-card-border">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Gasto Mensual
              </CardTitle>
              <DollarSign className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">
                ${monthlySpend.toFixed(2)}
              </div>
              <div className="flex items-center text-xs text-success">
                <TrendingUp className="h-3 w-3 mr-1" />
                +2.5% vs mes anterior
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-card border-card-border">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Gasto Anual
              </CardTitle>
              <Target className="h-4 w-4 text-accent" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">
                ${annualSpend.toFixed(2)}
              </div>
              <div className="flex items-center text-xs text-muted-foreground">
                Proyección actual
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-card border-card-border">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Suscripciones Activas
              </CardTitle>
              <CreditCard className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">
                {totalSubscriptions}
              </div>
              <div className="flex items-center text-xs text-muted-foreground">
                Servicios activos
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-card border-card-border">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Próximas Renovaciones
              </CardTitle>
              <AlertCircle className="h-4 w-4 text-warning" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">
                {upcomingRenewals.length}
              </div>
              <div className="flex items-center text-xs text-warning">
                En los próximos 30 días
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Upcoming Renewals */}
          <Card className="shadow-card border-card-border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-warning" />
                Próximas Renovaciones
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {upcomingRenewals.map((subscription, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-background-subtle rounded-lg">
                  <div className="flex-1">
                    <h4 className="font-medium text-foreground">{subscription.name}</h4>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge 
                        variant={subscription.daysLeft <= 3 ? "destructive" : "secondary"}
                        className="text-xs"
                      >
                        <Clock className="h-3 w-3 mr-1" />
                        {subscription.daysLeft} días
                      </Badge>
                      <span className="text-xs text-muted-foreground">{subscription.date}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold text-foreground">
                      ${subscription.cost}
                    </div>
                  </div>
                </div>
              ))}
              
              {upcomingRenewals.length === 0 && (
                <div className="text-center py-6 text-muted-foreground">
                  No hay renovaciones próximas
                </div>
              )}
            </CardContent>
          </Card>

          {/* Recent Activity */}
          <Card className="shadow-card border-card-border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Plus className="h-5 w-5 text-accent" />
                Actividad Reciente
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {recentSubscriptions.map((subscription, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-background-subtle rounded-lg">
                  <div className="flex-1">
                    <h4 className="font-medium text-foreground">{subscription.name}</h4>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="outline" className="text-xs">
                        {subscription.category}
                      </Badge>
                      <span className="text-xs text-muted-foreground">{subscription.added}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold text-accent">
                      +${subscription.cost}
                    </div>
                  </div>
                </div>
              ))}
              
              <Separator className="my-4" />
              
              <Button variant="outline" className="w-full">
                Ver todas las suscripciones
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;