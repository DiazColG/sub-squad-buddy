import { useMemo, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { CalendarIcon, CheckCircle2, CircleAlert, BarChart3, ArrowLeftRight, Lightbulb } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { economicService, type EconomicIndicator } from "@/lib/economicService";

type Currency = "ARS" | "USD";

interface AnalysisRow {
  i: number;
  month: string;
  paymentDate: string;
  nominal: number;
  real: number;
  usd: number;
}

export function InstallmentDecisionTool({ onGoInvest }: { onGoInvest?: () => void }) {
  const navigate = useNavigate();
  const [cashPrice, setCashPrice] = useState<number>(0);
  const [financedTotal, setFinancedTotal] = useState<number>(0);
  const [currency, setCurrency] = useState<Currency>("ARS");
  const [installments, setInstallments] = useState<number>(12);
  const [purchaseDate, setPurchaseDate] = useState<Date>(new Date());
  const [monthlyInflation, setMonthlyInflation] = useState<number>(3.0); // %
  const [monthlyDevaluation, setMonthlyDevaluation] = useState<number>(3.0); // %
  const [baseIndicator, setBaseIndicator] = useState<EconomicIndicator | null>(null);
  const [analysisRows, setAnalysisRows] = useState<AnalysisRow[] | null>(null);
  const [summary, setSummary] = useState<{ cashPrice: number; financedNominal: number; financedReal: number; totalUSD: number; recommendation: "installments" | "cash"; savingsPct: number } | null>(null);
  const [loading, setLoading] = useState(false);

  const firstPaymentDateStr = useMemo(() => {
    return economicService.addMonths(purchaseDate.toISOString(), 1);
  }, [purchaseDate]);

  const formatCurrency = (value: number, cur: Currency = currency) =>
    new Intl.NumberFormat("es-AR", {
      style: "currency",
      currency: cur,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value || 0);

  const buildSyntheticIndicators = async (): Promise<EconomicIndicator[]> => {
    const indicators = await economicService.getEconomicIndicators();
    // Pick the latest available as base
    const latest = indicators
      .slice()
      .sort((a, b) => (a.period_month < b.period_month ? -1 : 1))
      .at(-1) || null;
    const base = latest ?? {
      period_month: economicService.dateToYearMonth(new Date().toISOString()),
      inflation_rate: monthlyInflation,
      accumulated_inflation: monthlyInflation,
      usd_official_rate: 1000,
      usd_blue_rate: 1200,
      purchasing_power_index: 100,
      data_source: "synthetic",
    } satisfies EconomicIndicator;
    setBaseIndicator(base);

    const months: EconomicIndicator[] = [];
    const startYm = economicService.dateToYearMonth(purchaseDate.toISOString());
    const totalMonths = Math.max(installments + 1, 2); // include purchase month
    const basePPI = 100; // Normalize to 100 at purchase
    const baseUsd = base.usd_blue_rate;

    for (let i = 0; i < totalMonths; i++) {
      const dateStr = economicService.addMonths(purchaseDate.toISOString(), i);
      const ym = economicService.dateToYearMonth(dateStr);
      const ppi = basePPI / Math.pow(1 + monthlyInflation / 100, i);
      const usdBlue = baseUsd * Math.pow(1 + monthlyDevaluation / 100, i);
      months.push({
        period_month: ym,
        inflation_rate: monthlyInflation,
        accumulated_inflation: monthlyInflation * (i + 1),
        usd_official_rate: Math.max(1, base.usd_official_rate * Math.pow(1 + monthlyDevaluation / 100, i)),
        usd_blue_rate: Math.max(1, usdBlue),
        purchasing_power_index: ppi,
        data_source: "synthetic",
      });
    }

    return months;
  };

  const analyze = async () => {
    setLoading(true);
    try {
      if (!financedTotal || !cashPrice || installments <= 0) {
        setAnalysisRows(null);
        setSummary(null);
        return;
      }
      const synthetic = await buildSyntheticIndicators();
      const installmentAmount = financedTotal / installments;
      const rows: AnalysisRow[] = [];
      let totalNominal = 0;
      let totalReal = 0;
      let totalUSD = 0;
      for (let i = 0; i < installments; i++) {
        const payDate = economicService.addMonths(firstPaymentDateStr, i);
        const ym = economicService.dateToYearMonth(payDate);
        const nominal = installmentAmount;
        const real = economicService.calculateRealValue(
          nominal,
          purchaseDate.toISOString(),
          payDate,
          synthetic
        );
        const usd = currency === "USD"
          ? nominal // already in USD
          : economicService.calculateUSDValue(nominal, payDate, synthetic, true);
        totalNominal += nominal;
        totalReal += real;
        totalUSD += usd;
        rows.push({ i: i + 1, month: ym, paymentDate: payDate, nominal, real, usd });
      }
      // Compare versus paying cash today at purchase date
      const diff = cashPrice - totalReal; // positive => installments cheaper in real terms
      const savingsPct = (diff / cashPrice) * 100;
      const recommendation = savingsPct > 1 ? "installments" : "cash"; // 1% threshold
      setAnalysisRows(rows);
      setSummary({ cashPrice, financedNominal: totalNominal, financedReal: totalReal, totalUSD, recommendation, savingsPct });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BarChart3 className="w-5 h-5" />
          Pago en cuotas vs Contado: simulador y recomendación
        </CardTitle>
        <CardDescription>
          Compará el precio al contado contra el precio financiado en cuotas con tus supuestos de inflación y devaluación.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Precio al contado</Label>
            <Input type="number" min="0" step="0.01" value={cashPrice || ""} onChange={(e) => setCashPrice(Number(e.target.value))} />
          </div>
          <div className="space-y-2">
            <Label>Moneda</Label>
            <Select value={currency} onValueChange={(v) => setCurrency(v as Currency)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ARS">ARS</SelectItem>
                <SelectItem value="USD">USD</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Precio total financiado (suma de cuotas)</Label>
            <Input type="number" min="0" step="0.01" value={financedTotal || ""} onChange={(e) => setFinancedTotal(Number(e.target.value))} />
            <p className="text-xs text-muted-foreground">Se divide por la cantidad de cuotas para estimar cada pago.</p>
          </div>
          <div className="space-y-2">
            <Label>Cantidad de cuotas</Label>
            <Select value={String(installments)} onValueChange={(v) => setInstallments(Number(v))}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Array.from({ length: 60 }, (_, i) => i + 1).map((n) => (
                  <SelectItem key={n} value={String(n)}>
                    {n}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Fecha de compra</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className={cn("w-full justify-start text-left font-normal", !purchaseDate && "text-muted-foreground")}> 
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {purchaseDate ? format(purchaseDate, "PPP", { locale: es }) : <span>Selecciona una fecha</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar mode="single" selected={purchaseDate} onSelect={(d) => d && setPurchaseDate(d)} initialFocus />
              </PopoverContent>
            </Popover>
            <p className="text-xs text-muted-foreground">Primera cuota estimada: {new Date(firstPaymentDateStr).toLocaleDateString("es-AR")}</p>
          </div>

          <div className="space-y-2">
            <Label>Inflación mensual estimada (%)</Label>
            <Input type="number" step="0.1" value={monthlyInflation} onChange={(e) => setMonthlyInflation(Number(e.target.value))} />
          </div>
          <div className="space-y-2">
            <Label>Devaluación mensual estimada (%)</Label>
            <Input type="number" step="0.1" value={monthlyDevaluation} onChange={(e) => setMonthlyDevaluation(Number(e.target.value))} />
          </div>
        </div>

        <div className="flex gap-3">
          <Button onClick={analyze} disabled={loading || cashPrice <= 0 || financedTotal <= 0 || installments <= 0} className="min-w-40">
            {loading ? "Calculando..." : "Analizar"}
          </Button>
        </div>

        {summary && (
          <div className="space-y-4">
            {summary.recommendation === "installments" && (
              <button
                type="button"
                onClick={() => {
                  if (onGoInvest) {
                    onGoInvest();
                  } else {
                    navigate('/finance/decisions#invest');
                  }
                }}
                className="w-full text-left p-4 rounded-md border bg-amber-50 border-amber-200 hover:bg-amber-100 transition flex items-start gap-3"
              >
                <Lightbulb className="w-5 h-5 text-amber-600 mt-0.5" />
                <div>
                  <p className="font-medium">Tip: invertí el efectivo mientras pagás en cuotas</p>
                  <p className="text-sm text-amber-800">
                    Para que realmente convenga pagar en cuotas, es clave que el dinero quede invertido generando rendimientos. Tocá aquí para ver ideas de inversión.
                  </p>
                </div>
              </button>
            )}
            <div className={cn("p-4 rounded-md border", summary.recommendation === "installments" ? "bg-green-50 border-green-200" : "bg-orange-50 border-orange-200") }>
              <div className="flex items-start gap-2">
                {summary.recommendation === "installments" ? (
                  <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5" />
                ) : (
                  <CircleAlert className="w-5 h-5 text-orange-600 mt-0.5" />
                )}
                <div>
                  <p className="font-medium">
                    Recomendación: {summary.recommendation === "installments" ? "Pagar en cuotas" : "Pagar al contado"}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Ahorro real estimado: {summary.savingsPct.toFixed(2)}% {summary.recommendation === "installments" ? "a favor de pagar en cuotas" : "a favor de pagar al contado"}
                  </p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardHeader className="pb-2"><CardTitle className="text-base">Precio al contado</CardTitle></CardHeader>
                <CardContent className="pt-0 text-2xl font-semibold">{formatCurrency(summary.cashPrice, currency)}</CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2"><CardTitle className="text-base">Cuotas: nominal total</CardTitle></CardHeader>
                <CardContent className="pt-0 text-2xl font-semibold">{formatCurrency(summary.financedNominal, currency)}</CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2"><CardTitle className="text-base">Cuotas: costo real (ajustado)</CardTitle></CardHeader>
                <CardContent className="pt-0 text-2xl font-semibold">{formatCurrency(summary.financedReal, currency)}</CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2"><CardTitle className="text-base flex items-center gap-2"><ArrowLeftRight className="w-4 h-4" />Diferencia real</CardTitle></CardHeader>
                <CardContent className="pt-0 text-2xl font-semibold">{formatCurrency(summary.cashPrice - summary.financedReal, currency)}</CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader className="pb-2"><CardTitle className="text-base">Equivalente USD (sumatoria de cuotas)</CardTitle></CardHeader>
              <CardContent className="pt-0 text-xl font-semibold">{new Intl.NumberFormat("es-AR", { style: "currency", currency: "USD"}).format(summary.totalUSD)}</CardContent>
            </Card>

            {analysisRows && (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left text-muted-foreground">
                      <th className="py-2 pr-4">#</th>
                      <th className="py-2 pr-4">Mes</th>
                      <th className="py-2 pr-4">Fecha pago</th>
                      <th className="py-2 pr-4">Nominal</th>
                      <th className="py-2 pr-4">Real ajustado</th>
                      <th className="py-2 pr-0">USD</th>
                    </tr>
                  </thead>
                  <tbody>
                    {analysisRows.map((r) => (
                      <tr key={r.i} className="border-t">
                        <td className="py-2 pr-4">{r.i}</td>
                        <td className="py-2 pr-4">{r.month}</td>
                        <td className="py-2 pr-4">{new Date(r.paymentDate).toLocaleDateString("es-AR")}</td>
                        <td className="py-2 pr-4">{formatCurrency(r.nominal, currency)}</td>
                        <td className="py-2 pr-4">{formatCurrency(r.real, currency)}</td>
                        <td className="py-2 pr-0">{new Intl.NumberFormat("es-AR", { style: "currency", currency: "USD"}).format(r.usd)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
