import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useExpenses } from "@/hooks/useExpenses";
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { TrendingUp, PieChart as PieChartIcon, BarChart3 } from 'lucide-react';
import { formatCurrency } from "@/lib/formatNumber";
import { Layout } from "@/components/Layout";

const Analytics = () => {
  const { expenses, isLoading } = useExpenses();
  const [categoryData, setCategoryData] = useState([]);
  const [monthlyData, setMonthlyData] = useState([]);
  const [optimizationData, setOptimizationData] = useState([]);

  useEffect(() => {
    if (expenses.length > 0) {
      // Datos por categoría
      const categoryTotals = {};
      expenses.forEach(expense => {
        const categoryName = expense.category?.name || 'Sin categoría';
        const categoryIcon = expense.category?.icon || '💰';
        const key = `${categoryIcon} ${categoryName}`;
        
        if (!categoryTotals[key]) {
          categoryTotals[key] = 0;
        }
        categoryTotals[key] += expense.amount || 0;
      });

      const categoryArray = Object.entries(categoryTotals).map(([name, value]) => ({
        name,
        value,
        percentage: ((value / Math.max(expenses.reduce((sum, exp) => sum + (exp.amount || 0), 0), 1)) * 100).toFixed(1)
      }));
      setCategoryData(categoryArray);

      // Datos mensuales
      const monthlyTotals = {};
      expenses.forEach(expense => {
        const date = new Date(expense.created_at);
        const monthKey = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}`;
        
        if (!monthlyTotals[monthKey]) {
          monthlyTotals[monthKey] = 0;
        }
        monthlyTotals[monthKey] += expense.amount || 0;
      });

      const monthlyArray = Object.entries(monthlyTotals)
        .sort(([a], [b]) => a.localeCompare(b))
        .slice(-6) // Últimos 6 meses
        .map(([month, amount]) => ({
          month: new Date(month + '-01').toLocaleDateString('es-ES', { month: 'short', year: 'numeric' }),
          amount
        }));
      setMonthlyData(monthlyArray);

      // Datos de optimización
      const optimizationTotals = {
        'Alto potencial (8-10)': 0,
        'Medio potencial (5-7)': 0,
        'Bien optimizado (0-4)': 0
      };

      expenses.forEach(expense => {
        const potential = expense.optimization_potential || 0;
        if (potential >= 8) {
          optimizationTotals['Alto potencial (8-10)'] += expense.amount || 0;
        } else if (potential >= 5) {
          optimizationTotals['Medio potencial (5-7)'] += expense.amount || 0;
        } else {
          optimizationTotals['Bien optimizado (0-4)'] += expense.amount || 0;
        }
      });

      const optimizationArray = Object.entries(optimizationTotals).map(([name, value]) => ({
        name,
        value,
        percentage: ((value / Math.max(expenses.reduce((sum, exp) => sum + (exp.amount || 0), 0), 1)) * 100).toFixed(1)
      }));
      setOptimizationData(optimizationArray);
    }
  }, [expenses]);

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D'];

  if (isLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Cargando analíticas...</p>
          </div>
        </div>
      </Layout>
    );
  }

  if (expenses.length === 0) {
    return (
      <Layout>
        <div className="space-y-6">
          <div className="flex items-center gap-3">
            <TrendingUp className="w-8 h-8 text-primary" />
            <div>
              <h1 className="text-3xl font-bold">Analíticas</h1>
              <p className="text-muted-foreground">
                Análisis inteligente de tus gastos y patrones financieros
              </p>
            </div>
          </div>

          <Card>
            <CardContent className="flex flex-col items-center justify-center py-16">
              <BarChart3 className="w-16 h-16 text-muted-foreground/50 mb-4" />
              <h3 className="text-xl font-semibold mb-2">No hay datos para analizar</h3>
              <p className="text-muted-foreground text-center mb-4">
                Registra algunos gastos para ver analíticas detalladas de tus patrones financieros
              </p>
            </CardContent>
          </Card>
        </div>
      </Layout>
    );
  }

  const totalExpenses = expenses.reduce((sum, expense) => sum + (expense.amount || 0), 0);
  const averageExpense = totalExpenses / expenses.length;
  const highOptimizationCount = expenses.filter(exp => (exp.optimization_potential || 0) >= 8).length;

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <TrendingUp className="w-8 h-8 text-primary" />
          <div>
            <h1 className="text-3xl font-bold">Analíticas</h1>
            <p className="text-muted-foreground">
              Análisis inteligente de tus gastos y patrones financieros
            </p>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total de Gastos</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(totalExpenses, 'ARS')}</div>
              <p className="text-xs text-muted-foreground">
                {expenses.length} gastos registrados
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Promedio por Gasto</CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(averageExpense, 'ARS')}</div>
              <p className="text-xs text-muted-foreground">
                Gasto promedio
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Oportunidades de Ahorro</CardTitle>
              <PieChartIcon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{highOptimizationCount}</div>
              <p className="text-xs text-muted-foreground">
                Gastos con alto potencial de optimización
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {/* Gráfico por Categorías */}
          <Card>
            <CardHeader>
              <CardTitle>Gastos por Categoría</CardTitle>
              <CardDescription>
                Distribución de tus gastos por categorías inteligentes
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={categoryData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percentage }) => `${name}: ${percentage}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {categoryData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => formatCurrency(value, 'ARS')} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Gráfico de Tendencia Mensual */}
          <Card>
            <CardHeader>
              <CardTitle>Tendencia Mensual</CardTitle>
              <CardDescription>
                Evolución de tus gastos en los últimos meses
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={monthlyData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip formatter={(value) => formatCurrency(value, 'ARS')} />
                    <Legend />
                    <Bar dataKey="amount" fill="#8884d8" name="Gastos" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Análisis de Optimización */}
        <Card>
          <CardHeader>
            <CardTitle>Análisis de Optimización</CardTitle>
            <CardDescription>
              Potencial de ahorro basado en IA
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={optimizationData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percentage }) => `${percentage}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      <Cell fill="#FF8042" />
                      <Cell fill="#FFBB28" />
                      <Cell fill="#00C49F" />
                    </Pie>
                    <Tooltip formatter={(value) => formatCurrency(value, 'ARS')} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              
              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold mb-3">Insights de Optimización</h4>
                  <div className="space-y-3">
                    {optimizationData.map((item, index) => (
                      <div key={item.name} className="flex items-center justify-between p-3 rounded-lg border">
                        <div className="flex items-center gap-3">
                          <div 
                            className="w-4 h-4 rounded-full"
                            style={{ backgroundColor: ['#FF8042', '#FFBB28', '#00C49F'][index] }}
                          />
                          <span className="text-sm font-medium">{item.name}</span>
                        </div>
                        <Badge variant="outline">
                          {formatCurrency(item.value, 'ARS')}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default Analytics;