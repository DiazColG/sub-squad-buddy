import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { toast } from "@/hooks/use-toast";
import type { FinancialCategory, CreateFinancialCategoryData } from "@/types/personalFinance";

// Removing mocks; now reading from Supabase

export const useFinancialCategories = () => {
  const [categories, setCategories] = useState<FinancialCategory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { user } = useAuth();

  const fetchCategories = useCallback(async () => {
    if (!user) return;

    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('financial_categories')
        .select('*')
        .or(`user_id.is.null,user_id.eq.${user.id}`)
        .order('is_system', { ascending: false })
        .order('type')
        .order('name');

      if (error) throw error;
      setCategories(data as unknown as FinancialCategory[] || []);
      setIsLoading(false);

    } catch (error) {
      console.error('Error fetching financial categories:', error);
      toast({
        title: "Error",
        description: "No se pudieron cargar las categorías",
        variant: "destructive",
      });
      setIsLoading(false);
    }
  }, [user]);

  const createCategory = async (categoryData: CreateFinancialCategoryData) => {
    if (!user) {
      toast({
        title: "Error",
        description: "Debes estar autenticado para crear categorías",
        variant: "destructive",
      });
      return false;
    }

    setIsSubmitting(true);

    try {
      const { data, error } = await supabase
        .from('financial_categories')
        .insert({
          user_id: user.id,
          name: categoryData.name,
          type: categoryData.type,
          icon: categoryData.icon || '💰',
          color: categoryData.color || '#3b82f6',
          parent_category_id: categoryData.parent_category_id || null,
          is_system: false,
        })
        .select()
        .single();

      if (error) throw error;

      setCategories(prev => [...prev, data as unknown as FinancialCategory]);

      toast({
        title: "¡Categoría creada!",
        description: `La categoría "${categoryData.name}" se creó exitosamente`,
      });
      
      return true;
    } catch (error) {
      console.error('Error creating category:', error);
      toast({
        title: "Error",
        description: "No se pudo crear la categoría. Inténtalo de nuevo.",
        variant: "destructive",
      });
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };

  const updateCategory = async (categoryId: string, updates: Partial<CreateFinancialCategoryData>) => {
    if (!user) return false;

    try {
      const { data, error } = await supabase
        .from('financial_categories')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', categoryId)
        .eq('user_id', user.id)
        .eq('is_system', false)
        .select()
        .single();

      if (error) throw error;

      setCategories(prev => prev.map(cat => (cat.id === categoryId ? (data as unknown as FinancialCategory) : cat)));

      toast({
        title: "Categoría actualizada",
        description: "Los cambios se guardaron exitosamente",
      });
      
      return true;
    } catch (error) {
      console.error('Error updating category:', error);
      toast({
        title: "Error",
        description: "No se pudo actualizar la categoría",
        variant: "destructive",
      });
      return false;
    }
  };

  const deleteCategory = async (categoryId: string) => {
    if (!user) return false;

    try {
      const { error } = await supabase
        .from('financial_categories')
        .delete()
        .eq('id', categoryId)
        .eq('user_id', user.id)
        .eq('is_system', false);

      if (error) throw error;

      setCategories(prev => prev.filter(cat => cat.id !== categoryId));

      toast({
        title: "Categoría eliminada",
        description: "La categoría se eliminó exitosamente",
      });
      
      return true;
    } catch (error) {
      console.error('Error deleting category:', error);
      toast({
        title: "Error",
        description: "No se pudo eliminar la categoría",
        variant: "destructive",
      });
      return false;
    }
  };

  // Helper functions
  const getIncomeCategories = () => categories.filter(cat => cat.type === 'income');
  const getExpenseCategories = () => categories.filter(cat => cat.type === 'expense');
  const getSystemCategories = () => categories.filter(cat => cat.is_system);
  const getUserCategories = () => categories.filter(cat => !cat.is_system && cat.user_id === user?.id);
  
  const getCategoryById = (id: string) => categories.find(cat => cat.id === id);
  
  const getCategoriesByParent = (parentId?: string) => 
    categories.filter(cat => cat.parent_category_id === parentId);

  useEffect(() => {
    if (user) {
      fetchCategories();
    }
  }, [user, fetchCategories]);

  return {
    categories,
    isLoading,
    isSubmitting,
    createCategory,
    updateCategory,
    deleteCategory,
    refetch: fetchCategories,
    
    // Helper functions
    getIncomeCategories,
    getExpenseCategories,
    getSystemCategories,
    getUserCategories,
    getCategoryById,
    getCategoriesByParent,
  };
};