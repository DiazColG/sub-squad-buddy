import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { format, parseISO } from "date-fns";
import { es } from "date-fns/locale";
import { 
  CalendarIcon, 
  Loader2, 
  CreditCard, 
  PauseCircle, 
  PlayCircle,
  Trash2,
  Save,
  X
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { useCards } from "@/hooks/useCards";
import { Subscription } from "@/hooks/useSubscriptions";

interface EditSubscriptionFormProps {
  subscription: Subscription;
  onUpdate: (id: string, data: Partial<Subscription>) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  onClose: () => void;
  loading?: boolean;
}

const EditSubscriptionForm = ({ 
  subscription, 
  onUpdate, 
  onDelete, 
  onClose, 
  loading = false 
}: EditSubscriptionFormProps) => {
  const { cards } = useCards();
  const [formData, setFormData] = useState({
    service_name: subscription.service_name || "",
    cost: subscription.cost?.toString() || "",
    currency: subscription.currency || "USD",
    billing_cycle: subscription.billing_cycle || "",
    category: subscription.category || "",
    enable_renewal_alert: subscription.enable_renewal_alert || false,
    alert_days_before: subscription.alert_days_before || 7,
    payment_method: subscription.payment_method || "",
    bank_name: subscription.bank_name || "",
    card_type: subscription.card_type || "",
    card_last_digits: subscription.card_last_digits || "",
    card_id: subscription.card_id || ""
  });
  
  const [renewalDate, setRenewalDate] = useState<Date | undefined>(
    subscription.next_renewal_date ? parseISO(subscription.next_renewal_date) : undefined
  );
  const [isActive, setIsActive] = useState(true); // Asumir activo por defecto

  const currencies = [
    "USD", "EUR", "ARS", "GBP", "CAD", "AUD", "JPY", "CHF", "SEK", "NOK", "DKK"
  ];

  const billingCycles = [
    { value: "Monthly", label: "Mensual" },
    { value: "Quarterly", label: "Trimestral" },
    { value: "Semi-Annually", label: "Semestral" },
    { value: "Annually", label: "Anual" }
  ];

  const categories = [
    "Entertainment",
    "Software", 
    "Productivity",
    "Health",
    "Business Operations",
    "Other"
  ];

  const alertOptions = [
    { value: 1, label: "1 día antes" },
    { value: 3, label: "3 días antes" },
    { value: 7, label: "7 días antes" },
    { value: 14, label: "14 días antes" },
    { value: 30, label: "30 días antes" }
  ];

  const paymentMethods = [
    { value: "debit_auto", label: "Débito Automático" },
    { value: "credit_card", label: "Tarjeta de Crédito" },
    { value: "debit_card", label: "Tarjeta de Débito" },
    { value: "transfer", label: "Transferencia" },
    { value: "other", label: "Otro" }
  ];

  const argentineBanks = [
    "Banco Nación",
    "Banco Provincia", 
    "Banco Ciudad",
    "Banco Santander",
    "Banco Macro",
    "BBVA",
    "Banco Galicia",
    "Banco Patagonia",
    "Banco Supervielle",
    "Banco Comafi",
    "Otro"
  ];

  const cardTypes = [
    { value: "visa", label: "Visa" },
    { value: "mastercard", label: "MasterCard" },
    { value: "amex", label: "American Express" },
    { value: "other", label: "Otro" }
  ];

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleCardSelection = (cardId: string) => {
    const selectedCard = cards.find(card => card.id === cardId);
    if (selectedCard) {
      setFormData(prev => ({
        ...prev,
        card_id: cardId,
        payment_method: selectedCard.card_type === 'credit' ? 'credit_card' : 'debit_card',
        card_type: selectedCard.card_brand || 'other',
        card_last_digits: selectedCard.card_last_digits,
        bank_name: selectedCard.bank_name
      }));
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!renewalDate) {
      toast.error("Por favor selecciona la fecha de renovación");
      return;
    }

    const updateData = {
      ...formData,
      cost: parseFloat(formData.cost),
      next_renewal_date: renewalDate.toISOString().split('T')[0]
    };

    await onUpdate(subscription.id, updateData);
  };

  const handleDelete = async () => {
    if (confirm("¿Estás seguro de que quieres eliminar esta suscripción?")) {
      await onDelete(subscription.id);
      onClose();
    }
  };

  const getCardDisplayName = (card: any) => {
    return `**** ${card.card_last_digits} - ${card.bank_name} (${card.card_type === 'credit' ? 'Crédito' : 'Débito'})`;
  };

  return (
    <div className="space-y-6">
      {/* Header con estado */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Editar Suscripción</h3>
          <p className="text-sm text-muted-foreground">
            Modifica los detalles de tu suscripción
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">
              {isActive ? "Activa" : "Pausada"}
            </span>
            <Switch
              checked={isActive}
              onCheckedChange={setIsActive}
            />
          </div>
          <Badge variant={isActive ? "default" : "secondary"}>
            {isActive ? "Activa" : "Pausada"}
          </Badge>
        </div>
      </div>

      <Separator />

      <form onSubmit={handleUpdate} className="space-y-6">
        {/* Información básica */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Información Básica</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="service_name">Nombre del Servicio</Label>
                <Input
                  id="service_name"
                  value={formData.service_name}
                  onChange={(e) => handleInputChange("service_name", e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="category">Categoría</Label>
                <Select value={formData.category} onValueChange={(value) => handleInputChange("category", value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-background border shadow-lg">
                    {categories.map((category) => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="cost">Costo</Label>
                <Input
                  id="cost"
                  type="number"
                  step="0.01"
                  value={formData.cost}
                  onChange={(e) => handleInputChange("cost", e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="currency">Moneda</Label>
                <Select value={formData.currency} onValueChange={(value) => handleInputChange("currency", value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-background border shadow-lg">
                    {currencies.map((currency) => (
                      <SelectItem key={currency} value={currency}>
                        {currency}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="billing_cycle">Ciclo de Facturación</Label>
                <Select value={formData.billing_cycle} onValueChange={(value) => handleInputChange("billing_cycle", value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-background border shadow-lg">
                    {billingCycles.map((cycle) => (
                      <SelectItem key={cycle.value} value={cycle.value}>
                        {cycle.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Próxima Renovación</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !renewalDate && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {renewalDate ? format(renewalDate, "PPP", { locale: es }) : "Selecciona una fecha"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0 bg-background border shadow-lg pointer-events-auto">
                    <Calendar
                      mode="single"
                      selected={renewalDate}
                      onSelect={setRenewalDate}
                      initialFocus
                      className="p-3"
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Método de pago */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <CreditCard className="h-4 w-4" />
              Método de Pago
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Selección de tarjeta guardada */}
            {cards.length > 0 && (
              <div className="space-y-2">
                <Label htmlFor="saved_card">Usar Tarjeta Guardada</Label>
                <Select value={formData.card_id} onValueChange={handleCardSelection}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona una tarjeta guardada" />
                  </SelectTrigger>
                  <SelectContent className="bg-background border shadow-lg">
                    <SelectItem value="">Sin tarjeta seleccionada</SelectItem>
                    {cards.filter(card => card.is_active).map((card) => (
                      <SelectItem key={card.id} value={card.id}>
                        {getCardDisplayName(card)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            <Separator />

            <div className="space-y-2">
              <Label htmlFor="payment_method">Método de Pago</Label>
              <Select value={formData.payment_method} onValueChange={(value) => handleInputChange("payment_method", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona un método de pago" />
                </SelectTrigger>
                <SelectContent className="bg-background border shadow-lg">
                  {paymentMethods.map((method) => (
                    <SelectItem key={method.value} value={method.value}>
                      {method.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Campos específicos según método de pago */}
            {formData.payment_method === "debit_auto" && (
              <div className="space-y-2">
                <Label htmlFor="bank_name">Banco</Label>
                <Select value={formData.bank_name} onValueChange={(value) => handleInputChange("bank_name", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona tu banco" />
                  </SelectTrigger>
                  <SelectContent className="bg-background border shadow-lg">
                    {argentineBanks.map((bank) => (
                      <SelectItem key={bank} value={bank}>
                        {bank}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {(formData.payment_method === "credit_card" || formData.payment_method === "debit_card") && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="card_type">Tipo de Tarjeta</Label>
                  <Select value={formData.card_type} onValueChange={(value) => handleInputChange("card_type", value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecciona el tipo" />
                    </SelectTrigger>
                    <SelectContent className="bg-background border shadow-lg">
                      {cardTypes.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="card_last_digits">Últimos 4 Dígitos</Label>
                  <Input
                    id="card_last_digits"
                    placeholder="1234"
                    maxLength={4}
                    value={formData.card_last_digits}
                    onChange={(e) => {
                      const value = e.target.value.replace(/\D/g, '');
                      handleInputChange("card_last_digits", value);
                    }}
                  />
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Configuración de notificaciones */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Notificaciones</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="enable_alerts"
                checked={formData.enable_renewal_alert}
                onCheckedChange={(checked) => handleInputChange("enable_renewal_alert", checked)}
              />
              <Label htmlFor="enable_alerts">Habilitar alertas de renovación</Label>
            </div>

            {formData.enable_renewal_alert && (
              <div className="space-y-2">
                <Label htmlFor="alert_days">Notificar con</Label>
                <Select 
                  value={formData.alert_days_before.toString()} 
                  onValueChange={(value) => handleInputChange("alert_days_before", parseInt(value))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-background border shadow-lg">
                    {alertOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value.toString()}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Botones de acción */}
        <div className="flex items-center justify-between pt-4">
          <Button
            type="button"
            variant="destructive"
            onClick={handleDelete}
            disabled={loading}
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Eliminar Suscripción
          </Button>

          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={loading}
            >
              <X className="h-4 w-4 mr-2" />
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Guardando...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Guardar Cambios
                </>
              )}
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default EditSubscriptionForm;