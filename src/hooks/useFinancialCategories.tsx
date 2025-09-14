import { useState, useEffect, useCallback } from "react";
// import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { toast } from "@/hooks/use-toast";
import type { FinancialCategory, CreateFinancialCategoryData } from "@/types/personalFinance";

// Mock data for development until migration is applied
const MOCK_CATEGORIES: FinancialCategory[] = [
  // Income Categories
  { id: '1', name: 'Salario', type: 'income', icon: '💼', color: '#10b981', parent_category_id: undefined, is_system: true, user_id: undefined, created_at: '2024-01-01', updated_at: '2024-01-01' },
  { id: '2', name: 'Freelance', type: 'income', icon: '💻', color: '#3b82f6', parent_category_id: undefined, is_system: true, user_id: undefined, created_at: '2024-01-01', updated_at: '2024-01-01' },
  { id: '3', name: 'Inversiones', type: 'income', icon: '📈', color: '#8b5cf6', parent_category_id: undefined, is_system: true, user_id: undefined, created_at: '2024-01-01', updated_at: '2024-01-01' },
  { id: '4', name: 'Ventas', type: 'income', icon: '🛒', color: '#f59e0b', parent_category_id: undefined, is_system: true, user_id: undefined, created_at: '2024-01-01', updated_at: '2024-01-01' },
  
  // Expense Categories
  { id: '5', name: 'Vivienda', type: 'expense', icon: '🏠', color: '#ef4444', parent_category_id: undefined, is_system: true, user_id: undefined, created_at: '2024-01-01', updated_at: '2024-01-01' },
  { id: '6', name: 'Transporte', type: 'expense', icon: '🚗', color: '#f97316', parent_category_id: undefined, is_system: true, user_id: undefined, created_at: '2024-01-01', updated_at: '2024-01-01' },
  { id: '7', name: 'Alimentación', type: 'expense', icon: '🍽️', color: '#84cc16', parent_category_id: undefined, is_system: true, user_id: undefined, created_at: '2024-01-01', updated_at: '2024-01-01' },
  { id: '8', name: 'Entretenimiento', type: 'expense', icon: '🎬', color: '#8b5cf6', parent_category_id: undefined, is_system: true, user_id: undefined, created_at: '2024-01-01', updated_at: '2024-01-01' },
  { id: '9', name: 'Salud', type: 'expense', icon: '⚕️', color: '#ec4899', parent_category_id: undefined, is_system: true, user_id: undefined, created_at: '2024-01-01', updated_at: '2024-01-01' },
  { id: '10', name: 'Educación', type: 'expense', icon: '📚', color: '#3b82f6', parent_category_id: undefined, is_system: true, user_id: undefined, created_at: '2024-01-01', updated_at: '2024-01-01' },
];

export const useFinancialCategories = () => {
  const [categories, setCategories] = useState<FinancialCategory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { user } = useAuth();

  const fetchCategories = useCallback(async () => {
    if (!user) return;

    try {
      setIsLoading(true);
      
      // TODO: Replace with real Supabase call once migration is applied
      // const { data, error } = await supabase
      //   .from('financial_categories')
      //   .select('*')
      //   .or(`user_id.is.null,user_id.eq.${user.id}`)
      //   .order('is_system', { ascending: false })
      //   .order('type')
      //   .order('name');

      // if (error) throw error;
      // setCategories(data || []);

      // Mock implementation for now
      setTimeout(() => {
        setCategories(MOCK_CATEGORIES);
        setIsLoading(false);
      }, 500);

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
      // TODO: Replace with real Supabase call once migration is applied
      // const { error } = await supabase
      //   .from('financial_categories')
      //   .insert({
      //     user_id: user.id,
      //     name: categoryData.name,
      //     type: categoryData.type,
      //     icon: categoryData.icon || '💰',
      //     color: categoryData.color || '#3b82f6',
      //     parent_category_id: categoryData.parent_category_id,
      //     is_system: false,
      //   });

      // if (error) throw error;

      // Mock implementation for now
      const newCategory: FinancialCategory = {
        id: Date.now().toString(),
        user_id: user.id,
        name: categoryData.name,
        type: categoryData.type,
        icon: categoryData.icon || '💰',
        color: categoryData.color || '#3b82f6',
        parent_category_id: categoryData.parent_category_id,
        is_system: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      setCategories(prev => [...prev, newCategory]);

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
      // TODO: Replace with real Supabase call once migration is applied
      // const { error } = await supabase
      //   .from('financial_categories')
      //   .update({
      //     ...updates,
      //     updated_at: new Date().toISOString()
      //   })
      //   .eq('id', categoryId)
      //   .eq('user_id', user.id)
      //   .eq('is_system', false);

      // if (error) throw error;

      // Mock implementation for now
      setCategories(prev => 
        prev.map(cat => 
          cat.id === categoryId && cat.user_id === user.id && !cat.is_system
            ? { ...cat, ...updates, updated_at: new Date().toISOString() }
            : cat
        )
      );

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
      // TODO: Replace with real Supabase call once migration is applied
      // const { error } = await supabase
      //   .from('financial_categories')
      //   .delete()
      //   .eq('id', categoryId)
      //   .eq('user_id', user.id)
      //   .eq('is_system', false);

      // if (error) throw error;

      // Mock implementation for now
      setCategories(prev => 
        prev.filter(cat => 
          !(cat.id === categoryId && cat.user_id === user.id && !cat.is_system)
        )
      );

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