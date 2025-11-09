import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useAuth } from './useAuth';

export interface EmailPreferences {
  id?: string;
  user_id: string;
  welcome_email: boolean;
  password_reset_email: boolean;
  monthly_insights: boolean;
  budget_alerts: boolean;
  goal_reminders: boolean;
  created_at?: string;
  updated_at?: string;
}

export const useEmailPreferences = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Fetch user's email preferences
  const {
    data: preferences,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['email-preferences', user?.id],
    queryFn: async () => {
      if (!user?.id) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('user_email_preferences')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) {
        console.error('[useEmailPreferences] Error fetching preferences:', error);
        throw error;
      }

      // If no preferences exist, create default ones
      if (!data) {
        const defaultPrefs: Partial<EmailPreferences> = {
          user_id: user.id,
          welcome_email: true,
          password_reset_email: true,
          monthly_insights: false,
          budget_alerts: false,
          goal_reminders: false,
        };

        const { data: newData, error: insertError } = await supabase
          .from('user_email_preferences')
          .insert(defaultPrefs)
          .select()
          .single();

        if (insertError) {
          console.error('[useEmailPreferences] Error creating preferences:', insertError);
          throw insertError;
        }

        return newData as EmailPreferences;
      }

      return data as EmailPreferences;
    },
    enabled: !!user?.id,
  });

  // Update email preferences
  const updatePreferencesMutation = useMutation({
    mutationFn: async (updates: Partial<EmailPreferences>) => {
      if (!user?.id) throw new Error('User not authenticated');

      // Don't allow updating transactional emails
      const allowedUpdates = {
        monthly_insights: updates.monthly_insights,
        budget_alerts: updates.budget_alerts,
        goal_reminders: updates.goal_reminders,
      };

      const { data, error } = await supabase
        .from('user_email_preferences')
        .update(allowedUpdates)
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) {
        console.error('[useEmailPreferences] Error updating preferences:', error);
        throw error;
      }

      return data as EmailPreferences;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['email-preferences'] });
      toast.success('Preferencias de email actualizadas');
    },
    onError: (error: Error) => {
      console.error('[useEmailPreferences] Update error:', error);
      toast.error('Error al actualizar preferencias');
    },
  });

  // Helper function to update a single preference
  const updatePreference = (key: keyof EmailPreferences, value: boolean) => {
    // Don't allow disabling transactional emails
    if (key === 'welcome_email' || key === 'password_reset_email') {
      toast.error('No puedes desactivar emails transaccionales');
      return;
    }

    updatePreferencesMutation.mutate({ [key]: value });
  };

  return {
    preferences,
    isLoading,
    error,
    updatePreference,
    updatePreferences: updatePreferencesMutation.mutate,
    isUpdating: updatePreferencesMutation.isPending,
  };
};
