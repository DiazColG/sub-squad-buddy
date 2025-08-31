import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { useSubscriptions } from "@/hooks/useSubscriptions";
import { Bell, Check, Clock, AlertTriangle, Settings } from "lucide-react";
import { format, differenceInDays, parseISO } from "date-fns";
import { es } from "date-fns/locale";

interface Notification {
  id: string;
  type: 'renewal' | 'overdue' | 'reminder';
  title: string;
  message: string;
  date: string;
  isRead: boolean;
  subscriptionId?: string;
  priority: 'high' | 'medium' | 'low';
}

const Notifications = () => {
  const { subscriptions, loading } = useSubscriptions();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [showUnreadOnly, setShowUnreadOnly] = useState(false);

  useEffect(() => {
    if (!subscriptions) return;

    const generateNotifications = () => {
      const today = new Date();
      const newNotifications: Notification[] = [];

      subscriptions.forEach(subscription => {
        if (!subscription.next_renewal_date || !subscription.enable_renewal_alert) return;

        const renewalDate = parseISO(subscription.next_renewal_date);
        const daysUntilRenewal = differenceInDays(renewalDate, today);
        const alertDays = subscription.alert_days_before || 7;

        // Renovación próxima
        if (daysUntilRenewal <= alertDays && daysUntilRenewal > 0) {
          newNotifications.push({
            id: `renewal-${subscription.id}`,
            type: 'renewal',
            title: `Renovación próxima: ${subscription.service_name}`,
            message: `Se renovará en ${daysUntilRenewal} día${daysUntilRenewal !== 1 ? 's' : ''} por ${subscription.cost} ${subscription.currency}`,
            date: new Date().toISOString(),
            isRead: false,
            subscriptionId: subscription.id,
            priority: daysUntilRenewal <= 3 ? 'high' : 'medium'
          });
        }

        // Renovación vencida
        if (daysUntilRenewal < 0) {
          newNotifications.push({
            id: `overdue-${subscription.id}`,
            type: 'overdue',
            title: `Renovación vencida: ${subscription.service_name}`,
            message: `Se venció hace ${Math.abs(daysUntilRenewal)} día${Math.abs(daysUntilRenewal) !== 1 ? 's' : ''}`,
            date: subscription.next_renewal_date,
            isRead: false,
            subscriptionId: subscription.id,
            priority: 'high'
          });
        }

        // Renovación hoy
        if (daysUntilRenewal === 0) {
          newNotifications.push({
            id: `today-${subscription.id}`,
            type: 'reminder',
            title: `Renovación hoy: ${subscription.service_name}`,
            message: `Se renueva hoy por ${subscription.cost} ${subscription.currency}`,
            date: new Date().toISOString(),
            isRead: false,
            subscriptionId: subscription.id,
            priority: 'high'
          });
        }
      });

      // Ordenar por prioridad y fecha
      newNotifications.sort((a, b) => {
        const priorityOrder = { high: 0, medium: 1, low: 2 };
        if (priorityOrder[a.priority] !== priorityOrder[b.priority]) {
          return priorityOrder[a.priority] - priorityOrder[b.priority];
        }
        return new Date(b.date).getTime() - new Date(a.date).getTime();
      });

      setNotifications(newNotifications);
    };

    generateNotifications();
  }, [subscriptions]);

  const markAsRead = (notificationId: string) => {
    setNotifications(prev => 
      prev.map(notification => 
        notification.id === notificationId 
          ? { ...notification, isRead: true }
          : notification
      )
    );
  };

  const markAllAsRead = () => {
    setNotifications(prev => 
      prev.map(notification => ({ ...notification, isRead: true }))
    );
  };

  const getNotificationIcon = (type: string, priority: string) => {
    if (priority === 'high') {
      return <AlertTriangle className="h-4 w-4 text-destructive" />;
    }
    if (type === 'renewal') {
      return <Clock className="h-4 w-4 text-warning" />;
    }
    return <Bell className="h-4 w-4 text-primary" />;
  };

  const getPriorityBadge = (priority: string) => {
    const variants = {
      high: "destructive" as const,
      medium: "secondary" as const,
      low: "outline" as const
    };
    
    const labels = {
      high: "Alta",
      medium: "Media", 
      low: "Baja"
    };

    return <Badge variant={variants[priority as keyof typeof variants]}>{labels[priority as keyof typeof labels]}</Badge>;
  };

  const filteredNotifications = showUnreadOnly 
    ? notifications.filter(n => !n.isRead)
    : notifications;

  const unreadCount = notifications.filter(n => !n.isRead).length;

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
            <h1 className="text-2xl font-bold">Notificaciones</h1>
            <p className="text-muted-foreground">
              Mantente al día con tus suscripciones y renovaciones
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setShowUnreadOnly(!showUnreadOnly)}
            >
              {showUnreadOnly ? "Ver todas" : "Solo no leídas"}
            </Button>
            {unreadCount > 0 && (
              <Button 
                variant="outline" 
                size="sm"
                onClick={markAllAsRead}
              >
                <Check className="h-4 w-4 mr-2" />
                Marcar todas como leídas
              </Button>
            )}
          </div>
        </div>
        
        {unreadCount > 0 && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Bell className="h-4 w-4" />
            <span>{unreadCount} notificación{unreadCount !== 1 ? 'es' : ''} sin leer</span>
          </div>
        )}
      </div>

      <div className="grid gap-4">
        {filteredNotifications.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Bell className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">
                {showUnreadOnly ? "No hay notificaciones sin leer" : "No hay notificaciones"}
              </h3>
              <p className="text-muted-foreground text-center">
                {showUnreadOnly 
                  ? "Todas tus notificaciones han sido leídas"
                  : "Las notificaciones de renovación aparecerán aquí cuando se acerquen las fechas"
                }
              </p>
            </CardContent>
          </Card>
        ) : (
          filteredNotifications.map((notification) => (
            <Card 
              key={notification.id}
              className={`transition-all hover:shadow-md ${
                !notification.isRead ? "bg-muted/30 border-primary/20" : ""
              }`}
            >
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3 flex-1">
                    {getNotificationIcon(notification.type, notification.priority)}
                    <div className="space-y-1 flex-1">
                      <div className="flex items-center gap-2">
                        <p className="font-medium">{notification.title}</p>
                        {!notification.isRead && (
                          <div className="h-2 w-2 bg-primary rounded-full"></div>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {notification.message}
                      </p>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        <span>
                          {format(parseISO(notification.date), "dd 'de' MMMM, yyyy 'a las' HH:mm", { locale: es })}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {getPriorityBadge(notification.priority)}
                    {!notification.isRead && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => markAsRead(notification.id)}
                      >
                        <Check className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Configuración de Notificaciones
          </CardTitle>
          <CardDescription>
            Personaliza cómo y cuándo recibir notificaciones
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <div className="text-sm font-medium">Notificaciones en tiempo real</div>
              <div className="text-xs text-muted-foreground">
                Mostrar notificaciones instantáneamente en el navegador
              </div>
            </div>
            <Switch defaultChecked />
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <div className="text-sm font-medium">Resumen diario</div>
              <div className="text-xs text-muted-foreground">
                Recibir un resumen diario de renovaciones próximas
              </div>
            </div>
            <Switch defaultChecked />
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <div className="text-sm font-medium">Alertas críticas únicamente</div>
              <div className="text-xs text-muted-foreground">
                Solo notificar renovaciones vencidas y de alta prioridad
              </div>
            </div>
            <Switch />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Notifications;