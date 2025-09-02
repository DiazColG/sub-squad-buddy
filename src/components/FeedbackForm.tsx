import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { MessageSquare, Lightbulb, Bug, Star } from "lucide-react";
import { useFeedback, FeedbackData } from "@/hooks/useFeedback";

const feedbackTypes = [
  { 
    value: 'improvement' as const, 
    label: 'Mejora', 
    icon: Star,
    description: 'Sugerir mejoras a funciones existentes'
  },
  { 
    value: 'feature_request' as const, 
    label: 'Nueva función', 
    icon: Lightbulb,
    description: 'Solicitar nuevas características'
  },
  { 
    value: 'bug_report' as const, 
    label: 'Reportar error', 
    icon: Bug,
    description: 'Informar sobre problemas o errores'
  },
  { 
    value: 'general' as const, 
    label: 'Comentario general', 
    icon: MessageSquare,
    description: 'Otros comentarios o sugerencias'
  },
];

export const FeedbackForm = () => {
  const { submitFeedback, isSubmitting } = useFeedback();
  const [formData, setFormData] = useState<FeedbackData>({
    type: 'improvement',
    title: '',
    description: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title.trim() || !formData.description.trim()) {
      return;
    }

    const success = await submitFeedback(formData);
    if (success) {
      setFormData({
        type: 'improvement',
        title: '',
        description: '',
      });
    }
  };

  const selectedType = feedbackTypes.find(type => type.value === formData.type);

  return (
    <Card className="shadow-card border-card-border">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageSquare className="h-5 w-5 text-accent" />
          Feedback y Sugerencias
        </CardTitle>
        <CardDescription>
          Ayúdanos a mejorar compartiendo tus ideas y comentarios
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="feedbackType">Tipo de feedback</Label>
            <Select 
              value={formData.type} 
              onValueChange={(value: FeedbackData['type']) => 
                setFormData(prev => ({ ...prev, type: value }))
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecciona el tipo" />
              </SelectTrigger>
              <SelectContent>
                {feedbackTypes.map((type) => {
                  const Icon = type.icon;
                  return (
                    <SelectItem key={type.value} value={type.value}>
                      <div className="flex items-center gap-2">
                        <Icon className="h-4 w-4" />
                        <div>
                          <div className="font-medium">{type.label}</div>
                          <div className="text-xs text-muted-foreground">{type.description}</div>
                        </div>
                      </div>
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="title">Título</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              placeholder={`Describe brevemente tu ${selectedType?.label.toLowerCase()}`}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Descripción detallada</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Explica en detalle tu sugerencia, mejora o problema..."
              className="min-h-[100px]"
              required
            />
          </div>

          <Button 
            type="submit" 
            disabled={isSubmitting || !formData.title.trim() || !formData.description.trim()}
            className="w-full"
          >
            {isSubmitting ? 'Enviando...' : 'Enviar Feedback'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};