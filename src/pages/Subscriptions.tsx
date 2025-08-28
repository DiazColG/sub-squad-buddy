import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Plus, 
  Search, 
  Filter, 
  MoreHorizontal,
  Pencil,
  Trash2,
  Calendar,
  DollarSign
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Layout } from "@/components/Layout";

const Subscriptions = () => {
  const [searchTerm, setSearchTerm] = useState("");

  // Mock data - will be replaced with real data
  const subscriptions = [
    {
      id: "1",
      serviceName: "Netflix Premium",
      cost: 15.99,
      currency: "USD",
      billingCycle: "Monthly",
      nextRenewalDate: "2024-01-15",
      category: "Entertainment",
      status: "active"
    },
    {
      id: "2",
      serviceName: "Adobe Creative Suite",
      cost: 52.99,
      currency: "USD",
      billingCycle: "Monthly",
      nextRenewalDate: "2024-01-22",
      category: "Software",
      status: "active"
    },
    {
      id: "3",
      serviceName: "Spotify Family",
      cost: 12.99,
      currency: "USD",
      billingCycle: "Monthly",
      nextRenewalDate: "2024-01-18",
      category: "Entertainment",
      status: "active"
    },
    {
      id: "4",
      serviceName: "GitHub Pro",
      cost: 48.00,
      currency: "USD",
      billingCycle: "Annually",
      nextRenewalDate: "2024-06-15",
      category: "Software",
      status: "active"
    }
  ];

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      "Entertainment": "bg-primary-light text-primary",
      "Software": "bg-accent-light text-accent",
      "Business Operations": "bg-success-light text-success",
      "Health": "bg-warning-light text-warning",
      "Other": "bg-muted text-muted-foreground"
    };
    return colors[category] || colors["Other"];
  };

  const getBillingCycleColor = (cycle: string) => {
    const colors: Record<string, string> = {
      "Monthly": "bg-blue-100 text-blue-700",
      "Quarterly": "bg-yellow-100 text-yellow-700",
      "Semi-Annually": "bg-orange-100 text-orange-700",
      "Annually": "bg-green-100 text-green-700"
    };
    return colors[cycle] || "bg-gray-100 text-gray-700";
  };

  const filteredSubscriptions = subscriptions.filter(sub =>
    sub.serviceName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Layout>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-foreground">Suscripciones</h1>
            <p className="text-muted-foreground">Gestiona todas tus suscripciones activas</p>
          </div>
          <Button className="bg-gradient-primary">
            <Plus className="h-4 w-4 mr-2" />
            Nueva Suscripción
          </Button>
        </div>

        {/* Search and Filters */}
        <div className="flex items-center gap-4">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar suscripciones..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Button variant="outline">
            <Filter className="h-4 w-4 mr-2" />
            Filtros
          </Button>
        </div>

        {/* Subscriptions Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredSubscriptions.map((subscription) => (
            <Card key={subscription.id} className="shadow-card border-card-border hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg font-semibold truncate">
                      {subscription.serviceName}
                    </CardTitle>
                    <div className="flex items-center gap-2 mt-2">
                      <Badge className={getCategoryColor(subscription.category)}>
                        {subscription.category}
                      </Badge>
                      <Badge className={getBillingCycleColor(subscription.billingCycle)}>
                        {subscription.billingCycle}
                      </Badge>
                    </div>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem>
                        <Pencil className="h-4 w-4 mr-2" />
                        Editar
                      </DropdownMenuItem>
                      <DropdownMenuItem className="text-destructive">
                        <Trash2 className="h-4 w-4 mr-2" />
                        Eliminar
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <DollarSign className="h-4 w-4" />
                    <span className="text-sm">Costo</span>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-semibold text-foreground">
                      ${subscription.cost.toFixed(2)}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {subscription.currency}
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                    <span className="text-sm">Próxima renovación</span>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-medium text-foreground">
                      {new Date(subscription.nextRenewalDate).toLocaleDateString('es-ES')}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredSubscriptions.length === 0 && (
          <div className="text-center py-12">
            <div className="text-muted-foreground">
              {searchTerm ? "No se encontraron suscripciones" : "No tienes suscripciones activas"}
            </div>
            {!searchTerm && (
              <Button className="mt-4 bg-gradient-primary">
                <Plus className="h-4 w-4 mr-2" />
                Agregar primera suscripción
              </Button>
            )}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Subscriptions;