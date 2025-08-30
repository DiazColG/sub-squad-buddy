import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { 
  Plus, 
  Search, 
  Filter, 
  MoreHorizontal,
  Pencil,
  Trash2,
  Calendar,
  DollarSign,
  Loader2
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Layout } from "@/components/Layout";
import { useSubscriptions } from "@/hooks/useSubscriptions";
import AddSubscriptionForm from "@/components/AddSubscriptionForm";
import { toast } from "sonner";

const Subscriptions = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { subscriptions, loading, addSubscription, deleteSubscription } = useSubscriptions();

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
    sub.service_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAddSubscription = async (subscriptionData: any) => {
    try {
      await addSubscription(subscriptionData);
      setIsDialogOpen(false);
    } catch (error) {
      console.error('Error adding subscription:', error);
    }
  };

  const handleDeleteSubscription = async (id: string) => {
    try {
      await deleteSubscription(id);
    } catch (error) {
      console.error('Error deleting subscription:', error);
    }
  };

  return (
    <Layout>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-foreground">Suscripciones</h1>
            <p className="text-muted-foreground">Gestiona todas tus suscripciones activas</p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-gradient-primary">
                <Plus className="h-4 w-4 mr-2" />
                Nueva Suscripción
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Agregar Nueva Suscripción</DialogTitle>
              </DialogHeader>
              <AddSubscriptionForm onSubmit={handleAddSubscription} loading={loading} />
            </DialogContent>
          </Dialog>
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

        {/* Loading State */}
        {loading && (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <span className="ml-2 text-muted-foreground">Cargando suscripciones...</span>
          </div>
        )}

        {/* Subscriptions Grid */}
        {!loading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredSubscriptions.map((subscription) => (
              <Card key={subscription.id} className="shadow-card border-card-border hover:shadow-lg transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg font-semibold truncate">
                        {subscription.service_name}
                      </CardTitle>
                      <div className="flex items-center gap-2 mt-2">
                        <Badge className={getCategoryColor(subscription.category)}>
                          {subscription.category}
                        </Badge>
                        <Badge className={getBillingCycleColor(subscription.billing_cycle)}>
                          {subscription.billing_cycle}
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
                        <DropdownMenuItem 
                          className="text-destructive"
                          onClick={() => handleDeleteSubscription(subscription.id)}
                        >
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
                        {new Date(subscription.next_renewal_date).toLocaleDateString('es-ES')}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {!loading && filteredSubscriptions.length === 0 && (
          <div className="text-center py-12">
            <div className="text-muted-foreground">
              {searchTerm ? "No se encontraron suscripciones" : "No tienes suscripciones activas"}
            </div>
            {!searchTerm && (
              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="mt-4 bg-gradient-primary">
                    <Plus className="h-4 w-4 mr-2" />
                    Agregar primera suscripción
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>Agregar Nueva Suscripción</DialogTitle>
                  </DialogHeader>
                  <AddSubscriptionForm onSubmit={handleAddSubscription} loading={loading} />
                </DialogContent>
              </Dialog>
            )}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Subscriptions;