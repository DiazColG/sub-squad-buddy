import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, Plus } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { useHousingServices, HousingService } from '@/hooks/useHousingServices';
import { useCards } from '@/hooks/useCards';
import { useCurrencyExchange } from '@/hooks/useCurrencyExchange';
import { useUserProfile } from '@/hooks/useUserProfile';

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
  const { cards } = useCards();
  const { convertCurrency } = useCurrencyExchange();
  const { profile } = useUserProfile();
  const [open, setOpen] = useState(false);
  const [dueDateOpen, setDueDateOpen] = useState(false);

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

  const getCardDisplayName = (card: any) => {
    return `${card.bank_name} *${card.card_last_digits}`;
  };

  const handleCardSelection = (cardId: string) => {
    if (cardId === 'manual') {
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.service_name || !formData.cost || !formData.category) {
      return;
    }

    const serviceData = {
      ...formData,
      cost: Number(formData.cost)
    } as Omit<HousingService, 'id' | 'user_id' | 'created_at'>;

    const result = await addHousingService(serviceData);
    
    if (result) {
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
              <CardTitle className="text-lg">Información de Pago</CardTitle>
              <CardDescription>Configura el método de pago para este servicio</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Tarjeta Guardada</Label>
                <Select onValueChange={handleCardSelection}>
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

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="payment_method">Método de Pago</Label>
                  <Select 
                    value={formData.payment_method} 
                    onValueChange={(value) => setFormData(prev => ({ ...prev, payment_method: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecciona método" />
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

                <div className="space-y-2">
                  <Label htmlFor="bank_name">Banco</Label>
                  <Input
                    id="bank_name"
                    value={formData.bank_name}
                    onChange={(e) => setFormData(prev => ({ ...prev, bank_name: e.target.value }))}
                    placeholder="Nombre del banco"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="card_type">Tipo de Tarjeta</Label>
                  <Input
                    id="card_type"
                    value={formData.card_type}
                    onChange={(e) => setFormData(prev => ({ ...prev, card_type: e.target.value }))}
                    placeholder="ej. Visa, Mastercard"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="card_last_digits">Últimos 4 Dígitos</Label>
                  <Input
                    id="card_last_digits"
                    value={formData.card_last_digits}
                    onChange={(e) => setFormData(prev => ({ ...prev, card_last_digits: e.target.value }))}
                    placeholder="1234"
                    maxLength={4}
                  />
                </div>
              </div>
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