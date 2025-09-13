import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  TrendingDown, 
  TrendingUp, 
  DollarSign, 
  Calculator, 
  BarChart3,
  ArrowUpDown,
  Target,
  PiggyBank
} from "lucide-react";
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  BarChart,
  Bar,
  Area,
  AreaChart,
  PieChart,
  Pie,
  Cell
} from "recharts";
import { economicService, EconomicIndicator } from "@/lib/economicService";
import { InstallmentData } from "@/hooks/useInstallments";

interface EconomicAnalysisProps {
  installment: InstallmentData;
  indicators: EconomicIndicator[];
}

interface ChartDataPoint {
  month: string;
  nominal: number;
  real: number;
  usdValue: number;
  liquefaction: number;
  status: 'paid' | 'pending';
}

interface AnalysisMetrics {
  totalLiquefactionSoFar: number;
  projectedLiquefaction: number;
  totalPaidReal: number;
  totalPaidNominal: number;
  totalProjectedReal: number;
  totalProjectedNominal: number;
  averageLiquefaction: number;
}

interface EconomicAnalysisData {
  analysis: {
    installment: InstallmentData;
    totalPaidNominal: number;
    totalPaidReal: number;
    totalProjectedNominal: number;
    totalProjectedReal: number;
    totalLiquefaction: number;
    averageLiquefaction: number;
  };
  chartData: ChartDataPoint[];
  historicalData: ChartDataPoint[];
  futureProjections: ChartDataPoint[];
  metrics: AnalysisMetrics;
}

interface AnalysisData {
  analysis: EconomicAnalysisData['analysis'];
  chartData: ChartDataPoint[];
  historicalData: ChartDataPoint[];
  futureProjections: ChartDataPoint[];
  metrics: AnalysisMetrics;
}

