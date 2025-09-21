import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { User, Globe, Bell, Shield, CreditCard, RefreshCw } from "lucide-react";
import { useUserProfile } from "@/hooks/useUserProfile";
import { useAuth } from "@/hooks/useAuth";
import { useCurrencyExchange } from "@/hooks/useCurrencyExchange";
import { useSubscriptions } from "@/hooks/useSubscriptions";

const Settings = () => {
  const { user } = useAuth();
  const { profile, loading: profileLoading, updateProfile, updateCurrency } = useUserProfile();
  const { subscriptions } = useSubscriptions();
  const { refreshRates, lastUpdated, loading: ratesLoading } = useCurrencyExchange();
  
  const [userSettings, setUserSettings] = useState({
    fullName: "",
    email: "",
    notifications: {
      emailAlerts: true,
      renewalReminders: true,
      weeklyReports: false
    }
  });

  // Update local state when profile loads
  useEffect(() => {
    if (profile && user) {
      setUserSettings(prev => ({
        ...prev,
        fullName: profile.full_name || "",
        email: user.email || ""
      }));
    }
  }, [profile, user]);

  const currencies = [
    { code: "USD", name: "Dólar Estadounidense", symbol: "$" },
    { code: "EUR", name: "Euro", symbol: "€" },
    { code: "ARS", name: "Peso Argentino", symbol: "$" },
    { code: "GBP", name: "Libra Esterlina", symbol: "£" },
    { code: "JPY", name: "Yen Japonés", symbol: "¥" },
    { code: "CAD", name: "Dólar Canadiense", symbol: "C$" },
    { code: "MXN", name: "Peso Mexicano", symbol: "$" },
    { code: "BRL", name: "Real Brasileño", symbol: "R$" },
  ];

  const handleSaveProfile = async () => {
    if (!profile) return;
    
    await updateProfile({
      full_name: userSettings.fullName
    });
  };

  const handleCurrencyChange = async (currency: string) => {
    await updateCurrency(currency);
  };

  const handleNotificationChange = (key: string, value: boolean) => {
    setUserSettings(prev => ({
      ...prev,
      notifications: {
        ...prev.notifications,
        [key]: value
      }
    }));
  };

  return (
      <div className="p-6 space-y-6 max-w-4xl">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Configuración</h1>
          <p className="text-muted-foreground">Gestiona tu perfil y preferencias de la aplicación</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Profile Settings */}
          <div className="lg:col-span-2 space-y-6">
            <Card className="shadow-card border-card-border">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5 text-primary" />
                  Información Personal
                </CardTitle>
                <CardDescription>
                  Actualiza tu información básica y datos de contacto
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="fullName">Nombre completo</Label>
                    <Input
                      id="fullName"
                      value={userSettings.fullName}
                      onChange={(e) => setUserSettings(prev => ({ ...prev, fullName: e.target.value }))}
                      disabled={profileLoading}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Correo electrónico</Label>
                    <Input
                      id="email"
                      type="email"
                      value={userSettings.email}
                      disabled
                      className="bg-muted"
                    />
                    <p className="text-xs text-muted-foreground">
                      El email no se puede cambiar desde aquí
                    </p>
                  </div>
                </div>
                <Button onClick={handleSaveProfile} disabled={profileLoading}>
                  {profileLoading ? 'Guardando...' : 'Guardar cambios'}
                </Button>
              </CardContent>
            </Card>

            {/* Regional Settings */}
            <Card className="shadow-card border-card-border">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Globe className="h-5 w-5 text-accent" />
                  Configuración Regional
                </CardTitle>
                <CardDescription>
                  Configura tu moneda predeterminada y preferencias regionales
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="currency">Moneda principal</Label>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={refreshRates}
                      disabled={ratesLoading}
                      className="gap-2"
                    >
                      <RefreshCw className={`h-3 w-3 ${ratesLoading ? 'animate-spin' : ''}`} />
                      Actualizar
                    </Button>
                  </div>
                  <Select 
                    value={profile?.primary_display_currency || "USD"} 
                    onValueChange={handleCurrencyChange}
                    disabled={profileLoading}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecciona una moneda" />
                    </SelectTrigger>
                    <SelectContent>
                      {currencies.map((currency) => (
                        <SelectItem key={currency.code} value={currency.code}>
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-sm">{currency.symbol}</span>
                            <span>{currency.name} ({currency.code})</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <div className="text-xs text-muted-foreground space-y-1">
                    <p>Todas las suscripciones se convertirán a esta moneda en el dashboard</p>
                    {lastUpdated && (
                      <p>Tipos de cambio actualizados: {lastUpdated.toLocaleTimeString('es-ES')}</p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Notification Settings */}
            <Card className="shadow-card border-card-border">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bell className="h-5 w-5 text-warning" />
                  Notificaciones
                </CardTitle>
                <CardDescription>
                  Configura qué notificaciones quieres recibir
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <div className="text-sm font-medium">Alertas por email</div>
                    <div className="text-xs text-muted-foreground">
                      Recibir notificaciones importantes por correo
                    </div>
                  </div>
                  <Switch
                    checked={userSettings.notifications.emailAlerts}
                    onCheckedChange={(checked) => handleNotificationChange('emailAlerts', checked)}
                  />
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <div className="text-sm font-medium">Recordatorios de renovación</div>
                    <div className="text-xs text-muted-foreground">
                      Avisos antes de que se renueven las suscripciones
                    </div>
                  </div>
                  <Switch
                    checked={userSettings.notifications.renewalReminders}
                    onCheckedChange={(checked) => handleNotificationChange('renewalReminders', checked)}
                  />
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <div className="text-sm font-medium">Reportes semanales</div>
                    <div className="text-xs text-muted-foreground">
                      Resumen semanal de gastos y suscripciones
                    </div>
                  </div>
                  <Switch
                    checked={userSettings.notifications.weeklyReports}
                    onCheckedChange={(checked) => handleNotificationChange('weeklyReports', checked)}
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Account Info Sidebar */}
          <div className="space-y-6">
            {/* Beta Testing Settings removed: personal finance is public */}

            <Card className="shadow-card border-card-border">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5 text-success" />
                  Información de Cuenta
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="text-sm text-muted-foreground">Tipo de cuenta</div>
                  <Badge 
                    variant={profile?.account_type === "team" ? "default" : "secondary"}
                    className="w-fit"
                  >
                    {profile?.account_type === "team" ? "Cuenta de Equipo" : "Cuenta Personal"}
                  </Badge>
                </div>
                <Separator />
                <div className="space-y-2">
                  <div className="text-sm text-muted-foreground">Plan actual</div>
                  <div className="font-medium text-success">Plan Gratuito</div>
                </div>
                <Separator />
                <div className="space-y-2">
                  <div className="text-sm text-muted-foreground">Suscripciones activas</div>
                  <div className="font-medium">{subscriptions.length} servicios</div>
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-card border-card-border">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="h-5 w-5 text-primary" />
                  Facturación
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-sm text-muted-foreground">
                  Actualmente estás usando el plan gratuito. Actualiza para obtener más funciones.
                </div>
                <Button variant="outline" className="w-full">
                  Ver planes de pago
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
  );
};

export default Settings;