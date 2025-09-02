import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { toast } from "@/hooks/use-toast";

export interface FeedbackData {
  type: 'improvement' | 'feature_request' | 'bug_report' | 'general';
  title: string;
  description: string;
}

export const useFeedback = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { user } = useAuth();

  const submitFeedback = async (feedbackData: FeedbackData) => {
    if (!user) {
      toast({
        title: "Error",
        description: "Debes estar autenticado para enviar feedback",
        variant: "destructive",
      });
      return false;
    }

    setIsSubmitting(true);
    
    try {
      const { error } = await supabase
        .from('feedback')
        .insert({
          user_id: user.id,
          type: feedbackData.type,
          title: feedbackData.title,
          description: feedbackData.description,
        });

      if (error) throw error;

      toast({
        title: "¡Feedback enviado!",
        description: "Gracias por tu comentario. Lo revisaremos pronto.",
      });
      
      return true;
    } catch (error) {
      console.error('Error submitting feedback:', error);
      toast({
        title: "Error",
        description: "No se pudo enviar el feedback. Inténtalo de nuevo.",
        variant: "destructive",
      });
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    submitFeedback,
    isSubmitting,
  };
};