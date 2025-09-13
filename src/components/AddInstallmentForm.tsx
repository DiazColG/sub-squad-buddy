import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon, Calculator, CreditCard } from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { useInstallments, CreateInstallmentData } from "@/hooks/useInstallments";
import { useCards } from "@/hooks/useCards";

interface AddInstallmentFormProps {
  onSuccess?: () => void;
}

const categories = [
  { value: 'electronics', label: '📱 Electrónicos', emoji: '📱' },
  { value: 'clothing', label: '👕 Ropa y Accesorios', emoji: '👕' },
  { value: 'home', label: '🏠 Hogar y Muebles', emoji: '🏠' },
  { value: 'automotive', label: '🚗 Automotor', emoji: '🚗' },
  { value: 'education', label: '📚 Educación', emoji: '📚' },
  { value: 'health', label: '⚕️ Salud y Bienestar', emoji: '⚕️' },
  { value: 'travel', label: '✈️ Viajes', emoji: '✈️' },
  { value: 'sports', label: '⚽ Deportes', emoji: '⚽' },
  { value: 'general', label: '🛍️ General', emoji: '🛍️' },
];

export const AddInstallmentForm = ({ onSuccess }: AddInstallmentFormProps) => {
  const { createInstallment, isSubmitting } = useInstallments();
  const { cards } = useCards();
  
  const [formData, setFormData] = useState<CreateInstallmentData>({
    purchase_name: '',
    total_amount: 0,
    total_installments: 1,
    due_day: 15,
    card_id: '',
    category: 'general',
    purchase_date: new Date().toISOString().split('T')[0],
  });
  
  const [purchaseDate, setPurchaseDate] = useState<Date>(new Date());
  const [showCalculator, setShowCalculator] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.purchase_name.trim() || formData.total_amount <= 0 || formData.total_installments < 1) {
      return;
    }

    const success = await createInstallment({
      ...formData,
      purchase_date: purchaseDate.toISOString().split('T')[0],
    });
    
    if (success && onSuccess) {
      onSuccess();
    }
  };

  const installmentAmount = formData.total_amount / formData.total_installments;
  
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Purchase Name */}
      <div className="space-y-2">
        <Label htmlFor="purchase_name">Nombre de la compra *</Label>
        <Input
          id="purchase_name"
          placeholder="ej: iPhone 15 Pro, Notebook Lenovo, etc."
          value={formData.purchase_name}
          onChange={(e) => setFormData({ ...formData, purchase_name: e.target.value })}
          required
        />
      </div>

      {/* Category */}
      <div className="space-y-2">
        <Label htmlFor="category">Categoría</Label>
        <Select
          value={formData.category}
          onValueChange={(value) => setFormData({ ...formData, category: value })}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {categories.map((category) => (
              <SelectItem key={category.value} value={category.value}>
                {category.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Purchase Date */}
      <div className="space-y-2">
        <Label>Fecha de compra *</Label>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn(
                "w-full justify-start text-left font-normal",
                !purchaseDate && "text-muted-foreground"
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {purchaseDate ? (
                format(purchaseDate, "PPP", { locale: es })
              ) : (
                <span>Selecciona una fecha</span>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0">
            <Calendar
              mode="single"
              selected={purchaseDate}
              onSelect={(date) => date && setPurchaseDate(date)}
              initialFocus
            />
          </PopoverContent>
        </Popover>
      </div>

      {/* Financial Details */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calculator className="w-5 h-5" />
            Detalles Financieros
          </CardTitle>
          <CardDescription>
            Configura el monto total y la cantidad de cuotas
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Total Amount */}
          <div className="space-y-2">
            <Label htmlFor="total_amount">Monto total *</Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
              <Input
                id="total_amount"
                type="number"
                placeholder="0"
                className="pl-6"
                value={formData.total_amount || ''}
                onChange={(e) => setFormData({ ...formData, total_amount: Number(e.target.value) })}
                required
                min="1"
                step="0.01"
              />
            </div>
          </div>

          {/* Total Installments */}
          <div className="space-y-2">
            <Label htmlFor="total_installments">Cantidad de cuotas *</Label>
            <Select
              value={formData.total_installments.toString()}
              onValueChange={(value) => setFormData({ ...formData, total_installments: Number(value) })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Array.from({ length: 60 }, (_, i) => i + 1).map((num) => (
                  <SelectItem key={num} value={num.toString()}>
                    {num} {num === 1 ? 'cuota' : 'cuotas'}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Installment Preview */}
          {formData.total_amount > 0 && formData.total_installments > 0 && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-blue-700">Valor de cada cuota:</span>
                <span className="text-lg font-bold text-blue-900">
                  {formatCurrency(installmentAmount)}
                </span>
              </div>
              <p className="text-xs text-blue-600 mt-1">
                {formData.total_installments} cuotas de {formatCurrency(installmentAmount)}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Payment Details */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="w-5 h-5" />
            Detalles de Pago
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Due Day */}
          <div className="space-y-2">
            <Label htmlFor="due_day">Día de vencimiento</Label>
            <Select
              value={formData.due_day.toString()}
              onValueChange={(value) => setFormData({ ...formData, due_day: Number(value) })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Array.from({ length: 31 }, (_, i) => i + 1).map((day) => (
                  <SelectItem key={day} value={day.toString()}>
                    Día {day}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-gray-600">
              Las cuotas vencerán el día {formData.due_day} de cada mes
            </p>
          </div>

          {/* Card Selection */}
          {cards && cards.length > 0 && (
            <div className="space-y-2">
              <Label htmlFor="card_id">Tarjeta asociada (opcional)</Label>
              <Select
                value={formData.card_id}
                onValueChange={(value) => setFormData({ ...formData, card_id: value === 'none' ? '' : value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona una tarjeta" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Sin tarjeta asociada</SelectItem>
                  {cards.map((card) => (
                    <SelectItem key={card.id} value={card.id}>
                      {card.bank_name} **** {card.card_last_digits}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Submit Button */}
      <div className="flex gap-3">
        <Button
          type="submit"
          disabled={isSubmitting || !formData.purchase_name.trim() || formData.total_amount <= 0}
          className="flex-1"
        >
          {isSubmitting ? "Creando..." : "Crear Cuota"}
        </Button>
      </div>
    </form>
  );
};