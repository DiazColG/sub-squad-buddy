import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { 
  Plus, 
  Search, 
  CreditCard,
  MoreHorizontal,
  Pencil,
  Trash2,
  Calendar,
  Building2,
  User,
  AlertTriangle,
  Loader2
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useCards } from "@/hooks/useCards";
import AddCardForm from "@/components/AddCardForm";
import { toast } from "sonner";
import { formatNumber } from "@/lib/formatNumber";

const Cards = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { cards, loading, addCard, deleteCard } = useCards();

  const getCardTypeColor = (type: string) => {
    return type === 'credit' 
      ? "bg-primary-light text-primary" 
      : "bg-accent-light text-accent";
  };

  const getBrandColor = (brand?: string) => {
    const colors: Record<string, string> = {
      "Visa": "bg-blue-100 text-blue-700",
      "Mastercard": "bg-orange-100 text-orange-700",
      "American Express": "bg-green-100 text-green-700",
      "Maestro": "bg-red-100 text-red-700",
      "Cabal": "bg-purple-100 text-purple-700",
      "Naranja": "bg-orange-100 text-orange-700"
    };
    return colors[brand || ""] || "bg-gray-100 text-gray-700";
  };

  const getExpiryStatus = (expiryDate: string) => {
    const today = new Date();
    const expiry = new Date(expiryDate);
    const diffTime = expiry.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) {
      return { status: "expired", color: "bg-destructive text-destructive-foreground", days: diffDays };
    } else if (diffDays <= 30) {
      return { status: "expiring", color: "bg-warning text-warning-foreground", days: diffDays };
    } else if (diffDays <= 60) {
      return { status: "warning", color: "bg-yellow-100 text-yellow-800", days: diffDays };
    }
    return { status: "valid", color: "bg-success text-success-foreground", days: diffDays };
  };

  const filteredCards = cards.filter(card =>
    card.bank_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    card.card_last_digits.includes(searchTerm) ||
    (card.cardholder_name && card.cardholder_name.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleAddCard = async (cardData: any) => {
    try {
      await addCard(cardData);
      setIsDialogOpen(false);
    } catch (error) {
      console.error('Error adding card:', error);
    }
  };

  const handleDeleteCard = async (id: string) => {
    try {
      await deleteCard(id);
    } catch (error) {
      console.error('Error deleting card:', error);
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Tarjetas</h1>
          <p className="text-muted-foreground">Gestiona tus tarjetas de crédito y débito</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-gradient-primary">
              <Plus className="h-4 w-4 mr-2" />
              Nueva Tarjeta
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Agregar Nueva Tarjeta</DialogTitle>
            </DialogHeader>
            <AddCardForm onSubmit={handleAddCard} loading={loading} />
          </DialogContent>
        </Dialog>
      </div>

      {/* Search */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar tarjetas..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <span className="ml-2 text-muted-foreground">Cargando tarjetas...</span>
        </div>
      )}

      {/* Cards Grid */}
      {!loading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredCards.map((card) => {
            const expiryStatus = getExpiryStatus(card.expiry_date);
            
            return (
              <Card key={card.id} className="shadow-card border-card-border hover:shadow-lg transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg font-semibold flex items-center gap-2">
                        <CreditCard className="h-5 w-5" />
                        •••• {card.card_last_digits}
                      </CardTitle>
                      <div className="flex items-center gap-2 mt-2 flex-wrap">
                        <Badge className={getCardTypeColor(card.card_type)}>
                          {card.card_type === 'credit' ? 'Crédito' : 'Débito'}
                        </Badge>
                        {card.card_brand && (
                          <Badge className={getBrandColor(card.card_brand)}>
                            {card.card_brand}
                          </Badge>
                        )}
                        <Badge className={expiryStatus.color}>
                          {expiryStatus.status === 'expired' && 'Vencida'}
                          {expiryStatus.status === 'expiring' && `Vence en ${expiryStatus.days}d`}
                          {expiryStatus.status === 'warning' && `Vence en ${expiryStatus.days}d`}
                          {expiryStatus.status === 'valid' && 'Válida'}
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
                          onClick={() => handleDeleteCard(card.id)}
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
                      <Building2 className="h-4 w-4" />
                      <span className="text-sm">Banco</span>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-medium text-foreground">
                        {card.bank_name}
                      </div>
                    </div>
                  </div>

                  {card.cardholder_name && (
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <User className="h-4 w-4" />
                        <span className="text-sm">Titular</span>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-medium text-foreground">
                          {card.cardholder_name}
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Calendar className="h-4 w-4" />
                      <span className="text-sm">Vencimiento</span>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-medium text-foreground">
                        {new Date(card.expiry_date).toLocaleDateString('es-ES', { 
                          month: '2-digit', 
                          year: 'numeric' 
                        })}
                      </div>
                    </div>
                  </div>

                  {card.enable_expiry_alert && expiryStatus.status !== 'valid' && (
                    <div className="flex items-center gap-2 text-warning">
                      <AlertTriangle className="h-4 w-4" />
                      <span className="text-xs">
                        Alerta de vencimiento activada ({card.alert_days_before} días antes)
                      </span>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {!loading && filteredCards.length === 0 && (
        <div className="text-center py-12">
          <div className="text-muted-foreground">
            {searchTerm ? "No se encontraron tarjetas" : "No tienes tarjetas registradas"}
          </div>
          {!searchTerm && (
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button className="mt-4 bg-gradient-primary">
                  <Plus className="h-4 w-4 mr-2" />
                  Agregar primera tarjeta
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Agregar Nueva Tarjeta</DialogTitle>
                </DialogHeader>
                <AddCardForm onSubmit={handleAddCard} loading={loading} />
              </DialogContent>
            </Dialog>
          )}
        </div>
      )}
    </div>
  );
};

export default Cards;