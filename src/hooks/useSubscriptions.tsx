import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

export interface Subscription {
  id: string;
  service_name: string;
  cost: number;
  currency: string;
  billing_cycle: string;
  next_renewal_date: string;
  category: string;
  enable_renewal_alert: boolean;
  alert_days_before: number;
  user_id: string;
  team_id?: string;
  created_at: string;
}

export const useSubscriptions = () => {
  const { user } = useAuth();
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchSubscriptions = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('subscriptions')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching subscriptions:', error);
        toast.error('Error al cargar suscripciones');
        return;
      }

      setSubscriptions(data || []);
    } catch (error) {
      console.error('Error:', error);
      toast.error('Error al cargar suscripciones');
    } finally {
      setLoading(false);
    }
  };

  const addSubscription = async (subscription: Omit<Subscription, 'id' | 'user_id' | 'created_at'>) => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('subscriptions')
        .insert([{
          ...subscription,
          user_id: user.id
        }])
        .select()
        .single();

      if (error) {
        console.error('Error adding subscription:', error);
        toast.error('Error al agregar suscripción');
        return;
      }

      setSubscriptions(prev => [data, ...prev]);
      toast.success('Suscripción agregada exitosamente');
      return data;
    } catch (error) {
      console.error('Error:', error);
      toast.error('Error al agregar suscripción');
    }
  };

  const updateSubscription = async (id: string, updates: Partial<Subscription>) => {
    try {
      const { data, error } = await supabase
        .from('subscriptions')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Error updating subscription:', error);
        toast.error('Error al actualizar suscripción');
        return;
      }

      setSubscriptions(prev => prev.map(sub => sub.id === id ? data : sub));
      toast.success('Suscripción actualizada exitosamente');
      return data;
    } catch (error) {
      console.error('Error:', error);
      toast.error('Error al actualizar suscripción');
    }
  };

  const deleteSubscription = async (id: string) => {
    try {
      const { error } = await supabase
        .from('subscriptions')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Error deleting subscription:', error);
        toast.error('Error al eliminar suscripción');
        return;
      }

      setSubscriptions(prev => prev.filter(sub => sub.id !== id));
      toast.success('Suscripción eliminada exitosamente');
    } catch (error) {
      console.error('Error:', error);
      toast.error('Error al eliminar suscripción');
    }
  };

  useEffect(() => {
    fetchSubscriptions();
  }, [user]);

  return {
    subscriptions,
    loading,
    addSubscription,
    updateSubscription,
    deleteSubscription,
    refetch: fetchSubscriptions
  };
};