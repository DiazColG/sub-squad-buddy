import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

export interface HousingService {
  id: string;
  service_name: string;
  cost: number;
  currency: string;
  billing_cycle: string;
  next_due_date: string;
  category: string;
  enable_due_alert: boolean;
  alert_days_before: number;
  user_id: string;
  team_id?: string;
  created_at: string;
  payment_method?: string;
  bank_name?: string;
  card_type?: string;
  card_last_digits?: string;
  card_id?: string;
}

export const useHousingServices = () => {
  const { user } = useAuth();
  const [housingServices, setHousingServices] = useState<HousingService[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchHousingServices = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('housing_services')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching housing services:', error.message || error);
        toast.error('Error al cargar servicios de vivienda');
        return;
      }

      setHousingServices(data || []);
    } catch (error: any) {
      console.error('Error:', error.message || error);
      toast.error('Error al cargar servicios de vivienda');
    } finally {
      setLoading(false);
    }
  };

  const addHousingService = async (service: Omit<HousingService, 'id' | 'user_id' | 'created_at'>) => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('housing_services')
        .insert([{
          ...service,
          user_id: user.id
        }])
        .select()
        .single();

      if (error) {
        console.error('Error adding housing service:', error.message || error);
        toast.error('Error al agregar servicio');
        return;
      }

      setHousingServices(prev => [data, ...prev]);
      toast.success('Servicio agregado exitosamente');
      return data;
    } catch (error: any) {
      console.error('Error:', error.message || error);
      toast.error('Error al agregar servicio');
    }
  };

  const updateHousingService = async (id: string, updates: Partial<HousingService>) => {
    try {
      const { data, error } = await supabase
        .from('housing_services')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Error updating housing service:', error);
        toast.error('Error al actualizar servicio');
        return;
      }

      setHousingServices(prev => prev.map(service => service.id === id ? data : service));
      toast.success('Servicio actualizado exitosamente');
      return data;
    } catch (error) {
      console.error('Error:', error);
      toast.error('Error al actualizar servicio');
    }
  };

  const deleteHousingService = async (id: string) => {
    try {
      const { error } = await supabase
        .from('housing_services')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Error deleting housing service:', error);
        toast.error('Error al eliminar servicio');
        return;
      }

      setHousingServices(prev => prev.filter(service => service.id !== id));
      toast.success('Servicio eliminado exitosamente');
    } catch (error) {
      console.error('Error:', error);
      toast.error('Error al eliminar servicio');
    }
  };

  useEffect(() => {
    fetchHousingServices();
  }, [user]);

  return {
    housingServices,
    loading,
    addHousingService,
    updateHousingService,
    deleteHousingService,
    refetch: fetchHousingServices
  };
};