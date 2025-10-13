import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { toast } from 'sonner';

export interface Card {
  id: string;
  user_id: string;
  card_last_digits: string;
  bank_name: string;
  card_type: 'credit' | 'debit';
  card_brand?: string;
  currency?: string | null;
  payment_method?: 'cash-deposit' | 'auto-debit' | null;
  auto_debit_account_id?: string | null;
  closing_day?: number | null;
  statement_due_day?: number | null;
  expiry_date: string;
  cardholder_name?: string;
  enable_expiry_alert: boolean;
  alert_days_before: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export const useCards = () => {
  const [cards, setCards] = useState<Card[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  const fetchCards = useCallback(async () => {
    if (!user) {
      setCards([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('cards')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching cards:', error);
        toast.error('Error al cargar las tarjetas');
        return;
      }

      setCards((data || []) as Card[]);
    } catch (error) {
      console.error('Error fetching cards:', error);
      toast.error('Error al cargar las tarjetas');
    } finally {
      setLoading(false);
    }
  }, [user]);

  const addCard = async (cardData: Omit<Card, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
    if (!user) {
      toast.error('Debes estar autenticado');
      return;
    }

    try {
      const { data, error } = await supabase
        .from('cards')
        .insert([{
          ...cardData,
          user_id: user.id
        }])
        .select()
        .single();

      if (error) {
        console.error('Error adding card:', error);
        toast.error('Error al agregar la tarjeta');
        throw error;
      }

      setCards(prev => [data as Card, ...prev]);
      toast.success('Tarjeta agregada exitosamente');
      return data as Card;
    } catch (error) {
      console.error('Error adding card:', error);
      throw error;
    }
  };

  const updateCard = async (id: string, updates: Partial<Card>) => {
    try {
      const { data, error } = await supabase
        .from('cards')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Error updating card:', error);
        toast.error('Error al actualizar la tarjeta');
        throw error;
      }

      setCards(prev => prev.map(card => 
        card.id === id ? { ...card, ...(data as Card) } : card
      ));
      toast.success('Tarjeta actualizada exitosamente');
      return data as Card;
    } catch (error) {
      console.error('Error updating card:', error);
      throw error;
    }
  };

  const deleteCard = async (id: string) => {
    try {
      const { error } = await supabase
        .from('cards')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Error deleting card:', error);
        toast.error('Error al eliminar la tarjeta');
        throw error;
      }

      setCards(prev => prev.filter(card => card.id !== id));
      toast.success('Tarjeta eliminada exitosamente');
    } catch (error) {
      console.error('Error deleting card:', error);
      throw error;
    }
  };

  // Get cards that are expiring soon
  const getExpiringCards = (days: number = 30) => {
    const today = new Date();
    const futureDate = new Date();
    futureDate.setDate(today.getDate() + days);
    
    return cards.filter(card => {
      const expiryDate = new Date(card.expiry_date);
      return card.is_active && card.enable_expiry_alert && 
             expiryDate >= today && expiryDate <= futureDate;
    });
  };

  useEffect(() => {
    fetchCards();
  }, [user, fetchCards]);

  return {
    cards,
    loading,
    addCard,
    updateCard,
    deleteCard,
    refetch: fetchCards,
    getExpiringCards
  };
};