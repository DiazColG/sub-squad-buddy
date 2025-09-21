// Hook para manejar configuraciones de usuario y features beta
import { useState, useEffect, useCallback } from 'react';
import { useAuth } from './useAuth';

export interface UserSettings {
  user_id: string;
  beta_features_enabled: boolean;
  personal_finance_enabled: boolean;
  notifications_enabled: boolean;
  theme: 'light' | 'dark' | 'system';
}

export interface BetaFeatureFlag {
  feature_key: string;
  enabled: boolean;
  description: string;
}

// Configuraciones por defecto
const DEFAULT_SETTINGS: UserSettings = {
  user_id: '',
  beta_features_enabled: false,
  personal_finance_enabled: true,
  notifications_enabled: true,
  theme: 'system'
};

export function useUserSettings() {
  const { user } = useAuth();
  const [settings, setSettings] = useState<UserSettings>(DEFAULT_SETTINGS);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Beta features disponibles
  const availableBetaFeatures: BetaFeatureFlag[] = [
    {
      feature_key: 'advanced_analytics',
      enabled: false,
      description: 'Analytics avanzados y reportes detallados'
    },
    {
      feature_key: 'ai_insights',
      enabled: false,
      description: 'Insights automáticos generados por IA'
    }
  ];

  // Obtener clave para localStorage
  const getStorageKey = (userId: string) => `suscrify_user_settings_${userId}`;

  // Cargar configuraciones del localStorage
  const fetchUserSettings = useCallback(async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const storageKey = getStorageKey(user.id);
      const storedSettings = localStorage.getItem(storageKey);

      console.log('🔍 Verificando localStorage:', {
        userId: user.id,
        storageKey,
        storedSettings: storedSettings ? 'ENCONTRADO' : 'NO ENCONTRADO'
      });

      if (storedSettings) {
        try {
          const parsedSettings = JSON.parse(storedSettings);
          console.log('✅ Configuraciones cargadas:', parsedSettings);
          setSettings({
            ...DEFAULT_SETTINGS,
            ...parsedSettings,
            user_id: user.id
          });
        } catch (parseError) {
          console.error('❌ Error parseando configuraciones, creando nuevas:', parseError);
          throw parseError;
        }
      } else {
        // Crear configuraciones por defecto
        console.log('🆕 Creando configuraciones por defecto');
        const defaultUserSettings = {
          ...DEFAULT_SETTINGS,
          user_id: user.id
        };
        
        localStorage.setItem(storageKey, JSON.stringify(defaultUserSettings));
        setSettings(defaultUserSettings);
        console.log('✅ Configuraciones por defecto guardadas');
      }
    } catch (err) {
      console.error('Error loading user settings:', err);
      setError(err instanceof Error ? err.message : 'Error desconocido');
      // En caso de error, usar configuraciones por defecto
      const fallbackSettings = {
        ...DEFAULT_SETTINGS,
        user_id: user?.id || ''
      };
      setSettings(fallbackSettings);
      console.log('⚠️ Usando configuraciones de emergencia:', fallbackSettings);
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Actualizar configuraciones
  const updateSettings = async (updates: Partial<Omit<UserSettings, 'user_id'>>) => {
    if (!user) return;

    try {
      setError(null);

      const newSettings = {
        ...settings,
        ...updates,
        user_id: user.id
      };

      const storageKey = getStorageKey(user.id);
      localStorage.setItem(storageKey, JSON.stringify(newSettings));
      
      setSettings(newSettings);
      return newSettings;
    } catch (err) {
      console.error('Error updating settings:', err);
      setError(err instanceof Error ? err.message : 'Error al actualizar configuraciones');
      throw err;
    }
  };

  // Activar/desactivar beta testing
  const toggleBetaTesting = async (enabled: boolean) => {
    return updateSettings({ beta_features_enabled: enabled });
  };

  // Activar/desactivar feature específica
  const toggleFeature = async (featureKey: string, enabled: boolean) => {
    if (featureKey === 'personal_finance') {
      // Keep for compatibility, but personal finance is always enabled by default
      const result = await updateSettings({ personal_finance_enabled: enabled });
      if (enabled && !settings.personal_finance_enabled) {
        await initializePersonalFinance();
      }
      return result;
    }
    // Aquí se pueden agregar más features en el futuro
    throw new Error(`Feature '${featureKey}' no reconocida`);
  };

  // Verificar si una feature está habilitada
  const isFeatureEnabled = (featureKey: string): boolean => {
    if (!settings) return false;
    switch (featureKey) {
      case 'personal_finance':
        return true; // Always enabled for all users
      default:
        return false;
    }
  };

  // Inicializar categorías de finanzas personales cuando se activa por primera vez
  const initializePersonalFinance = async () => {
    if (!user) return;

    try {
      console.log('🚀 Inicializando finanzas personales...');
      
      // Por ahora es mock - cuando tengamos la función en DB se activará
      // const { error } = await supabase.rpc('create_default_categories_for_user', {
      //   target_user_id: user.id
      // });
      // if (error) throw error;
      
      console.log('✅ Finanzas personales inicializadas (mock)');
    } catch (err) {
      console.error('Error inicializando finanzas personales:', err);
      throw err;
    }
  };

  // Efecto para cargar configuraciones
  useEffect(() => {
    fetchUserSettings();
  }, [fetchUserSettings]);

  return {
    settings,
    loading,
    error,
    availableBetaFeatures,
    updateSettings,
    toggleBetaTesting,
    toggleFeature,
    isFeatureEnabled,
    initializePersonalFinance,
    refetch: fetchUserSettings
  };
}