import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { CalendarIcon, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface AddSubscriptionFormProps {
  onSubmit: (data: any) => Promise<void>;
  loading?: boolean;
}

const AddSubscriptionForm = ({ onSubmit, loading = false }: AddSubscriptionFormProps) => {
  const [formData, setFormData] = useState({
    service_name: "",
    cost: "",
    currency: "USD",
    billing_cycle: "",
    category: "",
    enable_renewal_alert: false,
    alert_days_before: 7
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

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
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
      alert_days_before: 7
    });
    setRenewalDate(undefined);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Agregar Nueva Suscripción</CardTitle>
        <CardDescription>
          Completa la información de tu suscripción para comenzar a rastrearla
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
                  />
                </PopoverContent>
              </Popover>
            </div>
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