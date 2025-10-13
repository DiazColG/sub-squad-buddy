import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon, Loader2 } from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { cn } from "@/lib/utils";
import type { Card } from "@/hooks/useCards";

interface AddCardFormProps {
  onSubmit: (cardData: Omit<Card, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => Promise<void>;
  loading: boolean;
  initialType?: 'credit' | 'debit';
}

const AddCardForm = ({ onSubmit, loading, initialType = 'credit' }: AddCardFormProps) => {
  const [formData, setFormData] = useState({
    card_last_digits: "",
    bank_name: "",
    card_type: initialType as "credit" | "debit",
    card_brand: "",
    expiry_date: undefined as Date | undefined,
    cardholder_name: "",
    enable_expiry_alert: true,
    alert_days_before: 30,
    is_active: true
  });

  const cardBrands = [
    "Visa",
    "Mastercard", 
    "American Express",
    "Maestro",
    "Cabal",
    "Naranja",
    "Otro"
  ];

  const banks = [
    "Banco Nación",
    "Banco Provincia",
    "Banco Ciudad",
    "BBVA",
    "Santander",
    "Galicia",
    "Macro",
    "ICBC",
    "HSBC",
    "Itaú",
    "Patagonia",
    "Supervielle",
    "Credicoop",
    "Brubank",
    "Mercado Pago",
    "Ualá",
    "Otro"
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Permite que wrappers establezcan un expiry_date por defecto al convertir antes del submit

    try {
      await onSubmit({
        ...formData,
        expiry_date: formData.expiry_date ? formData.expiry_date.toISOString().split('T')[0] : new Date(new Date().getFullYear() + 20, 0, 1).toISOString().slice(0,10)
      });
      
      // Reset form
      setFormData({
        card_last_digits: "",
        bank_name: "",
        card_type: initialType,
        card_brand: "",
        expiry_date: undefined,
        cardholder_name: "",
        enable_expiry_alert: true,
        alert_days_before: 30,
        is_active: true
      });
    } catch (error) {
      console.error('Error submitting form:', error);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="card_last_digits">Últimos 4 dígitos *</Label>
          <Input
            id="card_last_digits"
            value={formData.card_last_digits}
            onChange={(e) => setFormData(prev => ({ ...prev, card_last_digits: e.target.value }))}
            placeholder="1234"
            maxLength={4}
            pattern="[0-9]{4}"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="bank_name">Banco emisor *</Label>
          <Select
            value={formData.bank_name}
            onValueChange={(value) => setFormData(prev => ({ ...prev, bank_name: value }))}
            required
          >
            <SelectTrigger>
              <SelectValue placeholder="Selecciona el banco" />
            </SelectTrigger>
            <SelectContent>
              {banks.map((bank) => (
                <SelectItem key={bank} value={bank}>
                  {bank}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="card_type">Tipo de tarjeta *</Label>
          <Select
            value={formData.card_type}
            onValueChange={(value) => setFormData(prev => ({ ...prev, card_type: value as "credit" | "debit" }))}
            required
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="credit">Crédito</SelectItem>
              <SelectItem value="debit">Débito</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="card_brand">Marca de tarjeta</Label>
          <Select
            value={formData.card_brand}
            onValueChange={(value) => setFormData(prev => ({ ...prev, card_brand: value }))}
          >
            <SelectTrigger>
              <SelectValue placeholder="Selecciona la marca" />
            </SelectTrigger>
            <SelectContent>
              {cardBrands.map((brand) => (
                <SelectItem key={brand} value={brand}>
                  {brand}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Fecha de vencimiento *</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-full justify-start text-left font-normal",
                  !formData.expiry_date && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {formData.expiry_date ? (
                  format(formData.expiry_date, "MM/yyyy", { locale: es })
                ) : (
                  <span>Seleccionar fecha</span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={formData.expiry_date}
                onSelect={(date) => setFormData(prev => ({ ...prev, expiry_date: date }))}
                disabled={(date) => date < new Date()}
                initialFocus
                className="pointer-events-auto"
              />
            </PopoverContent>
          </Popover>
        </div>

        <div className="space-y-2">
          <Label htmlFor="cardholder_name">Nombre del titular</Label>
          <Input
            id="cardholder_name"
            value={formData.cardholder_name}
            onChange={(e) => setFormData(prev => ({ ...prev, cardholder_name: e.target.value }))}
            placeholder="Juan Pérez"
          />
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label htmlFor="enable_expiry_alert">Alertas de vencimiento</Label>
            <p className="text-sm text-muted-foreground">
              Recibe notificaciones antes del vencimiento
            </p>
          </div>
          <Switch
            id="enable_expiry_alert"
            checked={formData.enable_expiry_alert}
            onCheckedChange={(checked) => setFormData(prev => ({ ...prev, enable_expiry_alert: checked }))}
          />
        </div>

        {formData.enable_expiry_alert && (
          <div className="space-y-2">
            <Label htmlFor="alert_days_before">Días de anticipación para alertas</Label>
            <Select
              value={formData.alert_days_before.toString()}
              onValueChange={(value) => setFormData(prev => ({ ...prev, alert_days_before: parseInt(value) }))}
            >
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7">7 días</SelectItem>
                <SelectItem value="15">15 días</SelectItem>
                <SelectItem value="30">30 días</SelectItem>
                <SelectItem value="60">60 días</SelectItem>
              </SelectContent>
            </Select>
          </div>
        )}
      </div>

      <div className="flex justify-end space-x-2">
        <Button type="submit" disabled={loading} className="bg-gradient-primary">
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Guardando...
            </>
          ) : (
            'Agregar Tarjeta'
          )}
        </Button>
      </div>
    </form>
  );
};

export default AddCardForm;