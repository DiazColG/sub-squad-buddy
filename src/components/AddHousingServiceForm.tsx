import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Checkbox } from '@/components/ui/checkbox';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, Plus, CreditCard } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { useHousingServices, HousingService } from '@/hooks/useHousingServices';
import { useCards } from '@/hooks/useCards';
import { useCurrencyExchange } from '@/hooks/useCurrencyExchange';
import { useUserProfile } from '@/hooks/useUserProfile';
import { toast } from 'sonner';

const housingCategories = [
  { value: 'utilities', label: 'Servicios básicos' },
  { value: 'rent', label: 'Alquiler' },
  { value: 'maintenance', label: 'Expensas' },
  { value: 'telecommunications', label: 'Telecom/Internet' },
  { value: 'security', label: 'Seguridad' },
  { value: 'taxes', label: 'ABL/Impuestos' },
  { value: 'other', label: 'Otros' }
];

const billingCycles = [
  { value: 'monthly', label: 'Mensual' },
  { value: 'bimonthly', label: 'Bimestral' },
  { value: 'quarterly', label: 'Trimestral' },
  { value: 'annual', label: 'Anual' }
];

const paymentMethods = [
  { value: 'credit_card', label: 'Tarjeta de crédito' },
  { value: 'debit_card', label: 'Tarjeta de débito' },
  { value: 'bank_transfer', label: 'Transferencia bancaria' },
  { value: 'cash', label: 'Efectivo' },
  { value: 'other', label: 'Otro' }
];

interface AddHousingServiceFormProps {
  onServiceAdded: () => void;
}

