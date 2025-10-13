import React, { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import AddCardForm from "@/components/AddCardForm";
import { useCards } from "@/hooks/useCards";
import type { Card } from "@/hooks/useCards";
import { useCurrencyExchange } from "@/hooks/useCurrencyExchange";

interface Props {
  onSubmit: (data: Omit<Card, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => Promise<void>;
  loading: boolean;
  onClose?: () => void;
}

// Helper wrappers to pre-fill/lock card_type and adjust labels per tab
function CardsTabForm(props: { onSubmit: Props['onSubmit']; loading: boolean; }) {
  // Merge credit/debit under one tab, with extra field: payment_method and optional link to savings account
  const [cardType, setCardType] = useState<'credit'|'debit'>('credit');
  const [paymentMethod, setPaymentMethod] = useState<'cash-deposit'|'auto-debit'>('cash-deposit');
  const { cards } = useCards();
  const savings = cards.filter(c => c.card_brand === 'Caja de Ahorro');
  const [accountId, setAccountId] = useState<string>(savings[0]?.id || '');
  const [closingDay, setClosingDay] = useState<number>(1);
  const [statementDueDay, setStatementDueDay] = useState<number>(null as unknown as number);
  const submitShim = async (data: Omit<Card, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
    await props.onSubmit({
      ...data,
      card_type: cardType,
      closing_day: cardType === 'credit' ? closingDay : null,
      statement_due_day: cardType === 'credit' ? statementDueDay || null : null,
      payment_method: paymentMethod,
      auto_debit_account_id: paymentMethod === 'auto-debit' && accountId ? accountId : null,
    });
  };
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label>Tipo</Label>
          <Select value={cardType} onValueChange={(v)=>setCardType(v as 'credit'|'debit')}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="credit">Crédito</SelectItem>
              <SelectItem value="debit">Débito</SelectItem>
            </SelectContent>
          </Select>
        </div>
        {cardType === 'credit' && (
          <div className="space-y-2">
            <Label>Fecha de cierre</Label>
            <Select value={String(closingDay)} onValueChange={(v)=>setClosingDay(parseInt(v))}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {Array.from({length:31}, (_,i)=>i+1).map(d => (
                  <SelectItem key={d} value={String(d)}>{`Día ${d}`}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}
        {cardType === 'credit' && (
          <div className="space-y-2">
            <Label>Vencimiento del resumen</Label>
            <Select value={statementDueDay ? String(statementDueDay) : undefined} onValueChange={(v)=>setStatementDueDay(parseInt(v))}>
              <SelectTrigger><SelectValue placeholder="Opcional" /></SelectTrigger>
              <SelectContent>
                {Array.from({length:31}, (_,i)=>i+1).map(d => (
                  <SelectItem key={d} value={String(d)}>{`Día ${d}`}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}
        <div className="space-y-2">
          <Label>Medio de pago</Label>
          <Select value={paymentMethod} onValueChange={(v)=>setPaymentMethod(v as 'cash-deposit'|'auto-debit')}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="cash-deposit">Depósito en efectivo</SelectItem>
              <SelectItem value="auto-debit">Débito automático</SelectItem>
            </SelectContent>
          </Select>
        </div>
        {paymentMethod === 'auto-debit' && (
          <div className="space-y-2">
            <Label>Cuenta sugerida</Label>
            <Select value={accountId} onValueChange={setAccountId}>
              <SelectTrigger><SelectValue placeholder={savings.length ? "Seleccioná una caja de ahorro" : "No hay cajas de ahorro"} /></SelectTrigger>
              <SelectContent>
                {savings.map(s => (
                  <SelectItem key={s.id} value={s.id}>{s.bank_name} •••• {s.card_last_digits} {s.currency ? `(${s.currency})` : ''}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}
      </div>
      <AddCardForm onSubmit={submitShim} loading={props.loading} initialType={cardType} />
    </div>
  );
}

function SavingsAccountForm(props: { onSubmit: Props['onSubmit']; loading: boolean; }) {
  const [bank, setBank] = useState("");
  const [digits, setDigits] = useState("");
  const [holder, setHolder] = useState("");
  const { rates } = useCurrencyExchange();
  const currencies = Object.keys(rates).length ? Object.keys(rates) : ["ARS","USD","EUR"]; 
  const [currency, setCurrency] = useState<string>(currencies.includes('ARS') ? 'ARS' : (currencies[0] || 'USD'));
  const banks = [
    "Banco Nación","Banco Provincia","Banco Ciudad","BBVA","Santander","Galicia","Macro","ICBC","HSBC","Itaú","Patagonia","Supervielle","Credicoop","Brubank","Mercado Pago","Ualá","Otro"
  ];
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await props.onSubmit({
      bank_name: bank,
      card_last_digits: digits || '0000',
      card_type: 'debit',
      card_brand: 'Caja de Ahorro',
      currency,
  cardholder_name: holder || undefined,
      enable_expiry_alert: false,
      alert_days_before: 0,
      is_active: true,
      expiry_date: new Date(new Date().getFullYear() + 20, 0, 1).toISOString().slice(0,10),
    } as unknown as Omit<Card,'id'|'user_id'|'created_at'|'updated_at'>);
  };
  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Banco *</Label>
          <Select value={bank} onValueChange={setBank}>
            <SelectTrigger><SelectValue placeholder="Selecciona el banco" /></SelectTrigger>
            <SelectContent>
              {banks.map(b => (<SelectItem key={b} value={b}>{b}</SelectItem>))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>Últimos 4 dígitos (CBU/Alias)</Label>
          <Input value={digits} onChange={(e)=>setDigits(e.target.value)} placeholder="1234" maxLength={4} pattern="[0-9]{0,4}" />
        </div>
        <div className="space-y-2">
          <Label>Moneda</Label>
          <Select value={currency} onValueChange={setCurrency}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              {currencies.map(c => (<SelectItem key={c} value={c}>{c}</SelectItem>))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2 md:col-span-2">
          <Label>Titular</Label>
          <Input value={holder} onChange={(e)=>setHolder(e.target.value)} placeholder="Nombre del titular" />
        </div>
      </div>
      <div className="flex justify-end">
        <Button type="submit" disabled={props.loading}>Agregar</Button>
      </div>
    </form>
  );
}

function CheckingAccountForm(props: { onSubmit: Props['onSubmit']; loading: boolean; }) {
  const [bank, setBank] = useState("");
  const [digits, setDigits] = useState("");
  const [holder, setHolder] = useState("");
  const { rates } = useCurrencyExchange();
  const currencies = Object.keys(rates).length ? Object.keys(rates) : ["ARS","USD","EUR"]; 
  const [currency, setCurrency] = useState<string>(currencies.includes('ARS') ? 'ARS' : (currencies[0] || 'USD'));
  const banks = [
    "Banco Nación","Banco Provincia","Banco Ciudad","BBVA","Santander","Galicia","Macro","ICBC","HSBC","Itaú","Patagonia","Supervielle","Credicoop","Brubank","Mercado Pago","Ualá","Otro"
  ];
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await props.onSubmit({
      bank_name: bank,
      card_last_digits: digits || '0000',
      card_type: 'debit',
      card_brand: 'Cuenta Corriente',
      currency,
  cardholder_name: holder || undefined,
      enable_expiry_alert: false,
      alert_days_before: 0,
      is_active: true,
      expiry_date: new Date(new Date().getFullYear() + 20, 0, 1).toISOString().slice(0,10),
    } as unknown as Omit<Card,'id'|'user_id'|'created_at'|'updated_at'>);
  };
  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Banco *</Label>
          <Select value={bank} onValueChange={setBank}>
            <SelectTrigger><SelectValue placeholder="Selecciona el banco" /></SelectTrigger>
            <SelectContent>
              {banks.map(b => (<SelectItem key={b} value={b}>{b}</SelectItem>))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>Últimos 4 dígitos (CBU/Alias)</Label>
          <Input value={digits} onChange={(e)=>setDigits(e.target.value)} placeholder="1234" maxLength={4} pattern="[0-9]{0,4}" />
        </div>
        <div className="space-y-2">
          <Label>Moneda</Label>
          <Select value={currency} onValueChange={setCurrency}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              {currencies.map(c => (<SelectItem key={c} value={c}>{c}</SelectItem>))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2 md:col-span-2">
          <Label>Titular</Label>
          <Input value={holder} onChange={(e)=>setHolder(e.target.value)} placeholder="Nombre del titular" />
        </div>
      </div>
      <div className="flex justify-end">
        <Button type="submit" disabled={props.loading}>Agregar</Button>
      </div>
    </form>
  );
}

export default function AddPaymentMethodTabs({ onSubmit, loading }: Props) {
  const [tab, setTab] = useState('savings');
  return (
    <Tabs value={tab} onValueChange={setTab} className="w-full">
      <TabsList className="grid grid-cols-3 md:grid-cols-3 gap-2 w-full">
        <TabsTrigger value="savings">Caja de Ahorro</TabsTrigger>
        <TabsTrigger value="checking">Cuenta Corriente</TabsTrigger>
        <TabsTrigger value="cards">Tarjetas</TabsTrigger>
      </TabsList>
      <div className="mt-4">
        <TabsContent value="savings">
          <SavingsAccountForm onSubmit={onSubmit} loading={loading} />
        </TabsContent>
        <TabsContent value="checking">
          <CheckingAccountForm onSubmit={onSubmit} loading={loading} />
        </TabsContent>
        <TabsContent value="cards">
          <CardsTabForm onSubmit={onSubmit} loading={loading} />
        </TabsContent>
      </div>
    </Tabs>
  );
}
