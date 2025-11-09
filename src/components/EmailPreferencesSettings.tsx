import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Mail, Bell, TrendingUp, Target, AlertCircle, Loader2 } from "lucide-react";
import { Separator } from "@/components/ui/separator";

// Temporary mock hook until migration is applied
// Replace with real useEmailPreferences once migration is deployed
const useEmailPreferencesMock = () => {
  const [preferences, setPreferences] = useState({
    monthly_insights: false,
    budget_alerts: false,
    goal_reminders: false,
  });

  const updatePreference = (key: string, value: boolean) => {
    setPreferences(prev => ({ ...prev, [key]: value }));
    // TODO: This will use real API once migration is deployed
    console.log(`[Mock] Updating ${key} to ${value}`);
  };

  return {
    preferences: {
      welcome_email: true,
      password_reset_email: true,
      ...preferences,
    },
    isLoading: false,
    updatePreference,
    isUpdating: false,
  };
};

import { useState } from "react";

export function EmailPreferencesSettings() {
  const { preferences, isLoading, updatePreference, isUpdating } = useEmailPreferencesMock();

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            Preferencias de Email
          </CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Mail className="h-5 w-5" />
          Preferencias de Email
        </CardTitle>
        <CardDescription>
          Controla qué emails quieres recibir de Compounding
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Transactional Emails (Cannot be disabled) */}
        <div>
          <h3 className="text-sm font-semibold mb-3">Emails Transaccionales</h3>
          <Alert className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription className="text-xs">
              Estos emails son esenciales para la seguridad de tu cuenta y no pueden ser desactivados.
            </AlertDescription>
          </Alert>

          <div className="space-y-4">
            {/* Welcome Email */}
            <div className="flex items-center justify-between py-2">
              <div className="flex items-start gap-3 flex-1">
                <Mail className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div className="flex-1">
                  <Label className="text-sm font-medium">Email de Bienvenida</Label>
                  <p className="text-xs text-muted-foreground mt-1">
                    Se envía una vez cuando creas tu cuenta
                  </p>
                </div>
              </div>
              <Switch
                checked={preferences?.welcome_email ?? true}
                disabled
                className="opacity-50"
              />
            </div>

            {/* Password Reset */}
            <div className="flex items-center justify-between py-2">
              <div className="flex items-start gap-3 flex-1">
                <AlertCircle className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div className="flex-1">
                  <Label className="text-sm font-medium">Restablecimiento de Contraseña</Label>
                  <p className="text-xs text-muted-foreground mt-1">
                    Necesario para recuperar tu cuenta de forma segura
                  </p>
                </div>
              </div>
              <Switch
                checked={preferences?.password_reset_email ?? true}
                disabled
                className="opacity-50"
              />
            </div>
          </div>
        </div>

        <Separator />

        {/* Optional Marketing/Feature Emails */}
        <div>
          <h3 className="text-sm font-semibold mb-3">Emails Opcionales</h3>
          <p className="text-xs text-muted-foreground mb-4">
            Puedes activar o desactivar estos emails cuando quieras
          </p>

          <div className="space-y-4">
            {/* Monthly Insights */}
            <div className="flex items-center justify-between py-2">
              <div className="flex items-start gap-3 flex-1">
                <TrendingUp className="h-5 w-5 text-blue-500 mt-0.5" />
                <div className="flex-1">
                  <Label htmlFor="monthly-insights" className="text-sm font-medium cursor-pointer">
                    Resumen Mensual 📊
                  </Label>
                  <p className="text-xs text-muted-foreground mt-1">
                    Recibe un análisis de tus finanzas cada mes con insights personalizados
                  </p>
                </div>
              </div>
              <Switch
                id="monthly-insights"
                checked={preferences?.monthly_insights ?? false}
                onCheckedChange={(checked) => updatePreference('monthly_insights', checked)}
                disabled={isUpdating}
              />
            </div>

            {/* Budget Alerts */}
            <div className="flex items-center justify-between py-2">
              <div className="flex items-start gap-3 flex-1">
                <Bell className="h-5 w-5 text-amber-500 mt-0.5" />
                <div className="flex-1">
                  <Label htmlFor="budget-alerts" className="text-sm font-medium cursor-pointer">
                    Alertas de Presupuesto ⚠️
                  </Label>
                  <p className="text-xs text-muted-foreground mt-1">
                    Te avisamos cuando te acerques al límite de tus presupuestos
                  </p>
                </div>
              </div>
              <Switch
                id="budget-alerts"
                checked={preferences?.budget_alerts ?? false}
                onCheckedChange={(checked) => updatePreference('budget_alerts', checked)}
                disabled={isUpdating}
              />
            </div>

            {/* Goal Reminders */}
            <div className="flex items-center justify-between py-2">
              <div className="flex items-start gap-3 flex-1">
                <Target className="h-5 w-5 text-green-500 mt-0.5" />
                <div className="flex-1">
                  <Label htmlFor="goal-reminders" className="text-sm font-medium cursor-pointer">
                    Recordatorios de Metas 🎯
                  </Label>
                  <p className="text-xs text-muted-foreground mt-1">
                    Mantente motivado con recordatorios sobre tus objetivos financieros
                  </p>
                </div>
              </div>
              <Switch
                id="goal-reminders"
                checked={preferences?.goal_reminders ?? false}
                onCheckedChange={(checked) => updatePreference('goal_reminders', checked)}
                disabled={isUpdating}
              />
            </div>
          </div>
        </div>

        <Separator />

        {/* Footer Info */}
        <div className="pt-2">
          <p className="text-xs text-muted-foreground">
            💡 <strong>Nuestra filosofía:</strong> Solo te enviamos emails cuando realmente aportan valor.
            Nunca spam, nunca invasivo.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
