import { useState, useMemo, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useUserProfile } from "@/hooks/useUserProfile";
import { useCurrencyExchange } from "@/hooks/useCurrencyExchange";
import { useAuth } from "@/hooks/useAuth";
import { useFireScenarios } from "@/hooks/useFireScenarios";
import type { Database } from "@/integrations/supabase/types";

type Scenario = {
  id: string;
  name: string;
  monthlyExpenses: number;
  withdrawalRate: number; // e.g. 0.04
  currentPortfolio: number;
  monthlySavings: number;
  realAnnualReturn: number; // e.g. 0.05
  createdAt: string;
};

const storageKey = (userId?: string) => `fire_scenarios_${userId || 'anon'}`;

export default function FIRECalculator() {
  const { user } = useAuth();
  const { profile } = useUserProfile();
  const { formatCurrency: fmt } = useCurrencyExchange();
  const currency = profile?.primary_display_currency || 'USD';
  const { items, createOne, deleteOne } = useFireScenarios();

  const [monthlyExpenses, setMonthlyExpenses] = useState<number>(200000);
  const [withdrawalRate, setWithdrawalRate] = useState<number>(0.04);
  const [currentPortfolio, setCurrentPortfolio] = useState<number>(0);
  const [monthlySavings, setMonthlySavings] = useState<number>(0);
  const [realAnnualReturn, setRealAnnualReturn] = useState<number>(0.05);
  const [scenarios, setScenarios] = useState<Scenario[]>([]); // local fallback
  const [scenarioName, setScenarioName] = useState<string>("");

  // Load scenarios
  useEffect(() => {
    try {
      const raw = localStorage.getItem(storageKey(user?.id));
      if (raw) setScenarios(JSON.parse(raw));
    } catch (e) {
      console.warn('No se pudieron cargar escenarios FIRE:', e);
    }
  }, [user?.id]);

  const saveScenarios = (next: Scenario[]) => {
    setScenarios(next);
    localStorage.setItem(storageKey(user?.id), JSON.stringify(next));
  };

  // Map DB rows to UI scenarios
  const dbScenarios: Scenario[] = useMemo(() => {
    return ((items || []) as Database['public']['Tables']['fire_scenarios']['Row'][]).map((r) => ({
      id: r.id,
      name: r.name,
      monthlyExpenses: Number(r.monthly_expenses ?? 0),
      withdrawalRate: Number(r.withdrawal_rate ?? 0),
      currentPortfolio: Number(r.current_portfolio ?? 0),
      monthlySavings: Number(r.monthly_savings ?? 0),
      realAnnualReturn: Number(r.real_annual_return ?? 0),
      createdAt: r.created_at,
    }));
  }, [items]);

  const displayScenarios = dbScenarios.length > 0 ? dbScenarios : scenarios;

  const annualExpenses = useMemo(() => monthlyExpenses * 12, [monthlyExpenses]);
  const multiplier = useMemo(() => (withdrawalRate > 0 ? 1 / withdrawalRate : 25), [withdrawalRate]);
  const fireNumber = useMemo(() => annualExpenses * multiplier, [annualExpenses, multiplier]);
  const safeWithdrawal = useMemo(() => fireNumber * withdrawalRate, [fireNumber, withdrawalRate]);
  const progressPct = useMemo(() => (fireNumber > 0 ? Math.min(100, (currentPortfolio / fireNumber) * 100) : 0), [currentPortfolio, fireNumber]);

  // Estimated time to FIRE (months) using monthly compounding and contributions
  const estimateMonthsToFire = useMemo(() => {
    const target = fireNumber;
    const P = Math.max(0, currentPortfolio);
    const PMT = Math.max(0, monthlySavings);
    const annual = Math.max(-0.99, realAnnualReturn);
    const r = Math.pow(1 + annual, 1 / 12) - 1; // monthly real rate

    if (!isFinite(target) || target <= 0 || (P >= target)) return 0;

    if (Math.abs(r) < 1e-9) {
      if (PMT <= 0) return Infinity;
      return Math.ceil((target - P) / PMT);
    }

    const denom = P + PMT / r;
    if (denom <= 0) return Infinity;

    const ratio = (target + PMT / r) / denom;
    if (ratio <= 1) return 0;

    const n = Math.log(ratio) / Math.log(1 + r);
    if (!isFinite(n) || n < 0) return Infinity;
    return Math.ceil(n);
  }, [fireNumber, currentPortfolio, monthlySavings, realAnnualReturn]);

  const years = Math.floor((estimateMonthsToFire || 0) / 12);
  const months = Math.max(0, (estimateMonthsToFire || 0) - years * 12);

  const handleSave = async () => {
    const name = scenarioName.trim() || `Escenario ${new Date().toLocaleDateString()}`;
    // Prefer DB if authenticated; also keep a local backup
    if (user) {
      try {
        await createOne({
          name,
          monthly_expenses: monthlyExpenses,
          withdrawal_rate: withdrawalRate,
          current_portfolio: currentPortfolio,
          monthly_savings: monthlySavings,
          real_annual_return: realAnnualReturn,
        });
      } catch (e) {
        // ignore, local fallback still works
      }
    }
    const s: Scenario = {
      id: crypto.randomUUID(),
      name,
      monthlyExpenses,
      withdrawalRate,
      currentPortfolio,
      monthlySavings,
      realAnnualReturn,
      createdAt: new Date().toISOString(),
    };
    const next = [s, ...scenarios].slice(0, 20);
    saveScenarios(next);
    setScenarioName("");
  };

  const handleLoad = (s: Scenario) => {
    setMonthlyExpenses(s.monthlyExpenses);
    setWithdrawalRate(s.withdrawalRate);
    setCurrentPortfolio(s.currentPortfolio);
    setMonthlySavings(s.monthlySavings);
    setRealAnnualReturn(s.realAnnualReturn);
  };

  const handleDelete = async (id: string) => {
    // If deleting a DB scenario, call API
    const dbMatch = dbScenarios.find(s => s.id === id);
    if (dbMatch) {
      try { await deleteOne(id); } catch (e) { console.warn('No se pudo eliminar en DB', e); }
    }
    const next = scenarios.filter(s => s.id !== id);
    saveScenarios(next);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle>Calculadora FIRE</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm">Gastos mensuales</label>
              <Input type="number" value={monthlyExpenses} onChange={e => setMonthlyExpenses(Number(e.target.value || 0))} />
            </div>
            <div>
              <label className="text-sm">Gastos anuales</label>
              <Input type="number" value={annualExpenses} readOnly />
            </div>
            <div>
              <label className="text-sm">Tasa de retiro segura (%)</label>
              <Input type="number" step="0.1" value={withdrawalRate * 100} onChange={e => setWithdrawalRate(Number(e.target.value || 0) / 100)} />
            </div>
            <div>
              <label className="text-sm">Multiplicador (regla del 25)</label>
              <Input type="number" value={multiplier} readOnly />
            </div>
            <div>
              <label className="text-sm">Cartera actual</label>
              <Input type="number" value={currentPortfolio} onChange={e => setCurrentPortfolio(Number(e.target.value || 0))} />
            </div>
            <div>
              <label className="text-sm">Ahorro mensual</label>
              <Input type="number" value={monthlySavings} onChange={e => setMonthlySavings(Number(e.target.value || 0))} />
            </div>
            <div>
              <label className="text-sm">Rendimiento real anual (%)</label>
              <Input type="number" step="0.1" value={realAnnualReturn * 100} onChange={e => setRealAnnualReturn(Number(e.target.value || 0) / 100)} />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Número FIRE</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-xl font-semibold">{fmt(fireNumber, currency)}</div>
                <div className="text-xs text-muted-foreground">{multiplier.toFixed(2)} × gastos anuales</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Retiro anual (4%)</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-xl font-semibold">{fmt(safeWithdrawal, currency)}</div>
                <div className="text-xs text-muted-foreground">Aproximación teórica</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Progreso</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-xl font-semibold">{progressPct.toFixed(1)}%</div>
                <div className="text-xs text-muted-foreground">{fmt(currentPortfolio, currency)} / {fmt(fireNumber, currency)}</div>
              </CardContent>
            </Card>
          </div>

          <div className="mt-6 p-4 border rounded-md bg-muted/30">
            <div className="text-sm text-muted-foreground">Tiempo estimado hasta FIRE</div>
            <div className="text-2xl font-bold mt-1">
              {estimateMonthsToFire === Infinity ? 'No alcanzable con los parámetros actuales' : `${years} años ${months} meses`}
            </div>
            <div className="text-xs text-muted-foreground mt-1">Asume aportes mensuales constantes y rendimiento real constante.</div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Escenarios guardados</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex gap-2">
              <Input placeholder="Nombre del escenario" value={scenarioName} onChange={e => setScenarioName(e.target.value)} />
              <Button onClick={handleSave}>Guardar</Button>
            </div>
            {displayScenarios.length === 0 ? (
              <div className="text-sm text-muted-foreground">No hay escenarios guardados aún.</div>
            ) : (
              <ul className="space-y-2">
                {displayScenarios.map(s => (
                  <li key={s.id} className="flex items-center justify-between border rounded-md p-3">
                    <div>
                      <div className="font-medium">{s.name}</div>
                      <div className="text-xs text-muted-foreground">{new Date(s.createdAt).toLocaleString()} • Gastos: {fmt(s.monthlyExpenses * 12, currency)} • Tasa retiro: {(s.withdrawalRate*100).toFixed(1)}%</div>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" onClick={() => handleLoad(s)}>Cargar</Button>
                      <Button variant="destructive" onClick={() => handleDelete(s.id)}>Eliminar</Button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
