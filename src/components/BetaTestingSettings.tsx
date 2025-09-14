import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useUserSettings } from '@/hooks/useUserSettings';
import { Info, FlaskConical, DollarSign, BarChart3, Brain } from 'lucide-react';

export function BetaTestingSettings() {
  const {
    settings,
    loading,
    error,
    availableBetaFeatures,
    toggleBetaTesting,
    toggleFeature,
    isFeatureEnabled
  } = useUserSettings();

  const handleBetaToggle = async (enabled: boolean) => {
    try {
      await toggleBetaTesting(enabled);
    } catch (err) {
      console.error('Error toggling beta testing:', err);
    }
  };

  const handleFeatureToggle = async (featureKey: string, enabled: boolean) => {
    try {
      await toggleFeature(featureKey, enabled);
    } catch (err) {
      console.error('Error toggling feature:', err);
    }
  };

  const getFeatureIcon = (featureKey: string) => {
    switch (featureKey) {
      case 'personal_finance':
        return <DollarSign className="h-4 w-4" />;
      case 'advanced_analytics':
        return <BarChart3 className="h-4 w-4" />;
      case 'ai_insights':
        return <Brain className="h-4 w-4" />;
      default:
        return <FlaskConical className="h-4 w-4" />;
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FlaskConical className="h-5 w-5" />
            Programa Beta
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">Cargando configuraciones...</p>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FlaskConical className="h-5 w-5" />
            Programa Beta
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription>
              Error cargando configuraciones: {error}
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FlaskConical className="h-5 w-5" />
          Programa Beta
        </CardTitle>
        <CardDescription>
          Accede a funcionalidades experimentales antes de su lanzamiento oficial
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Toggle principal de Beta Testing */}
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">Programa Beta</span>
              <Badge variant="secondary" className="text-xs">
                Experimental
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground">
              Habilitar acceso a funcionalidades en desarrollo
            </p>
          </div>
          <Switch
            checked={settings.beta_features_enabled}
            onCheckedChange={handleBetaToggle}
          />
        </div>

        {settings.beta_features_enabled && (
          <>
            <Separator />
            
            <div className="space-y-4">
              <div className="space-y-2">
                <h4 className="text-sm font-medium">Funcionalidades Beta Disponibles</h4>
                <p className="text-xs text-muted-foreground">
                  Selecciona las funcionalidades experimentales que quieres probar
                </p>
              </div>

              {availableBetaFeatures.map((feature) => (
                <div key={feature.feature_key} className="space-y-3">
                  <div className="flex items-start justify-between">
                    <div className="space-y-2 flex-1">
                      <div className="flex items-center gap-2">
                        {getFeatureIcon(feature.feature_key)}
                        <span className="text-sm font-medium">
                          {feature.feature_key === 'personal_finance' ? 'Finanzas Personales' :
                           feature.feature_key === 'advanced_analytics' ? 'Analytics Avanzados' :
                           feature.feature_key === 'ai_insights' ? 'Insights IA' :
                           feature.feature_key}
                        </span>
                        <Badge 
                          variant={isFeatureEnabled(feature.feature_key) ? "default" : "outline"}
                          className="text-xs"
                        >
                          {isFeatureEnabled(feature.feature_key) ? 'Activo' : 'Inactivo'}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {feature.description}
                      </p>
                    </div>
                    <Switch
                      checked={isFeatureEnabled(feature.feature_key)}
                      onCheckedChange={(enabled) => handleFeatureToggle(feature.feature_key, enabled)}
                      disabled={feature.feature_key !== 'personal_finance'} // Solo personal_finance está implementado
                    />
                  </div>
                  
                  {feature.feature_key === 'personal_finance' && isFeatureEnabled(feature.feature_key) && (
                    <Alert>
                      <DollarSign className="h-4 w-4" />
                      <AlertDescription className="text-xs">
                        ✅ <strong>Finanzas Personales activado:</strong> Ahora puedes acceder a la gestión de ingresos, gastos, metas de ahorro y presupuestos desde el menú lateral.
                      </AlertDescription>
                    </Alert>
                  )}
                </div>
              ))}
            </div>

            <Separator />

            <Alert>
              <Info className="h-4 w-4" />
              <AlertDescription className="text-xs">
                <strong>Importante:</strong> Las funcionalidades beta pueden contener errores o cambiar sin previo aviso. 
                Tu funcionalidad principal de suscripciones permanece intacta.
              </AlertDescription>
            </Alert>
          </>
        )}
      </CardContent>
    </Card>
  );
}