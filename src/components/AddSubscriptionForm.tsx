import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card as UICard, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Separator } from "@/components/ui/separator";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { CalendarIcon, Loader2, CreditCard, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { useCards, type Card as CardModel } from "@/hooks/useCards";
import { useExpenses } from "@/hooks/useExpenses";
type BillingCycle = "Monthly" | "Quarterly" | "Annually" | "";
type PaymentMethod = "credit_card" | "debit_card" | "bank_transfer" | "cash" | "crypto" | "";

interface AddSubscriptionFormProps { onSuccess?: () => void }

const AddSubscriptionForm = ({ onSuccess }: AddSubscriptionFormProps) => {
  const { cards } = useCards();
  const { addExpense } = useExpenses();
  const [formData, setFormData] = useState({
    service_name: "",
    cost: "",
    currency: "USD" as string,
    billing_cycle: "" as BillingCycle,
    payment_method: "" as PaymentMethod,
    card_id: "" as string,
  });
  const [renewalDate, setRenewalDate] = useState<Date>();
  const [submitting, setSubmitting] = useState(false);

  // Lista acotada y soportada por el backend (evitamos monedas que puedan romper funciones SQL)
  const currencies = ["USD", "EUR", "ARS"] as const;
  type Currency = typeof currencies[number];
  const isSupportedCurrency = (c: string): c is Currency => (currencies as readonly string[]).includes(c);

  const billingCycles = [
    { value: "Monthly", label: "Mensual" },
    { value: "Quarterly", label: "Trimestral" },
    { value: "Annually", label: "Anual" }
  ];

  const paymentMethods = [
    { value: "credit_card", label: "Tarjeta de Crédito" },
    { value: "debit_card", label: "Tarjeta de Débito" },
    { value: "bank_transfer", label: "Transferencia bancaria" },
    { value: "cash", label: "Efectivo" },
    { value: "crypto", label: "Cripto" }
  ];

  const handleInputChange = <K extends keyof SubscriptionFormState>(field: K, value: SubscriptionFormState[K]) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  type SubscriptionFormState = typeof formData;

  const handleCardSelection = (cardId: string) => {
    const selectedCard = cards.find(card => card.id === cardId);
    setFormData(prev => ({
      ...prev,
      card_id: cardId || '',
      payment_method: selectedCard ? (selectedCard.card_type === 'credit' ? 'credit_card' : 'debit_card') : prev.payment_method,
    }));
  };

  const getCardDisplayName = (card: CardModel) => {
    return `**** ${card.card_last_digits} - ${card.bank_name} (${card.card_type === 'credit' ? 'Crédito' : 'Débito'})`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // Sanitize cost (replace comma with dot, trim) and validate requireds
    const rawCost = (formData.cost || '').toString().replace(',', '.').trim();
    if (!formData.service_name || !rawCost || !formData.billing_cycle) {
      toast.error("Completá servicio, costo y ciclo");
      return;
    }
    if (!renewalDate) {
      toast.error("Por favor selecciona la fecha de contratación");
      return;
    }
    const normalizeMonthly = (amount: number, cycle: BillingCycle) => {
      if (cycle === 'Annually') return amount / 12;
      if (cycle === 'Quarterly') return amount / 3;
      return amount; // Monthly default
    };
    const costNum = Number(rawCost);
    if (!isFinite(costNum) || costNum <= 0) {
      toast.error('Ingresá un costo válido (> 0)');
      return;
    }
    // Validación: la contratación no puede ser futura (ya debería existir primer pago)
    const today = new Date();
    const startOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const startOfContract = new Date(renewalDate.getFullYear(), renewalDate.getMonth(), renewalDate.getDate());
    if (startOfContract > startOfToday) {
      toast.error('La fecha de contratación no puede ser futura');
      return;
    }
    // día sugerido para recurring_day
  const day = Math.max(1, Math.min(28, renewalDate.getDate()));
  const contractDateStr = renewalDate.toISOString().slice(0, 10);
  // calcular próxima renovación a partir de la fecha de contratación
  const monthsToAdd = formData.billing_cycle === 'Annually' ? 12 : formData.billing_cycle === 'Quarterly' ? 3 : 1;
  const nextRenewal = new Date(renewalDate);
  nextRenewal.setMonth(nextRenewal.getMonth() + monthsToAdd);
  // clamp day to 28 to avoid invalid dates (e.g., Feb)
  nextRenewal.setDate(Math.min(28, nextRenewal.getDate()));
  const nextRenewalStr = nextRenewal.toISOString().slice(0, 10);

    // Normalize payment method: if card selected, force method by card type
    const selectedCard = formData.card_id ? cards.find(c => c.id === formData.card_id) : undefined;
    const methodFinal: PaymentMethod = selectedCard
      ? (selectedCard.card_type === 'credit' ? 'credit_card' : 'debit_card')
      : (formData.payment_method as PaymentMethod);

    // Workaround: some DB-side logic may not handle bank_transfer/crypto yet.
    // Map non-card methods to 'cash' but keep the original in tags.
    let methodForInsert: PaymentMethod | null = null;
    const extraTags: string[] = [];
    if (selectedCard) {
      methodForInsert = methodFinal; // credit_card or debit_card
    } else if (methodFinal === 'credit_card' || methodFinal === 'debit_card') {
      methodForInsert = null; // let DB default apply
    } else if (methodFinal === 'bank_transfer' || methodFinal === 'crypto') {
      methodForInsert = 'cash';
      extraTags.push(`orig-payment:${methodFinal}`);
    } else if (methodFinal === 'cash' || methodFinal === '') {
      methodForInsert = 'cash';
    } else {
      methodForInsert = 'cash';
      if (methodFinal) extraTags.push(`orig-payment:${methodFinal}`);
    }

    setSubmitting(true);
    try {
  const selectedCurrency = isSupportedCurrency(formData.currency) ? formData.currency : 'USD';
  // Canonical lowercase cycle tag expected by backend logic
  const tagCycle = formData.billing_cycle === 'Annually' ? 'yearly' : (formData.billing_cycle === 'Quarterly' ? 'quarterly' : 'monthly');
      const created = await addExpense({
        name: formData.service_name,
        amount: costNum, // monto por ciclo
        frequency: 'monthly',
  // usamos la fecha de contratación como fecha de transacción del primer período
  transaction_date: contractDateStr,
        category_id: null,
        description: 'Plantilla de suscripción',
        is_recurring: true,
        recurring_day: day,
        card_id: formData.card_id || null,
        currency: selectedCurrency,
  // Guardamos explícitamente la próxima renovación calculada
  due_date: nextRenewalStr,
        expense_type: 'fixed',
        // Nota: dejamos default/omisos para columnas opcionales no críticas
        notes: null,
        payment_method: methodForInsert,
        receipt_url: null,
        tags: [
          'recurrent-template',
          'type:subscription',
          `source-cycle:${tagCycle}`,
          `subscription-start:${contractDateStr}`,
          `next-renewal:${nextRenewalStr}`,
          ...extraTags,
        ],
        // Campos de tracking son manejados por la DB
      });
      if (created) {
        toast.success('Suscripción agregada');
        onSuccess?.();
        // Reset
        setFormData({ service_name: "", cost: "", currency: "USD", billing_cycle: "", payment_method: "", card_id: "" });
        setRenewalDate(undefined);
      }
    } catch (err) {
      toast.error('No se pudo crear la suscripción');
    } finally {
      setSubmitting(false);
    }
  };

  // Vista previa de próxima renovación estimada (según fecha de contratación y ciclo)
  const nextRenewalPreview = useMemo(() => {
    if (!renewalDate || !formData.billing_cycle) return undefined;
    const monthsToAdd = formData.billing_cycle === 'Annually' ? 12 : formData.billing_cycle === 'Quarterly' ? 3 : 1;
    const d = new Date(renewalDate);
    d.setMonth(d.getMonth() + monthsToAdd);
    return format(d, 'PPP', { locale: es });
  }, [renewalDate, formData.billing_cycle]);

  return (
    <UICard>
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
              <Select value={formData.currency} onValueChange={(value) => handleInputChange("currency", value as string)}>
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
              <Select value={formData.billing_cycle} onValueChange={(value) => handleInputChange("billing_cycle", value as BillingCycle)}>
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
              <Label>Fecha de contratación</Label>
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
              {nextRenewalPreview && (
                <p className="text-sm text-muted-foreground">
                  Próxima renovación estimada: {nextRenewalPreview}
                </p>
              )}
            </div>
          </div>

          {/* Payment Method Section */}
          <div className="space-y-4 border-t pt-4">
            <h3 className="text-lg font-medium flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              Método de Pago
            </h3>
            
            {/* Método y selector de tarjeta si aplica */}
            <div className="space-y-2">
              <Label htmlFor="payment_method">Método de Pago</Label>
              <Select value={formData.payment_method} onValueChange={(value) => handleInputChange("payment_method", value as PaymentMethod)}>
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
            
            {(formData.payment_method === "credit_card" || formData.payment_method === "debit_card") && cards.length > 0 && (
              <div className="space-y-2">
                <Label htmlFor="saved_card">Tarjeta</Label>
                <Select value={formData.card_id} onValueChange={handleCardSelection}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona una tarjeta" />
                  </SelectTrigger>
                  <SelectContent className="bg-background border shadow-lg">
                    {cards.filter(c=>c.is_active).map((card) => (
                      <SelectItem key={card.id} value={card.id}>
                        {getCardDisplayName(card)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Warning si tarjeta de crédito sin fecha de cierre */}
            {useMemo(() => {
              const selected = cards.find(c => c.id === formData.card_id);
              if (!selected || selected.card_type !== 'credit') return null;
              if (selected.closing_day) return null;
              return (
                <div className="flex items-start gap-2 text-amber-600 text-sm">
                  <AlertTriangle className="h-4 w-4 mt-0.5" />
                  <span>Tu tarjeta de crédito no tiene configurada la fecha de cierre. Configúrala en Medios de Pago para imputar el mes correcto.</span>
                </div>
              );
            }, [cards, formData.card_id])}
          </div>

          <Button type="submit" className="w-full" disabled={submitting}>
            {submitting ? (
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
    </UICard>
  );
};

export default AddSubscriptionForm;