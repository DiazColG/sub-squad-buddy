import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Lightbulb, ListChecks, DollarSign, Home, CreditCard, Coins, Landmark } from "lucide-react";
import { InstallmentDecisionTool } from "@/components/InstallmentDecisionTool";
import { InvestDecisionTool } from "@/components/InvestDecisionTool";
import { useEffect } from "react";

const suggestions = [
  { key: "installments", label: "¿Pago en cuotas?", icon: CreditCard },
  { key: "mortgage", label: "¿Crédito hipotecario?", icon: Home },
  { key: "buy-or-rent", label: "¿Comprar o alquilar?", icon: Landmark },
  { key: "buy-dollars", label: "¿Compro dólares?", icon: Coins },
  { key: "pay-with-cc", label: "¿Pago con tarjeta de crédito?", icon: CreditCard },
  { key: "invest", label: "¿Cómo puedo invertir?", icon: DollarSign },
  { key: "monthly-spend", label: "¿Cuánto debería gastar por mes?", icon: ListChecks },
];

export default function DecisionMaking() {
  const [active, setActive] = useState<string>("installments");

  // Deep-link support: /finance/decisions#invest switches to invest tab
  useEffect(() => {
    const hash = window.location.hash.replace('#', '');
    if (hash === 'invest') setActive('invest');
    if (hash === 'installments') setActive('installments');
  }, []);

  useEffect(() => {
    const handler = () => {
      const hash = window.location.hash.replace('#', '');
      if (hash === 'invest') setActive('invest');
      if (hash === 'installments') setActive('installments');
    };
    window.addEventListener('hashchange', handler);
    return () => window.removeEventListener('hashchange', handler);
  }, []);

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
          <Lightbulb className="w-7 h-7 text-amber-500" />
          Toma de Decisiones
        </h1>
        <p className="text-gray-600 mt-1">Herramientas para ayudarte a decidir mejor en tus finanzas personales.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Sugerencias</CardTitle>
          <CardDescription>Elegí una pregunta para analizarla con datos.</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={active} onValueChange={setActive} className="w-full">
            <TabsList className="flex flex-wrap gap-2 justify-start">
              {suggestions.map((s) => (
                <TabsTrigger key={s.key} value={s.key} className="gap-2">
                  <s.icon className="w-4 h-4" /> {s.label}
                </TabsTrigger>
              ))}
            </TabsList>

            <TabsContent value="installments" className="mt-6">
              <InstallmentDecisionTool onGoInvest={() => { setActive('invest'); window.location.hash = 'invest'; }} />
            </TabsContent>
            <TabsContent value="mortgage" className="mt-6">
              <div className="text-sm text-muted-foreground">Próximamente: simulador hipotecario.</div>
            </TabsContent>
            <TabsContent value="buy-or-rent" className="mt-6">
              <div className="text-sm text-muted-foreground">Próximamente: comprar vs alquilar.</div>
            </TabsContent>
            <TabsContent value="buy-dollars" className="mt-6">
              <div className="text-sm text-muted-foreground">Próximamente: estrategia de dolarización.</div>
            </TabsContent>
            <TabsContent value="pay-with-cc" className="mt-6">
              <div className="text-sm text-muted-foreground">Próximamente: pagar con TC vs débito/contado.</div>
            </TabsContent>
            <TabsContent value="invest" className="mt-6">
              <InvestDecisionTool />
            </TabsContent>
            <TabsContent value="monthly-spend" className="mt-6">
              <div className="text-sm text-muted-foreground">Próximamente: presupuesto recomendado mensual.</div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
