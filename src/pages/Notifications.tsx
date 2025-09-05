import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useSubscriptions } from "@/hooks/useSubscriptions";
import { Bell, Settings2, Calendar, Clock, Plus, Save, AlertCircle } from "lucide-react";
import { format, differenceInDays, parseISO, addDays } from "date-fns";
import { es } from "date-fns/locale";
import { formatCurrency } from "@/lib/formatNumber";
import { toast } from "sonner";

interface UpcomingRenewal {
  id: string;
  subscriptionId: string;
  serviceName: string;
  cost: number;
  currency: string;
  renewalDate: string;
  daysUntil: number;
  isEnabled: boolean;
  alertDaysBefore: number;
  customTime?: string;
}

interface NotificationConfig {
  subscriptionId: string;
  enabled: boolean;
  daysBefore: number;
  customTime: string;
}

const Notifications = () => {
  const { subscriptions, loading, updateSubscription } = useSubscriptions();
  const [upcomingRenewals, setUpcomingRenewals] = useState<UpcomingRenewal[]>([]);
  const [selectedConfig, setSelectedConfig] = useState<NotificationConfig | null>(null);
  const [isConfigDialogOpen, setIsConfigDialogOpen] = useState(false);

  useEffect(() => {
    if (!subscriptions) return;

    const generateUpcomingRenewals = () => {
      const today = new Date();
      const renewals: UpcomingRenewal[] = [];

      subscriptions.forEach(subscription => {
        if (!subscription.next_renewal_date) return;

        const renewalDate = parseISO(subscription.next_renewal_date);
        const daysUntil = differenceInDays(renewalDate, today);

        // Mostrar solo próximos 10 días
        if (daysUntil >= 0 && daysUntil <= 10) {
          renewals.push({
            id: `renewal-${subscription.id}`,
            subscriptionId: subscription.id,
            serviceName: subscription.service_name,
            cost: subscription.cost,
            currency: subscription.currency,
            renewalDate: subscription.next_renewal_date,
            daysUntil,
            isEnabled: subscription.enable_renewal_alert,
            alertDaysBefore: subscription.alert_days_before || 7,
          });
        }
      });

      // Ordenar por fecha más próxima
      renewals.sort((a, b) => a.daysUntil - b.daysUntil);
      setUpcomingRenewals(renewals);
    };

    generateUpcomingRenewals();
  }, [subscriptions]);

  const toggleNotification = async (subscriptionId: string, enabled: boolean) => {
    try {
      await updateSubscription(subscriptionId, { enable_renewal_alert: enabled });
      
      setUpcomingRenewals(prev => 
        prev.map(renewal => 
          renewal.subscriptionId === subscriptionId 
            ? { ...renewal, isEnabled: enabled }
            : renewal
        )
      );

      toast.success(enabled ? "Notificación activada" : "Notificación desactivada");
    } catch (error) {
      toast.error("Error al actualizar la notificación");
    }
  };

  const openConfigDialog = (renewal: UpcomingRenewal) => {
    setSelectedConfig({
      subscriptionId: renewal.subscriptionId,
      enabled: renewal.isEnabled,
      daysBefore: renewal.alertDaysBefore,
      customTime: "09:00"
    });
    setIsConfigDialogOpen(true);
  };

  const saveNotificationConfig = async () => {
    if (!selectedConfig) return;

    try {
      await updateSubscription(selectedConfig.subscriptionId, {
        enable_renewal_alert: selectedConfig.enabled,
        alert_days_before: selectedConfig.daysBefore
      });

      setUpcomingRenewals(prev => 
        prev.map(renewal => 
          renewal.subscriptionId === selectedConfig.subscriptionId 
            ? { 
                ...renewal, 
                isEnabled: selectedConfig.enabled,
                alertDaysBefore: selectedConfig.daysBefore,
                customTime: selectedConfig.customTime
              }
            : renewal
        )
      );

      toast.success("Configuración guardada exitosamente");
      setIsConfigDialogOpen(false);
    } catch (error) {
      toast.error("Error al guardar la configuración");
    }
  };

  const getDaysText = (days: number) => {
    if (days === 0) return "Hoy";
    if (days === 1) return "Mañana";
    return `En ${days} días`;
  };

  const getPriorityColor = (days: number) => {
    if (days === 0) return "text-destructive";
    if (days <= 2) return "text-warning";
    return "text-muted-foreground";
  };

  const getCardBorderColor = (days: number) => {
    if (days === 0) return "border-destructive/50 bg-destructive/5";
    if (days <= 2) return "border-warning/50 bg-warning/5";
    return "";
  };

  if (loading) {
    return (
      <div className="p-6 space-y-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-muted rounded w-1/3"></div>
          <div className="h-32 bg-muted rounded"></div>
          <div className="h-32 bg-muted rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 max-w-4xl">
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Próximos Vencimientos</h1>
            <p className="text-muted-foreground">
              Gestiona las notificaciones de tus suscripciones de los próximos 10 días
            </p>
          </div>
          <Badge variant="outline" className="flex items-center gap-2">
            <Bell className="h-3 w-3" />
            {upcomingRenewals.filter(r => r.isEnabled).length} activas
          </Badge>
        </div>
      </div>

      <div className="grid gap-4">
        {upcomingRenewals.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Calendar className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">
                No hay vencimientos próximos
              </h3>
              <p className="text-muted-foreground text-center">
                No tienes suscripciones que se renueven en los próximos 10 días
              </p>
            </CardContent>
          </Card>
        ) : (
          upcomingRenewals.map((renewal) => (
            <Card 
              key={renewal.id}
              className={`transition-all hover:shadow-md ${getCardBorderColor(renewal.daysUntil)}`}
            >
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4 flex-1">
                    <div className="flex flex-col items-center justify-center w-16 h-16 rounded-full bg-muted">
                      <span className="text-xs text-muted-foreground font-medium">
                        {format(parseISO(renewal.renewalDate), "MMM", { locale: es }).toUpperCase()}
                      </span>
                      <span className="text-lg font-bold">
                        {format(parseISO(renewal.renewalDate), "dd")}
                      </span>
                    </div>
                    
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-medium">{renewal.serviceName}</h3>
                        <Badge variant={renewal.daysUntil === 0 ? "destructive" : renewal.daysUntil <= 2 ? "secondary" : "outline"}>
                          {getDaysText(renewal.daysUntil)}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {formatCurrency(renewal.cost, renewal.currency)}
                      </p>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        <span>
                          Configurado para avisar {renewal.alertDaysBefore} día{renewal.alertDaysBefore !== 1 ? 's' : ''} antes
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="flex flex-col items-center gap-2">
                      <span className="text-xs text-muted-foreground">
                        {renewal.isEnabled ? "Activada" : "Desactivada"}
                      </span>
                      <Switch
                        checked={renewal.isEnabled}
                        onCheckedChange={(checked) => toggleNotification(renewal.subscriptionId, checked)}
                      />
                    </div>
                    
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => openConfigDialog(renewal)}
                      className="h-9 w-9 p-0"
                    >
                      <Settings2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Configuración de alertas globales */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Configuración General
          </CardTitle>
          <CardDescription>
            Ajustes globales para todas las notificaciones
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <div className="text-sm font-medium">Notificaciones del navegador</div>
              <div className="text-xs text-muted-foreground">
                Recibir notificaciones push cuando estés navegando
              </div>
            </div>
            <Switch defaultChecked />
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <div className="text-sm font-medium">Resumen diario por email</div>
              <div className="text-xs text-muted-foreground">
                Recibir un email cada mañana con los vencimientos del día
              </div>
            </div>
            <Switch />
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <div className="text-sm font-medium">Solo urgentes</div>
              <div className="text-xs text-muted-foreground">
                Mostrar únicamente notificaciones de vencimientos de hoy y mañana
              </div>
            </div>
            <Switch />
          </div>
        </CardContent>
      </Card>

      {/* Dialog de configuración individual */}
      <Dialog open={isConfigDialogOpen} onOpenChange={setIsConfigDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Configurar Notificación</DialogTitle>
          </DialogHeader>
          
          {selectedConfig && (
            <div className="space-y-4">
              <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                <AlertCircle className="h-4 w-4 text-primary" />
                <div className="text-sm">
                  <p className="font-medium">
                    {upcomingRenewals.find(r => r.subscriptionId === selectedConfig.subscriptionId)?.serviceName}
                  </p>
                  <p className="text-muted-foreground">
                    Próximo vencimiento: {upcomingRenewals.find(r => r.subscriptionId === selectedConfig.subscriptionId) && 
                    format(parseISO(upcomingRenewals.find(r => r.subscriptionId === selectedConfig.subscriptionId)!.renewalDate), "dd 'de' MMMM", { locale: es })}
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="notification-enabled">Notificación activada</Label>
                <Switch
                  id="notification-enabled"
                  checked={selectedConfig.enabled}
                  onCheckedChange={(checked) => 
                    setSelectedConfig(prev => prev ? { ...prev, enabled: checked } : null)
                  }
                />
              </div>

              {selectedConfig.enabled && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="days-before">Avisar con anticipación</Label>
                    <Select
                      value={selectedConfig.daysBefore.toString()}
                      onValueChange={(value) => 
                        setSelectedConfig(prev => prev ? { ...prev, daysBefore: parseInt(value) } : null)
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1">1 día antes</SelectItem>
                        <SelectItem value="3">3 días antes</SelectItem>
                        <SelectItem value="7">1 semana antes</SelectItem>
                        <SelectItem value="14">2 semanas antes</SelectItem>
                        <SelectItem value="30">1 mes antes</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="notification-time">Hora preferida</Label>
                    <Input
                      id="notification-time"
                      type="time"
                      value={selectedConfig.customTime}
                      onChange={(e) => 
                        setSelectedConfig(prev => prev ? { ...prev, customTime: e.target.value } : null)
                      }
                    />
                    <p className="text-xs text-muted-foreground">
                      Hora a la que preferirías recibir las notificaciones
                    </p>
                  </div>
                </>
              )}
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsConfigDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={saveNotificationConfig}>
              <Save className="h-4 w-4 mr-2" />
              Guardar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Notifications;