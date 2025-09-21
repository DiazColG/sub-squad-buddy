import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { toast } from "@/hooks/use-toast";

export interface InstallmentData {
  id: string;
  user_id: string;
  purchase_name: string;
  total_amount: number;
  installment_amount: number;
  total_installments: number;
  paid_installments: number;
  due_day: number;
  card_id?: string;
  category: string;
  purchase_date: string;
  next_due_date: string;
  status: 'active' | 'completed' | 'paused';
  created_at: string;
  updated_at: string;
}

export interface CreateInstallmentData {
  purchase_name: string;
  total_amount: number;
  total_installments: number;
  due_day: number;
  card_id?: string;
  category: string;
  purchase_date: string;
}

export const useInstallments = () => {
  const [installments, setInstallments] = useState<InstallmentData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { user } = useAuth();

  const fetchInstallments = async () => {
    if (!user) return;

    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('installments')
        .select('*')
        .eq('user_id', user.id)
        .order('next_due_date', { ascending: true });

      if (error) throw error;
      setInstallments(data || []);
    } catch (error) {
      console.error('Error fetching installments:', error);
      toast({
        title: "Error",
        description: "No se pudieron cargar las cuotas",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const createInstallment = async (installmentData: CreateInstallmentData) => {
    if (!user) {
      toast({
        title: "Error",
        description: "Debes estar autenticado para crear cuotas",
        variant: "destructive",
      });
      return false;
    }

    setIsSubmitting(true);
    
    try {
      // Calculate installment amount
      const installment_amount = installmentData.total_amount / installmentData.total_installments;
      
      // Calculate next due date based on purchase date and due day
      const purchaseDate = new Date(installmentData.purchase_date);
      const nextDueDate = new Date(purchaseDate);
      
      // Set to the specified day of the next month
      nextDueDate.setMonth(nextDueDate.getMonth() + 1);
      nextDueDate.setDate(installmentData.due_day);
      
      // If the due day doesn't exist in the month (e.g., 31st of February), 
      // set to the last day of the month
      if (nextDueDate.getDate() !== installmentData.due_day) {
        nextDueDate.setDate(0); // Sets to last day of previous month
      }

      const { error } = await supabase
        .from('installments')
        .insert({
          user_id: user.id,
          purchase_name: installmentData.purchase_name,
          total_amount: installmentData.total_amount,
          installment_amount: installment_amount,
          total_installments: installmentData.total_installments,
          paid_installments: 0,
          due_day: installmentData.due_day,
          card_id: installmentData.card_id,
          category: installmentData.category,
          purchase_date: installmentData.purchase_date,
          next_due_date: nextDueDate.toISOString().split('T')[0],
          status: 'active'
        });

      if (error) throw error;

      toast({
        title: "¡Cuota creada!",
        description: "La compra en cuotas se agregó exitosamente",
      });
      
      // Refresh the list
      await fetchInstallments();
      return true;
    } catch (error) {
      console.error('Error creating installment:', error);
      toast({
        title: "Error",
        description: "No se pudo crear la cuota. Inténtalo de nuevo.",
        variant: "destructive",
      });
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };

  const markInstallmentPaid = async (installmentId: string) => {
    if (!user) return false;

    try {
      // First, get the current installment data
      const { data: currentData, error: fetchError } = await supabase
        .from('installments')
        .select('*')
        .eq('id', installmentId)
        .single();

      if (fetchError) throw fetchError;

      const newPaidInstallments = currentData.paid_installments + 1;
      const isCompleted = newPaidInstallments >= currentData.total_installments;
      
      const updateData: any = {
        paid_installments: newPaidInstallments,
        updated_at: new Date().toISOString()
      };

      // If not completed, calculate next due date
      if (!isCompleted) {
        const currentDueDate = new Date(currentData.next_due_date);
        const nextDueDate = new Date(currentDueDate);
        nextDueDate.setMonth(nextDueDate.getMonth() + 1);
        
        // Ensure we maintain the same due day
        nextDueDate.setDate(currentData.due_day);
        if (nextDueDate.getDate() !== currentData.due_day) {
          nextDueDate.setDate(0); // Last day of previous month
        }
        
        updateData.next_due_date = nextDueDate.toISOString().split('T')[0];
      } else {
        updateData.status = 'completed';
      }

      const { error } = await supabase
        .from('installments')
        .update(updateData)
        .eq('id', installmentId);

      if (error) throw error;

      toast({
        title: "¡Cuota marcada como pagada!",
        description: isCompleted 
          ? "¡Felicitaciones! Terminaste de pagar todas las cuotas." 
          : `Cuota ${newPaidInstallments}/${currentData.total_installments} pagada exitosamente`,
      });
      
      await fetchInstallments();
      return true;
    } catch (error) {
      console.error('Error marking installment as paid:', error);
      toast({
        title: "Error",
        description: "No se pudo marcar la cuota como pagada",
        variant: "destructive",
      });
      return false;
    }
  };

  const deleteInstallment = async (installmentId: string) => {
    if (!user) return false;

    try {
      const { error } = await supabase
        .from('installments')
        .delete()
        .eq('id', installmentId)
        .eq('user_id', user.id);

      if (error) throw error;

      toast({
        title: "Cuota eliminada",
        description: "La compra en cuotas se eliminó exitosamente",
      });
      
      await fetchInstallments();
      return true;
    } catch (error) {
      console.error('Error deleting installment:', error);
      toast({
        title: "Error",
        description: "No se pudo eliminar la cuota",
        variant: "destructive",
      });
      return false;
    }
  };

  useEffect(() => {
    if (user) {
      fetchInstallments();
    }
  }, [user]);

  return {
    installments,
    isLoading,
    isSubmitting,
    createInstallment,
    markInstallmentPaid,
    deleteInstallment,
    refetch: fetchInstallments,
  };
};