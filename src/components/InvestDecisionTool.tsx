import { useMemo, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Lightbulb, Target, Shield, LineChart } from "lucide-react";

type Currency = "ARS" | "USD";

type Horizon = "0-6" | "6-24" | ">24";
type Risk = "low" | "medium" | "high";
type Goal = "preserve" | "beat_inflation" | "dollarize";

export function InvestDecisionTool() {
  const [amount, setAmount] = useState<number>(0);
  const [currency, setCurrency] = useState<Currency>("ARS");
  const [horizon, setHorizon] = useState<Horizon>("0-6");
  const [risk, setRisk] = useState<Risk>("low");
  const [goal, setGoal] = useState<Goal>("preserve");

  const formatCurrency = (value: number, cur: Currency = currency) =>
    new Intl.NumberFormat("es-AR", { style: "currency", currency: cur, minimumFractionDigits: 2 }).format(value || 0);

  const suggestions = useMemo(() => {
    const ideas: Array<{ title: string; desc: string; tags: string[] }> = [];
    const add = (title: string, desc: string, tags: string[]) => ideas.push({ title, desc, tags });

    const isShort = horizon === "0-6";
    const isMid = horizon === "6-24";
    const isLong = horizon === ">24";

    if (goal === "dollarize") {
      add("Dólar MEP", "Dolarizá en blanco para protegerte del tipo de cambio.", ["Liquidez media", "Riesgo bajo"]);
      if (isMid || isLong) add("CEDEARs de ETFs", "Diversificación global con instrumentos en USD vía CEDEARs.", ["Riesgo medio", "Cobertura cambiaria"]);
    }

    if (goal === "preserve") {
      if (currency === "ARS") {
        add("Fondo Money Market", "Liquidez diaria para caja de paso.", ["Muy líquido", "Riesgo bajo"]);
        if (!isShort) add("Bonos CER cortos", "Cobertura contra inflación con duración acotada.", ["Indexado a inflación", "Duración corta"]);
      } else {
        add("T-Bills / MM en USD (vía CEDEAR/FCI)", "Liquidez en dólares con baja volatilidad.", ["Riesgo bajo", "Liquidez"]);
      }
    }

    if (goal === "beat_inflation") {
      if (currency === "ARS") {
        add("Bonos CER", "Renta fija ajustada por inflación para mantener poder adquisitivo.", ["Indexado a inflación"]);
        if (isLong && risk !== "low") add("Acciones/CEDEARs", "Potencial de rendimiento real en el largo plazo.", ["Riesgo alto", "Largo plazo"]);
      } else {
        add("CEDEARs de ETFs", "Diversificación internacional (S&P 500, Nasdaq, etc.).", ["Riesgo medio/alto"]);
      }
    }

    if (ideas.length === 0) {
      add("Fondo Money Market", "Punto de partida seguro mientras definís estrategia.", ["Muy líquido", "Bajo riesgo"]);
    }

    return ideas;
  }, [currency, horizon, risk, goal]);

  const sampleSplit = useMemo(() => {
    // Una distribución sencilla y didáctica (no asesoramiento)
    if (goal === "dollarize") return [
      { name: "Dólar MEP", pct: 70 },
      { name: "CEDEARs de ETFs", pct: 30 },
    ];
    if (goal === "preserve") return [
      { name: currency === "ARS" ? "Fondo MM (ARS)" : "MM USD/CEDEAR TBills", pct: 70 },
      { name: currency === "ARS" ? "CER corto" : "CEDEAR ETF bono corto", pct: 30 },
    ];
    return [
      { name: currency === "ARS" ? "CER" : "ETF bonos USD", pct: 50 },
      { name: "CEDEARs/Acciones", pct: 50 },
    ];
  }, [goal, currency]);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2"><Lightbulb className="w-5 h-5 text-amber-500" /> ¿En qué invertir?</CardTitle>
        <CardDescription>Elegí tus preferencias y te proponemos caminos posibles. No es asesoramiento financiero.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="space-y-2">
            <Label>Monto a invertir</Label>
            <Input type="number" min="0" step="0.01" value={amount || ""} onChange={(e) => setAmount(Number(e.target.value))} />
          </div>
          <div className="space-y-2">
            <Label>Moneda</Label>
            <Select value={currency} onValueChange={(v) => setCurrency(v as Currency)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="ARS">ARS</SelectItem>
                <SelectItem value="USD">USD</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Horizonte</Label>
            <Select value={horizon} onValueChange={(v) => setHorizon(v as Horizon)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="0-6">0-6 meses</SelectItem>
                <SelectItem value="6-24">6-24 meses</SelectItem>
                <SelectItem value=">24">24+ meses</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Riesgo</Label>
            <Select value={risk} onValueChange={(v) => setRisk(v as Risk)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="low">Bajo</SelectItem>
                <SelectItem value="medium">Medio</SelectItem>
                <SelectItem value="high">Alto</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2 md:col-span-2">
            <Label>Objetivo</Label>
            <Select value={goal} onValueChange={(v) => setGoal(v as Goal)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="preserve">Cuidar capital</SelectItem>
                <SelectItem value="beat_inflation">Superar inflación</SelectItem>
                <SelectItem value="dollarize">Dolarizar</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-3">
          <div className="text-sm text-muted-foreground">Ejemplo de distribución (ilustrativa):</div>
          <div className="flex flex-wrap gap-2">
            {sampleSplit.map((s) => (
              <Badge key={s.name} variant="secondary">{s.name}: {s.pct}%</Badge>
            ))}
          </div>
        </div>

        <div className="space-y-4">
          <div className="text-sm text-muted-foreground">Ideas recomendadas:</div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {suggestions.map((s, idx) => (
              <Card key={idx} className="border-dashed">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base flex items-center gap-2"><Target className="w-4 h-4" />{s.title}</CardTitle>
                </CardHeader>
                <CardContent className="pt-0 text-sm text-muted-foreground">
                  <div>{s.desc}</div>
                  <div className="flex flex-wrap gap-2 mt-3">
                    {s.tags.map((t) => (<Badge key={t} variant="outline">{t}</Badge>))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2"><Shield className="w-4 h-4" /> Aclaración</CardTitle>
            <CardDescription>Información educativa. No constituye asesoramiento financiero personalizado.</CardDescription>
          </CardHeader>
        </Card>
      </CardContent>
    </Card>
  );
}
