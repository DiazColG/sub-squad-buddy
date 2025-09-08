import React, { useState } from 'react';
import { Search, Filter, MoreVertical, Home, Calendar, DollarSign, Trash2, Edit } from 'lucide-react';
import { Layout } from '@/components/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { AddHousingServiceForm } from '@/components/AddHousingServiceForm';
import { useHousingServices } from '@/hooks/useHousingServices';
import { useUserProfile } from '@/hooks/useUserProfile';
import { useCurrencyExchange } from '@/hooks/useCurrencyExchange';
import { formatNumber, formatCurrency } from '@/lib/formatNumber';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

const HousingServices = () => {
  const { housingServices, loading, deleteHousingService } = useHousingServices();
  const { profile } = useUserProfile();
  const { convertCurrency } = useCurrencyExchange();
  const [searchTerm, setSearchTerm] = useState('');

  const getCategoryColor = (category: string) => {
    const colors: { [key: string]: string } = {
      utilities: 'bg-blue-500',
      rent: 'bg-purple-500',
      maintenance: 'bg-green-500',
      telecommunications: 'bg-orange-500',
      security: 'bg-red-500',
      taxes: 'bg-yellow-500',
      other: 'bg-gray-500'
    };
    return colors[category] || colors.other;
  };

  const getCategoryLabel = (category: string) => {
    const labels: { [key: string]: string } = {
      utilities: 'Servicios básicos',
      rent: 'Alquiler',
      maintenance: 'Expensas',
      telecommunications: 'Telecom/Internet',
      security: 'Seguridad',
      taxes: 'ABL/Impuestos',
      other: 'Otros'
    };
    return labels[category] || 'Otros';
  };

  const getBillingCycleColor = (cycle: string) => {
    const colors: { [key: string]: string } = {
      monthly: 'bg-emerald-100 text-emerald-800',
      bimonthly: 'bg-blue-100 text-blue-800',
      quarterly: 'bg-purple-100 text-purple-800',
      annual: 'bg-orange-100 text-orange-800'
    };
    return colors[cycle] || colors.monthly;
  };

  const getBillingCycleLabel = (cycle: string) => {
    const labels: { [key: string]: string } = {
      monthly: 'Mensual',
      bimonthly: 'Bimestral',
      quarterly: 'Trimestral',
      annual: 'Anual'
    };
    return labels[cycle] || 'Mensual';
  };

  const handleDeleteService = async (id: string) => {
    if (window.confirm('¿Estás seguro de que deseas eliminar este servicio?')) {
      await deleteHousingService(id);
    }
  };

  const filteredServices = housingServices.filter(service =>
    service.service_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalMonthlyCost = housingServices.reduce((total, service) => {
    const cost = convertCurrency(
      service.cost, 
      service.currency, 
      profile?.primary_display_currency || 'USD'
    );
    
    let monthlyCost = cost;
    switch (service.billing_cycle) {
      case 'annual': 
        monthlyCost = cost / 12;
        break;
      case 'quarterly': 
        monthlyCost = cost / 3;
        break;
      case 'bimonthly': 
        monthlyCost = cost / 2;
        break;
      default: 
        monthlyCost = cost;
    }
    
    return total + monthlyCost;
  }, 0);

  return (
    <Layout>
      <div className="container mx-auto space-y-8">
        {/* Header Section - Optimized spacing and alignment */}
        <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4">
          <div className="space-y-1">
            <h1 className="text-3xl font-bold tracking-tight">Servicios + Vivienda</h1>
            <p className="text-muted-foreground text-base">
              Gestiona tus servicios básicos, alquiler y gastos de vivienda
            </p>
          </div>
          <div className="flex-shrink-0">
            <AddHousingServiceForm onServiceAdded={() => {}} />
          </div>
        </div>

        {/* Stats Cards - Better responsive grid */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <Card className="border-l-4 border-l-primary">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Servicios</CardTitle>
              <Home className="h-5 w-5 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-primary">{housingServices.length}</div>
              <p className="text-xs text-muted-foreground mt-1">servicios activos</p>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-green-500">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Gasto Mensual</CardTitle>
              <DollarSign className="h-5 w-5 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-600">
                {formatCurrency(totalMonthlyCost, profile?.primary_display_currency || 'USD')}
              </div>
              <p className="text-xs text-muted-foreground mt-1">aproximado por mes</p>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-orange-500 sm:col-span-2 lg:col-span-1">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Próximos Vencimientos</CardTitle>
              <Calendar className="h-5 w-5 text-orange-600" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-orange-600">
                {housingServices.filter(service => 
                  service.next_due_date && new Date(service.next_due_date) <= new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
                ).length}
              </div>
              <p className="text-xs text-muted-foreground mt-1">en los próximos 7 días</p>
            </CardContent>
          </Card>
        </div>

        {/* Search and Filter Section - Improved layout */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder="Buscar servicios..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 h-10"
            />
          </div>
          <Button variant="outline" size="default" className="px-4">
            <Filter className="w-4 h-4 mr-2" />
            Filtros
          </Button>
        </div>

        {loading ? (
          <div className="text-center py-8">
            <p className="text-muted-foreground">Cargando servicios...</p>
          </div>
        ) : filteredServices.length === 0 ? (
          <div className="text-center py-12">
            <Home className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No hay servicios configurados</h3>
            <p className="text-muted-foreground mb-4">
              {searchTerm ? 'No se encontraron servicios que coincidan con tu búsqueda.' : 'Comienza agregando tus servicios de vivienda para tener un mejor control de tus gastos.'}
            </p>
            {!searchTerm && <AddHousingServiceForm onServiceAdded={() => {}} />}
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
            {filteredServices.map((service) => {
              const displayCost = convertCurrency(
                service.cost,
                service.currency,
                profile?.primary_display_currency || 'USD'
              );

              return (
                <Card key={service.id} className="group relative hover:shadow-lg transition-all duration-200 border-0 shadow-sm hover:scale-[1.02]">
                  <CardHeader className="pb-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`w-4 h-4 rounded-full ${getCategoryColor(service.category)} ring-2 ring-background shadow-sm`} />
                        <div>
                          <CardTitle className="text-lg font-semibold group-hover:text-primary transition-colors">
                            {service.service_name}
                          </CardTitle>
                          <CardDescription className="text-sm mt-1">
                            {getCategoryLabel(service.category)}
                          </CardDescription>
                        </div>
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm" className="opacity-0 group-hover:opacity-100 transition-opacity">
                            <MoreVertical className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="bg-background border shadow-lg z-50">
                          <DropdownMenuItem>
                            <Edit className="w-4 h-4 mr-2" />
                            Editar
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            onClick={() => handleDeleteService(service.id)}
                            className="text-destructive"
                          >
                            <Trash2 className="w-4 h-4 mr-2" />
                            Eliminar
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="space-y-4">
                    {/* Price and Billing Cycle */}
                    <div className="flex items-center justify-between">
                      <div className="text-2xl font-bold text-primary">
                        {formatCurrency(displayCost, profile?.primary_display_currency || 'USD')}
                      </div>
                      <Badge variant="secondary" className={`${getBillingCycleColor(service.billing_cycle)} font-medium`}>
                        {getBillingCycleLabel(service.billing_cycle)}
                      </Badge>
                    </div>

                    {/* Due Date */}
                    {service.next_due_date && (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground bg-muted/30 rounded-lg px-3 py-2">
                        <Calendar className="w-4 h-4 text-primary" />
                        <span className="font-medium">
                          Vence: {format(new Date(service.next_due_date), 'dd MMM yyyy')}
                        </span>
                      </div>
                    )}

                    {/* Payment Method */}
                    {service.payment_method && (
                      <div className="text-sm text-muted-foreground bg-muted/20 rounded-lg px-3 py-2">
                        <span className="font-medium">
                          {service.bank_name && service.card_last_digits
                            ? `${service.bank_name} *${service.card_last_digits}`
                            : service.payment_method
                          }
                        </span>
                      </div>
                    )}

                    {/* Alert Badge */}
                    {service.enable_due_alert && (
                      <Badge variant="outline" className="text-xs font-medium">
                        🔔 Alerta {service.alert_days_before} días antes
                      </Badge>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default HousingServices;