export const EconomicAnalysisComponent = ({ installment, indicators }: EconomicAnalysisProps) => {
  const [analysisData, setAnalysisData] = useState<AnalysisData | null>(null);
  const [selectedView, setSelectedView] = useState<'overview' | 'inflation' | 'usd' | 'projections'>('overview');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!installment || !indicators.length) return;

    const generateAnalysis = () => {
      setIsLoading(true);
      
      // Calculate comprehensive analysis
      const firstPaymentDate = installment.next_due_date;
      const analysis = economicService.analyzeInstallmentPlan(
        Number(installment.total_amount),
        Number(installment.installment_amount),
        installment.total_installments,
        installment.purchase_date,
        firstPaymentDate,
        indicators
      );

      // Generate historical data for completed payments
      const historicalData = [];
      for (let i = 0; i < installment.paid_installments; i++) {
        const paymentDate = economicService.addMonths(firstPaymentDate, i);
        const period = economicService.dateToYearMonth(paymentDate);
        
        const realValue = economicService.calculateRealValue(
          Number(installment.installment_amount),
          installment.purchase_date,
          paymentDate,
          indicators
        );
        
        const usdValue = economicService.calculateUSDValue(
          Number(installment.installment_amount),
          paymentDate,
          indicators
        );
        
        const liquefaction = economicService.calculateLiquefaction(
          Number(installment.installment_amount),
          installment.purchase_date,
          paymentDate,
          indicators
        );

        historicalData.push({
          period,
          nominal: Number(installment.installment_amount),
          real: realValue,
          usd: usdValue,
          liquefaction,
          status: 'paid'
        });
      }

      // Generate future projections
      const remainingInstallments = installment.total_installments - installment.paid_installments;
      const futureProjections = economicService.projectFuturePayments(
        remainingInstallments,
        Number(installment.installment_amount),
        firstPaymentDate
      );

      // Combine historical and future data
      const chartData = [
        ...historicalData,
        ...futureProjections.map((proj, index) => ({
          period: proj.month,
          nominal: proj.nominal,
          real: proj.projected_real,
          usd: proj.nominal / 1250, // Approximate current USD rate
          liquefaction: proj.liquefaction,
          status: 'future'
        }))
      ];

      // Calculate summary metrics
      const totalPaidReal = historicalData.reduce((sum, item) => sum + item.real, 0);
      const totalPaidNominal = historicalData.reduce((sum, item) => sum + item.nominal, 0);
      const totalLiquefactionSoFar = totalPaidReal > 0 ? ((totalPaidReal - totalPaidNominal) / totalPaidNominal) * 100 : 0;
      
      const totalProjectedReal = futureProjections.reduce((sum, item) => sum + item.projected_real, 0);
      const totalProjectedNominal = futureProjections.reduce((sum, item) => sum + item.nominal, 0);
      const projectedLiquefaction = totalProjectedNominal > 0 ? ((totalProjectedReal - totalProjectedNominal) / totalProjectedNominal) * 100 : 0;

      setAnalysisData({
        analysis: {
          installment,
          totalPaidNominal: analysis.totalLiquefaction || 0,
          totalPaidReal: analysis.projectedSavings || 0,
          totalProjectedNominal: analysis.totalLiquefaction || 0,
          totalProjectedReal: analysis.projectedSavings || 0,
          totalLiquefaction: analysis.totalLiquefaction,
          averageLiquefaction: analysis.averageInflationImpact
        },
        chartData: chartData.map(point => ({
          ...point,
          real: point.projected_real || point.real || 0,
          usdValue: point.usd_value || 0,
          status: point.status || 'pending' as const
        })),
        historicalData,
        futureProjections: futureProjections.map(point => ({
          ...point,
          real: point.projected_real || 0,
          usdValue: 0,
          status: 'pending' as const
        })),
        metrics: {
          totalLiquefactionSoFar,
          projectedLiquefaction,
          totalPaidReal,
          totalPaidNominal,
          totalProjectedReal,
          totalProjectedNominal,
          averageLiquefaction: (totalLiquefactionSoFar + projectedLiquefaction) / 2
        }
      });
      
      setIsLoading(false);
    };

    generateAnalysis();
  }, [installment, indicators]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatUSD = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatPercentage = (value: number) => {
    const isPositive = value > 0;
    return (
      <span className={`flex items-center gap-1 ${isPositive ? 'text-red-600' : 'text-green-600'}`}>
        {isPositive ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
        {Math.abs(value).toFixed(2)}%
      </span>
    );
  };

  if (isLoading || !analysisData) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-32 bg-gray-200 rounded"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const { chartData, metrics } = analysisData;

  return (
    <div className="space-y-6">
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Licuación Total</p>
                <p className="text-xl font-bold">
                  {formatPercentage(metrics.averageLiquefaction)}
                </p>
              </div>
              <Calculator className="w-8 h-8 text-blue-500" />
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Promedio histórico + proyectado
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Pagado (Real)</p>
                <p className="text-xl font-bold">{formatCurrency(metrics.totalPaidReal)}</p>
              </div>
              <PiggyBank className="w-8 h-8 text-green-500" />
            </div>
            <p className="text-xs text-gray-500 mt-1">
              vs {formatCurrency(metrics.totalPaidNominal)} nominal
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Proyección Restante</p>
                <p className="text-xl font-bold">{formatCurrency(metrics.totalProjectedReal)}</p>
              </div>
              <Target className="w-8 h-8 text-orange-500" />
            </div>
            <p className="text-xs text-gray-500 mt-1">
              vs {formatCurrency(metrics.totalProjectedNominal)} nominal
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Estrategia</p>
                <Badge variant={metrics.averageLiquefaction > 5 ? "destructive" : "default"}>
                  {metrics.averageLiquefaction > 5 ? "ALARGAR" : "PAGAR YA"}
                </Badge>
              </div>
              <ArrowUpDown className="w-8 h-8 text-purple-500" />
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Recomendación económica
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Analysis Tabs */}
      <Tabs value={selectedView} onValueChange={(value: string) => setSelectedView(value as 'overview' | 'inflation' | 'usd' | 'projections')}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Resumen</TabsTrigger>
          <TabsTrigger value="inflation">Inflación</TabsTrigger>
          <TabsTrigger value="usd">USD</TabsTrigger>
          <TabsTrigger value="projections">Proyecciones</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Evolución Valor Real vs Nominal</CardTitle>
              <CardDescription>
                Comparación entre el valor nominal de las cuotas y su valor real ajustado por inflación
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="period" />
                  <YAxis tickFormatter={(value) => `$${(value/1000).toFixed(0)}k`} />
                  <Tooltip 
                    formatter={(value: number, name: string) => [
                      formatCurrency(value), 
                      name === 'nominal' ? 'Nominal' : 'Real'
                    ]}
                  />
                  <Area
                    type="monotone"
                    dataKey="nominal"
                    stackId="1"
                    stroke="#3b82f6"
                    fill="#3b82f6"
                    fillOpacity={0.6}
                  />
                  <Area
                    type="monotone"
                    dataKey="real"
                    stackId="2"
                    stroke="#ef4444"
                    fill="#ef4444"
                    fillOpacity={0.6}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="inflation" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Impacto de la Inflación</CardTitle>
              <CardDescription>
                Porcentaje de licuación por período
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="period" />
                  <YAxis tickFormatter={(value) => `${value}%`} />
                  <Tooltip 
                    formatter={(value: number) => [`${value.toFixed(2)}%`, 'Licuación']}
                  />
                  <Bar dataKey="liquefaction" fill="#f59e0b" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="usd" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Valor en USD Histórico</CardTitle>
              <CardDescription>
                Evolución del valor de las cuotas en dólares
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="period" />
                  <YAxis tickFormatter={(value) => `$${value.toFixed(0)}`} />
                  <Tooltip 
                    formatter={(value: number) => [formatUSD(value), 'USD']}
                  />
                  <Line
                    type="monotone"
                    dataKey="usd"
                    stroke="#10b981"
                    strokeWidth={3}
                    dot={{ fill: '#10b981', strokeWidth: 2, r: 4 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="projections" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Proyecciones Futuras</CardTitle>
              <CardDescription>
                Estimación del impacto inflacionario en cuotas restantes
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-blue-50 rounded-lg">
                    <h4 className="font-semibold text-blue-900">Escenario Optimista</h4>
                    <p className="text-sm text-blue-700">Inflación mensual: 1.5%</p>
                    <p className="text-2xl font-bold text-blue-900">
                      +{((metrics.totalProjectedReal * 0.85 - metrics.totalProjectedNominal) / metrics.totalProjectedNominal * 100).toFixed(1)}%
                    </p>
                  </div>
                  <div className="p-4 bg-red-50 rounded-lg">
                    <h4 className="font-semibold text-red-900">Escenario Pesimista</h4>
                    <p className="text-sm text-red-700">Inflación mensual: 3.5%</p>
                    <p className="text-2xl font-bold text-red-900">
                      +{((metrics.totalProjectedReal * 1.15 - metrics.totalProjectedNominal) / metrics.totalProjectedNominal * 100).toFixed(1)}%
                    </p>
                  </div>
                </div>
                
                <div className="mt-6 p-4 bg-gradient-to-r from-green-50 to-blue-50 rounded-lg border">
                  <h4 className="font-semibold text-gray-900 mb-2">💡 Recomendación del Economista:</h4>
                  {metrics.averageLiquefaction > 5 ? (
                    <p className="text-sm text-gray-700">
                      <strong>ESTRATEGIA: Alargar pagos.</strong> La alta inflación está licuando significativamente 
                      tus cuotas. Cada mes que pases, el valor real disminuye. Aprovecha esta situación y 
                      paga las cuotas lo más tarde posible dentro de los términos acordados.
                    </p>
                  ) : (
                    <p className="text-sm text-gray-700">
                      <strong>ESTRATEGIA: Pagar anticipadamente.</strong> La baja inflación no está 
                      generando suficiente licuación. Te conviene pagar antes para evitar intereses 
                      y liberar capital para otras inversiones.
                    </p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};