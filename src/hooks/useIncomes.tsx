import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { useToast } from './use-toast';
import type { Income, CreateIncomeData } from '@/types/personalFinance';

// Temporary interface for update data
interface UpdateIncomeData {
  name?: string;
  description?: string;
  amount?: number;
  frequency?: 'once' | 'weekly' | 'biweekly' | 'monthly' | 'quarterly' | 'yearly';
  start_date?: string;
  end_date?: string;
  payment_day?: number;
  is_active?: boolean;
  category_id?: string;
  tags?: string[];
  notes?: string;
}

export const useIncomes = () => {
  const [incomes, setIncomes] = useState<Income[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();
  const { toast } = useToast();

  // Fetch all incomes for the current user
  const fetchIncomes = useCallback(async () => {
    if (!user) return;

    try {
      setIsLoading(true);
      setError(null);

      // Use direct SQL query as a workaround for type issues
      const { data, error } = await supabase
        .rpc('get_user_incomes', { user_id_param: user.id });

      if (error) {
        // Fallback to direct table query
        const { data: directData, error: directError } = await (supabase as any)
          .from('incomes')
          .select(`
            *,
            category:financial_categories(*)
          `)
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });

        if (directError) throw directError;

        // Calculate monthly amount for each income
        const incomesWithMonthlyAmount = directData?.map((income: any) => ({
          ...income,
          monthly_amount: calculateMonthlyAmount(income.amount, income.frequency)
        })) || [];

        setIncomes(incomesWithMonthlyAmount);
        return;
      }

      // Calculate monthly amount for each income
      const incomesWithMonthlyAmount = data?.map((income: any) => ({
        ...income,
        monthly_amount: calculateMonthlyAmount(income.amount, income.frequency)
      })) || [];

      setIncomes(incomesWithMonthlyAmount);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al cargar ingresos';
      setError(errorMessage);
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [user, toast]);

  // Create a new income
  const createIncome = async (incomeData: CreateIncomeData) => {
    if (!user) {
      toast({
        title: "Error",
        description: "Debes estar autenticado para crear ingresos",
        variant: "destructive",
      });
      return null;
    }

    try {
      setError(null);

      const { data, error } = await supabase
        .from('incomes')
        .insert([
          {
            ...incomeData,
            user_id: user.id,
          }
        ])
        .select(`
          *,
          category:financial_categories(*)
        `)
        .single();

      if (error) throw error;

      const newIncome = {
        ...data,
        monthly_amount: calculateMonthlyAmount(data.amount, data.frequency)
      };

      setIncomes(prev => [newIncome, ...prev]);
      
      toast({
        title: "¡Éxito!",
        description: "Ingreso creado correctamente",
      });

      return newIncome;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al crear ingreso';
      setError(errorMessage);
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
      return null;
    }
  };

  // Update an existing income
  const updateIncome = async (id: string, incomeData: UpdateIncomeData) => {
    try {
      setError(null);

      const { data, error } = await supabase
        .from('incomes')
        .update(incomeData)
        .eq('id', id)
        .eq('user_id', user?.id)
        .select(`
          *,
          category:financial_categories(*)
        `)
        .single();

      if (error) throw error;

      const updatedIncome = {
        ...data,
        monthly_amount: calculateMonthlyAmount(data.amount, data.frequency)
      };

      setIncomes(prev => prev.map(income => 
        income.id === id ? updatedIncome : income
      ));
      
      toast({
        title: "¡Éxito!",
        description: "Ingreso actualizado correctamente",
      });

      return updatedIncome;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al actualizar ingreso';
      setError(errorMessage);
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
      return null;
    }
  };

  // Delete an income
  const deleteIncome = async (id: string) => {
    try {
      setError(null);

      const { error } = await supabase
        .from('incomes')
        .delete()
        .eq('id', id)
        .eq('user_id', user?.id);

      if (error) throw error;

      setIncomes(prev => prev.filter(income => income.id !== id));
      
      toast({
        title: "¡Éxito!",
        description: "Ingreso eliminado correctamente",
      });

      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al eliminar ingreso';
      setError(errorMessage);
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
      return false;
    }
  };

  // Toggle income active status
  const toggleIncomeStatus = async (id: string, isActive: boolean) => {
    return updateIncome(id, { is_active: isActive });
  };

  // Calculate monthly amount based on frequency
  const calculateMonthlyAmount = (amount: number, frequency: string): number => {
    switch (frequency) {
      case 'weekly':
        return amount * 4.33; // Average weeks per month
      case 'biweekly':
        return amount * 2.17; // Average biweeks per month
      case 'monthly':
        return amount;
      case 'quarterly':
        return amount / 3;
      case 'yearly':
        return amount / 12;
      case 'once':
        return 0; // One-time income doesn't contribute to monthly
      default:
        return amount;
    }
  };

  // Calculate total monthly income
  const getTotalMonthlyIncome = (): number => {
    return incomes
      .filter(income => income.is_active)
      .reduce((total, income) => total + (income.monthly_amount || 0), 0);
  };

  // Get active incomes count
  const getActiveIncomesCount = (): number => {
    return incomes.filter(income => income.is_active).length;
  };

  // Get incomes by category
  const getIncomesByCategory = () => {
    const categoryGroups: Record<string, Income[]> = {};
    
    incomes.forEach(income => {
      const categoryName = income.category?.name || 'Sin categoría';
      if (!categoryGroups[categoryName]) {
        categoryGroups[categoryName] = [];
      }
      categoryGroups[categoryName].push(income);
    });

    return categoryGroups;
  };

  // Load incomes when user changes
  useEffect(() => {
    if (user) {
      fetchIncomes();
    } else {
      setIncomes([]);
      setIsLoading(false);
    }
  }, [user]);

  return {
    incomes,
    isLoading,
    error,
    createIncome,
    updateIncome,
    deleteIncome,
    toggleIncomeStatus,
    refreshIncomes: fetchIncomes,
    getTotalMonthlyIncome,
    getActiveIncomesCount,
    getIncomesByCategory,
    calculateMonthlyAmount,
  };
};