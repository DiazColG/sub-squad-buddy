import { Plus } from "lucide-react";
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useExpenses } from "@/hooks/useExpenses";
import { useFinancialCategories } from "@/hooks/useFinancialCategories";
import { useUserProfile } from "@/hooks/useUserProfile";
import { useAnalytics } from "@/lib/analytics";
import { toast } from "sonner";
import { useIsMobile } from "@/hooks/use-mobile";

export function FloatingActionButton() {
  const isMobile = useIsMobile();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  
  const { addExpense } = useExpenses();
  const { categories } = useFinancialCategories();
  const { profile } = useUserProfile();
  const analytics = useAnalytics();
  
  const [formData, setFormData] = useState({
    amount: "",
    category_id: "",
    description: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.amount || !formData.category_id) {
      toast.error("Por favor completa los campos requeridos");
      return;
    }

    setLoading(true);
    try {
      await addExpense({
        name: formData.description || "Gasto rápido",
        amount: parseFloat(formData.amount),
        category_id: formData.category_id,
        description: formData.description || "",
        transaction_date: new Date().toISOString(),
        currency: profile?.primary_display_currency || "USD",
        expense_type: "variable",
        is_recurring: false,
        payment_method: "cash",
      });

      // Track quick add usage
      analytics.track('quick_add_expense_used', {
        source: 'fab_mobile',
        amount: parseFloat(formData.amount),
        currency: profile?.primary_display_currency || "USD",
        has_description: !!formData.description,
      });

      toast.success("¡Gasto agregado exitosamente!");
      setFormData({ amount: "", category_id: "", description: "" });
      setOpen(false);
    } catch (error) {
      console.error("Error adding expense:", error);
      toast.error("Error al agregar gasto");
    } finally {
      setLoading(false);
    }
  };

  // Solo mostrar en mobile
  if (!isMobile) return null;

  return (
    <>
      {/* Floating Action Button */}
      <Button
        onClick={() => setOpen(true)}
        size="lg"
        className="fixed bottom-6 right-6 z-40 h-14 w-14 rounded-full shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-110"
        aria-label="Agregar gasto rápido"
      >
        <Plus className="h-6 w-6" />
      </Button>

      {/* Quick Add Dialog */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Agregar Gasto Rápido 🚀</DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4 mt-4">
            {/* Amount */}
            <div className="space-y-2">
              <Label htmlFor="amount">
                Monto <span className="text-red-500">*</span>
              </Label>
              <Input
                id="amount"
                type="number"
                step="0.01"
                placeholder="100.00"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                required
                autoFocus
                className="text-lg"
              />
            </div>

            {/* Category */}
            <div className="space-y-2">
              <Label htmlFor="category">
                Categoría <span className="text-red-500">*</span>
              </Label>
              <Select
                value={formData.category_id}
                onValueChange={(value) => setFormData({ ...formData, category_id: value })}
                required
              >
                <SelectTrigger id="category">
                  <SelectValue placeholder="Selecciona categoría" />
                </SelectTrigger>
                <SelectContent>
                  {categories
                    .filter((cat) => cat.type === "expense")
                    .map((cat) => (
                      <SelectItem key={cat.id} value={cat.id}>
                        {cat.icon} {cat.name}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>

            {/* Description (optional) */}
            <div className="space-y-2">
              <Label htmlFor="description">Descripción (opcional)</Label>
              <Input
                id="description"
                placeholder="Ej: Almuerzo, Uber, Café..."
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
                className="flex-1"
                disabled={loading}
              >
                Cancelar
              </Button>
              <Button type="submit" className="flex-1" disabled={loading}>
                {loading ? "Guardando..." : "Guardar"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
