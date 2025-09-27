import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Bell, Calendar } from "lucide-react";

// Los recordatorios ahora se configuran en cada gasto recurrente. Esta página actúa como placeholder.
const Notifications = () => {
  return (
    <div className="p-6 space-y-6 max-w-4xl">
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Notificaciones</h1>
            <p className="text-muted-foreground">
              Los recordatorios ahora se configuran dentro de cada gasto recurrente.
            </p>
          </div>
        </div>
      </div>

      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <Calendar className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium mb-2">Recordatorios en Gastos</h3>
          <p className="text-muted-foreground text-center max-w-md">
            Configurá los “Recordatorios (días antes)” por plantilla de gasto recurrente desde la pantalla de Gastos.
            Pronto centralizaremos las alertas generales en esta sección.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Configuración General
          </CardTitle>
          <CardDescription>Ajustes globales (visual)</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <div className="text-sm font-medium">Notificaciones del navegador</div>
              <div className="text-xs text-muted-foreground">Recibir notificaciones push cuando estés navegando</div>
            </div>
            <Switch defaultChecked />
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <div className="text-sm font-medium">Resumen diario por email</div>
              <div className="text-xs text-muted-foreground">Email cada mañana con los vencimientos del día</div>
            </div>
            <Switch />
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <div className="text-sm font-medium">Solo urgentes</div>
              <div className="text-xs text-muted-foreground">Mostrar solo vencimientos de hoy y mañana</div>
            </div>
            <Switch />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Notifications;