export const AddHousingServiceForm: React.FC<AddHousingServiceFormProps> = ({ onServiceAdded }) => {
  const { addHousingService } = useHousingServices();
  const { cards, addCard } = useCards();
  const { convertCurrency } = useCurrencyExchange();
  const { profile } = useUserProfile();
  const [open, setOpen] = useState(false);
  const [dueDateOpen, setDueDateOpen] = useState(false);
  const [selectedPaymentOption, setSelectedPaymentOption] = useState<string>('');
  const [showNewCardForm, setShowNewCardForm] = useState(false);
  const [saveNewCard, setSaveNewCard] = useState(false);

  const [formData, setFormData] = useState<Partial<HousingService>>({
    service_name: '',
    cost: 0,
    currency: profile?.primary_display_currency || 'USD',
    billing_cycle: 'monthly',
    next_due_date: '',
    category: '',
    enable_due_alert: false,
    alert_days_before: 7,
    payment_method: '',
    bank_name: '',
    card_type: '',
    card_last_digits: '',
    card_id: ''
  });

  const [newCardData, setNewCardData] = useState({
    cardholder_name: '',
    bank_name: '',
    card_brand: '',
    card_type: 'credit' as 'credit' | 'debit',
    card_last_digits: '',
    expiry_date: '',
    payment_method: 'credit_card'
  });

  const getCardDisplayName = (card: any) => {
    return `${card.bank_name} *${card.card_last_digits}`;
  };

  const handlePaymentOptionChange = (value: string) => {
    setSelectedPaymentOption(value);
    setShowNewCardForm(false);
    setSaveNewCard(false);
    
    if (value === 'new_card') {
      setShowNewCardForm(true);
      // Clear previous card data
      setFormData(prev => ({
        ...prev,
        card_id: '',
        payment_method: '',
        card_type: '',
        card_last_digits: '',
        bank_name: ''
      }));
    } else if (value) {
      // Existing card selected
      const selectedCard = cards.find(card => card.id === value);
      if (selectedCard) {
        setFormData(prev => ({
          ...prev,
          card_id: value,
          payment_method: selectedCard.card_type === 'credit' ? 'credit_card' : 'debit_card',
          card_type: selectedCard.card_brand || 'other',
          card_last_digits: selectedCard.card_last_digits,
          bank_name: selectedCard.bank_name
        }));
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.service_name || !formData.cost || !formData.category) {
      toast.error('Por favor completa todos los campos obligatorios');
      return;
    }

    // If creating new card and save option is checked
    if (showNewCardForm && saveNewCard) {
      try {
        const cardToSave = {
          ...newCardData,
          alert_days_before: 30,
          enable_expiry_alert: true,
          is_active: true
        };
        
        const savedCard = await addCard(cardToSave);
        if (savedCard) {
          // Update service data with the new saved card
          setFormData(prev => ({
            ...prev,
            card_id: savedCard.id,
            payment_method: cardToSave.payment_method,
            card_type: newCardData.card_brand,
            card_last_digits: newCardData.card_last_digits,
            bank_name: newCardData.bank_name
          }));
        }
      } catch (error) {
        toast.error('Error al guardar la tarjeta');
        return;
      }
    } else if (showNewCardForm) {
      // Just use the new card data without saving
      setFormData(prev => ({
        ...prev,
        payment_method: newCardData.card_type === 'credit' ? 'credit_card' : 'debit_card',
        card_type: newCardData.card_brand,
        card_last_digits: newCardData.card_last_digits,
        bank_name: newCardData.bank_name
      }));
    }

    const serviceData = {
      ...formData,
      cost: Number(formData.cost)
    } as Omit<HousingService, 'id' | 'user_id' | 'created_at'>;

    const result = await addHousingService(serviceData);
    
    if (result) {
      // Reset form
      setFormData({
        service_name: '',
        cost: 0,
        currency: profile?.primary_display_currency || 'USD',
        billing_cycle: 'monthly',
        next_due_date: '',
        category: '',
        enable_due_alert: false,
        alert_days_before: 7,
        payment_method: '',
        bank_name: '',
        card_type: '',
        card_last_digits: '',
        card_id: ''
      });
      setNewCardData({
        cardholder_name: '',
        bank_name: '',
        card_brand: '',
        card_type: 'credit' as 'credit' | 'debit',
        card_last_digits: '',
        expiry_date: '',
        payment_method: 'credit_card'
      });
      setSelectedPaymentOption('');
      setShowNewCardForm(false);
      setSaveNewCard(false);
      setOpen(false);
      onServiceAdded();
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="flex items-center gap-2">
          <Plus className="w-4 h-4" />
          Agregar Servicio
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Agregar Nuevo Servicio de Vivienda</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="service_name">Nombre del Servicio *</Label>
              <Input
                id="service_name"
                value={formData.service_name}
                onChange={(e) => setFormData(prev => ({ ...prev, service_name: e.target.value }))}
                placeholder="ej. Luz, Gas, Internet..."
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="category">Categoría *</Label>
              <Select 
                value={formData.category} 
                onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona una categoría" />
                </SelectTrigger>
                <SelectContent className="bg-background border shadow-lg">
                  {housingCategories.map((category) => (
                    <SelectItem key={category.value} value={category.value}>
                      {category.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="cost">Costo *</Label>
              <Input
                id="cost"
                type="number"
                step="0.01"
                value={formData.cost}
                onChange={(e) => setFormData(prev => ({ ...prev, cost: parseFloat(e.target.value) || 0 }))}
                placeholder="0.00"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="currency">Moneda</Label>
              <Select 
                value={formData.currency} 
                onValueChange={(value) => setFormData(prev => ({ ...prev, currency: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-background border shadow-lg">
                  <SelectItem value="USD">USD</SelectItem>
                  <SelectItem value="ARS">ARS</SelectItem>
                  <SelectItem value="EUR">EUR</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="billing_cycle">Frecuencia</Label>
              <Select 
                value={formData.billing_cycle} 
                onValueChange={(value) => setFormData(prev => ({ ...prev, billing_cycle: value }))}
              >
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
          </div>

          <div className="space-y-2">
            <Label>Próximo Vencimiento</Label>
            <Popover open={dueDateOpen} onOpenChange={setDueDateOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !formData.next_due_date && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {formData.next_due_date ? format(new Date(formData.next_due_date), "PPP", { locale: es }) : "Seleccionar fecha"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={formData.next_due_date ? new Date(formData.next_due_date) : undefined}
                  onSelect={(date) => {
                    setFormData(prev => ({ 
                      ...prev, 
                      next_due_date: date ? format(date, 'yyyy-MM-dd') : '' 
                    }));
                    setDueDateOpen(false);
                  }}
                  initialFocus
                  className="pointer-events-auto"
                />
              </PopoverContent>
            </Popover>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <CreditCard className="w-5 h-5" />
                Método de Pago
              </CardTitle>
              <CardDescription>Selecciona o agrega un método de pago para este servicio</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Método de Pago</Label>
                <Select value={selectedPaymentOption} onValueChange={handlePaymentOptionChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona un método de pago" />
                  </SelectTrigger>
                  <SelectContent className="bg-background border shadow-lg">
                    {cards.filter(card => card.is_active).map((card) => (
                      <SelectItem key={card.id} value={card.id}>
                        <div className="flex items-center gap-2">
                          <CreditCard className="w-4 h-4" />
                          {getCardDisplayName(card)}
                        </div>
                      </SelectItem>
                    ))}
                    <SelectItem value="new_card">
                      <div className="flex items-center gap-2">
                        <Plus className="w-4 h-4" />
                        Nuevo método de pago
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {showNewCardForm && (
                <div className="space-y-4 p-4 border rounded-lg bg-muted/50">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium">Información del nuevo método de pago</h4>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="cardholder_name">Nombre del Titular</Label>
                      <Input
                        id="cardholder_name"
                        value={newCardData.cardholder_name}
                        onChange={(e) => setNewCardData(prev => ({ ...prev, cardholder_name: e.target.value }))}
                        placeholder="Nombre completo"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="new_bank_name">Banco</Label>
                      <Input
                        id="new_bank_name"
                        value={newCardData.bank_name}
                        onChange={(e) => setNewCardData(prev => ({ ...prev, bank_name: e.target.value }))}
                        placeholder="Nombre del banco"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="card_brand">Marca de Tarjeta</Label>
                      <Input
                        id="card_brand"
                        value={newCardData.card_brand}
                        onChange={(e) => setNewCardData(prev => ({ ...prev, card_brand: e.target.value }))}
                        placeholder="Visa, Mastercard, etc."
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="new_card_type">Tipo</Label>
                      <Select 
                        value={newCardData.card_type} 
                        onValueChange={(value) => setNewCardData(prev => ({ ...prev, card_type: value as 'credit' | 'debit' }))}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-background border shadow-lg">
                          <SelectItem value="credit">Crédito</SelectItem>
                          <SelectItem value="debit">Débito</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="new_card_last_digits">Últimos 4 Dígitos</Label>
                      <Input
                        id="new_card_last_digits"
                        value={newCardData.card_last_digits}
                        onChange={(e) => setNewCardData(prev => ({ ...prev, card_last_digits: e.target.value }))}
                        placeholder="1234"
                        maxLength={4}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="expiry_date">Fecha de Vencimiento</Label>
                    <Input
                      id="expiry_date"
                      type="date"
                      value={newCardData.expiry_date}
                      onChange={(e) => setNewCardData(prev => ({ ...prev, expiry_date: e.target.value }))}
                    />
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="save_card" 
                      checked={saveNewCard}
                      onCheckedChange={(checked) => setSaveNewCard(checked === true)}
                    />
                    <Label htmlFor="save_card" className="text-sm">
                      Guardar este método de pago para el futuro
                    </Label>
                  </div>
                </div>
              )}

              {selectedPaymentOption && !showNewCardForm && (
                <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                  <div className="flex items-center gap-2 text-green-800">
                    <CreditCard className="w-4 h-4" />
                    <span className="text-sm font-medium">
                      Método de pago seleccionado: {getCardDisplayName(cards.find(c => c.id === selectedPaymentOption))}
                    </span>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Alertas</CardTitle>
              <CardDescription>Configura recordatorios para tus pagos</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="enable_due_alert">Activar alertas de vencimiento</Label>
                  <p className="text-sm text-muted-foreground">Recibe notificaciones antes del vencimiento</p>
                </div>
                <Switch
                  id="enable_due_alert"
                  checked={formData.enable_due_alert}
                  onCheckedChange={(checked) => setFormData(prev => ({ ...prev, enable_due_alert: checked }))}
                />
              </div>

              {formData.enable_due_alert && (
                <div className="space-y-2">
                  <Label htmlFor="alert_days_before">Días de anticipación</Label>
                  <Select 
                    value={formData.alert_days_before?.toString()} 
                    onValueChange={(value) => setFormData(prev => ({ ...prev, alert_days_before: parseInt(value) }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-background border shadow-lg">
                      <SelectItem value="1">1 día</SelectItem>
                      <SelectItem value="3">3 días</SelectItem>
                      <SelectItem value="7">7 días</SelectItem>
                      <SelectItem value="15">15 días</SelectItem>
                      <SelectItem value="30">30 días</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}
            </CardContent>
          </Card>

          <div className="flex justify-end gap-3">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit">
              Agregar Servicio
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};