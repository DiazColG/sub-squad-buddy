import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Separator } from "@/components/ui/separator";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { CalendarIcon, Loader2, CreditCard } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { useCards } from "@/hooks/useCards";

interface AddSubscriptionFormProps {
  onSubmit: (data: any) => Promise<void>;
  loading?: boolean;
}

const AddSubscriptionForm = ({ onSubmit, loading = false }: AddSubscriptionFormProps) => {
  const { cards } = useCards();
  const [formData, setFormData] = useState({
    service_name: "",
    cost: "",
    currency: "USD",
    billing_cycle: "",
    category: "",
    enable_renewal_alert: false,
    alert_days_before: 7,
    payment_method: "",
    bank_name: "",
    card_type: "",
    card_last_digits: "",
    card_id: ""
  });
  const [renewalDate, setRenewalDate] = useState<Date>();

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
    { value: 7, label: "7 días antes" }
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
    if (cardId === 'manual') {
      // Reset card fields to allow manual entry
      setFormData(prev => ({
        ...prev,
        card_id: '',
        payment_method: '',
        card_type: '',
        card_last_digits: '',
        bank_name: ''
      }));
    } else {
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
    }
  };

  const getCardDisplayName = (card: any) => {
    return `**** ${card.card_last_digits} - ${card.bank_name} (${card.card_type === 'credit' ? 'Crédito' : 'Débito'})`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!renewalDate) {
      toast.error("Por favor selecciona la fecha de renovación");
      return;
    }

    const subscriptionData = {
      ...formData,
      cost: parseFloat(formData.cost),
      next_renewal_date: renewalDate.toISOString().split('T')[0]
    };

    await onSubmit(subscriptionData);
    
    // Reset form
    setFormData({
      service_name: "",
      cost: "",
      currency: "USD",
      billing_cycle: "",
      category: "",
      enable_renewal_alert: false,
      alert_days_before: 7,
      payment_method: "",
      bank_name: "",
      card_type: "",
      card_last_digits: "",
      card_id: ""
    });
    setRenewalDate(undefined);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Agregar Nueva Suscripción</CardTitle>
        <CardDescription>
          Completa la información de tu nueva suscripción.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="service_name">Nombre del Servicio</Label>
              <Input
                id="service_name"
                placeholder="ej. Netflix Premium"
                value={formData.service_name}
                onChange={(e) => handleInputChange("service_name", e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="category">Categoría</Label>
              <Select value={formData.category} onValueChange={(value) => handleInputChange("category", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona una categoría" />
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
                placeholder="0.00"
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
                  <SelectValue placeholder="Selecciona el ciclo" />
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
                <PopoverContent className="w-auto p-0 bg-background border shadow-lg">
                  <Calendar
                    mode="single"
                    selected={renewalDate}
                    onSelect={setRenewalDate}
                    initialFocus
                    className="p-3 pointer-events-auto"
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>

          {/* Payment Method Section */}
          <div className="space-y-4 border-t pt-4">
            <h3 className="text-lg font-medium flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              Método de Pago
            </h3>
            
            {/* Selección de tarjeta guardada */}
            {cards.length > 0 && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="saved_card">Usar Tarjeta Guardada</Label>
                  <Select value={formData.card_id} onValueChange={handleCardSelection}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecciona una tarjeta guardada" />
                    </SelectTrigger>
                    <SelectContent className="bg-background border shadow-lg">
                      <SelectItem value="manual">Ingresar manualmente</SelectItem>
                      {cards.filter(card => card.is_active).map((card) => (
                        <SelectItem key={card.id} value={card.id}>
                          {getCardDisplayName(card)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <Separator />
              </>
            )}
            
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

            {/* Débito Automático - Bank Selection */}
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

            {/* Tarjetas - Card Type and Last 4 Digits */}
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
          </div>

          {/* Notification Settings */}
          <div className="space-y-4 border-t pt-4">
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
          </div>

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Agregando...
              </>
            ) : (
              "Agregar Suscripción"
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default AddSubscriptionForm;