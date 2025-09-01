import { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useSubscriptions } from "@/hooks/useSubscriptions";
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { TrendingUp, PieChart as PieChartIcon, BarChart3, Filter } from 'lucide-react';
import { useUserProfile } from "@/hooks/useUserProfile";
import { useCurrencyExchange } from "@/hooks/useCurrencyExchange";

const Analytics = () => {
  const { subscriptions, loading } = useSubscriptions();
  const { profile } = useUserProfile();
  const { convertCurrency, formatCurrency, loading: ratesLoading } = useCurrencyExchange();
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  // Get unique categories
  const categories = useMemo(() => {
    const uniqueCategories = [...new Set(subscriptions.map(sub => sub.category).filter(Boolean))];
    return uniqueCategories;
  }, [subscriptions]);

  // Filter subscriptions by category
  const filteredSubscriptions = useMemo(() => {
    if (selectedCategory === 'all') return subscriptions;
    return subscriptions.filter(sub => sub.category === selectedCategory);
  }, [subscriptions, selectedCategory]);

  // Prepare data for pie chart (spending by category) - converted to user's currency
  const pieChartData = useMemo(() => {
    if (!profile?.primary_display_currency) return [];
    
    const categoryTotals: Record<string, number> = {};
    const userCurrency = profile.primary_display_currency;
    
    filteredSubscriptions.forEach(sub => {
      const category = sub.category || 'Sin categoría';
      const cost = sub.cost || 0;
      const sourceCurrency = sub.currency || 'USD';
      
      // Convert to monthly cost
      let monthlyAmount = 0;
      switch (sub.billing_cycle) {
        case 'Monthly':
          monthlyAmount = cost;
          break;
        case 'Quarterly':
          monthlyAmount = cost / 3;
          break;
        case 'Semi-Annually':
          monthlyAmount = cost / 6;
          break;
        case 'Annually':
          monthlyAmount = cost / 12;
          break;
        default:
          monthlyAmount = cost;
      }
      
      // Convert to user's preferred currency
      const convertedAmount = convertCurrency(monthlyAmount, sourceCurrency, userCurrency);
      categoryTotals[category] = (categoryTotals[category] || 0) + convertedAmount;
    });

    return Object.entries(categoryTotals).map(([category, value]) => ({
      name: category,
      value: parseFloat(value.toFixed(2)),
      count: filteredSubscriptions.filter(sub => (sub.category || 'Sin categoría') === category).length
    }));
  }, [filteredSubscriptions, convertCurrency, profile?.primary_display_currency]);

  // Prepare data for stacked bar chart (spending by billing cycle and category)
  const barChartData = useMemo(() => {
    const billingCycles = ['Monthly', 'Quarterly', 'Semi-Annually', 'Annually'];
    const categoryColors: Record<string, string> = {};
    
    // Assign colors to categories
    categories.forEach((cat, index) => {
      const colors = ['#8884d8', '#82ca9d', '#ffc658', '#ff7300', '#8dd1e1', '#d084d0'];
      categoryColors[cat] = colors[index % colors.length];
    });

    return billingCycles.map(cycle => {
      const cycleData: any = { cycle };
      let hasData = false;

      categories.forEach(category => {
        const categorySubscriptions = filteredSubscriptions.filter(
          sub => sub.billing_cycle === cycle && sub.category === category
        );
        
        const total = categorySubscriptions.reduce((sum, sub) => {
          let monthlyAmount = 0;
          const cost = sub.cost || 0;
          
          switch (cycle) {
            case 'Monthly':
              monthlyAmount = cost;
              break;
            case 'Quarterly':
              monthlyAmount = cost / 3;
              break;
            case 'Semi-Annually':
              monthlyAmount = cost / 6;
              break;
            case 'Annually':
              monthlyAmount = cost / 12;
              break;
          }
          
          return sum + monthlyAmount;
        }, 0);

        if (total > 0) hasData = true;
        cycleData[category] = parseFloat(total.toFixed(2));
      });

      return hasData ? cycleData : null;
    }).filter(Boolean);
  }, [filteredSubscriptions, categories]);

  // Colors for pie chart
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D'];

  // Calculate total spending (monthly equivalent) - converted to user's currency
  const totalSpending = useMemo(() => {
    if (!profile?.primary_display_currency) return 0;
    
    const userCurrency = profile.primary_display_currency;
    
    return filteredSubscriptions.reduce((total, sub) => {
      const cost = sub.cost || 0;
      const sourceCurrency = sub.currency || 'USD';
      
      let monthlyAmount = 0;
      switch (sub.billing_cycle) {
        case 'Monthly':
          monthlyAmount = cost;
          break;
        case 'Quarterly':
          monthlyAmount = cost / 3;
          break;
        case 'Semi-Annually':
          monthlyAmount = cost / 6;
          break;
        case 'Annually':
          monthlyAmount = cost / 12;
          break;
        default:
          monthlyAmount = cost;
      }
      
      // Convert to user's preferred currency
      const convertedAmount = convertCurrency(monthlyAmount, sourceCurrency, userCurrency);
      return total + convertedAmount;
    }, 0);
  }, [filteredSubscriptions, convertCurrency, profile?.primary_display_currency]);

  if (loading || ratesLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Análisis</h1>
          <p className="text-muted-foreground">
            Analiza tus gastos por categoría y ciclo de facturación
          </p>
        </div>
      </div>

      {/* Filter Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filtros
          </CardTitle>
          <CardDescription>
            Filtra los datos por categoría para análisis específicos
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-4 items-center">
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium">Categoría:</label>
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Seleccionar categoría" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas las categorías</SelectItem>
                {categories.map(category => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline">
              {filteredSubscriptions.length} suscripciones
            </Badge>
            <Badge variant="outline">
              {formatCurrency(totalSpending, profile?.primary_display_currency || 'USD')} gasto mensual
            </Badge>
          </div>
        </CardContent>
      </Card>

      {subscriptions.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <TrendingUp className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-xl font-semibold mb-2">No hay datos para analizar</h3>
            <p className="text-muted-foreground">
              Agrega algunas suscripciones para ver análisis detallados de tus gastos.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Pie Chart - Spending by Category */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <PieChartIcon className="h-5 w-5" />
                Gastos por Categoría
              </CardTitle>
              <CardDescription>
                Distribución del gasto mensual por categoría
              </CardDescription>
            </CardHeader>
            <CardContent>
              {pieChartData.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={pieChartData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {pieChartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value: any) => [`$${value}`, 'Gasto mensual']} />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                  No hay datos para mostrar
                </div>
              )}
            </CardContent>
          </Card>

          {/* Bar Chart - Spending by Billing Cycle and Category */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Gastos por Ciclo de Facturación
              </CardTitle>
              <CardDescription>
                Comparación de gastos mensuales por ciclo y categoría
              </CardDescription>
            </CardHeader>
            <CardContent>
              {barChartData.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={barChartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="cycle" />
                    <YAxis />
                    <Tooltip formatter={(value: any) => [`$${value}`, 'Gasto mensual']} />
                    <Legend />
                    {categories.map((category, index) => (
                      <Bar
                        key={category}
                        dataKey={category}
                        stackId="a"
                        fill={COLORS[index % COLORS.length]}
                      />
                    ))}
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                  No hay datos para mostrar
                </div>
              )}
            </CardContent>
          </Card>

          {/* Summary Cards */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Resumen por Categorías</CardTitle>
              <CardDescription>
                Detalle del gasto mensual por cada categoría
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {pieChartData.map((item, index) => (
                  <div
                    key={item.name}
                    className="flex items-center justify-between p-4 border rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className="w-4 h-4 rounded-full"
                        style={{ backgroundColor: COLORS[index % COLORS.length] }}
                      />
                      <div>
                        <p className="font-medium">{item.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {item.count} suscripciones
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">${item.value}</p>
                      <p className="text-xs text-muted-foreground">por mes</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default Analytics;