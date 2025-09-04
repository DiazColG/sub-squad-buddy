import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Plus, Mail, UserMinus, Crown } from "lucide-react";
import { toast } from "sonner";

const Share = () => {
  const [email, setEmail] = useState("");
  const [isInviting, setIsInviting] = useState(false);

  // Mock data - will be replaced with real data from Supabase
  const sharedUsers = [
    { id: "1", email: "maria@email.com", name: "María González", isOwner: false },
    { id: "2", email: "juan@email.com", name: "Juan Pérez", isOwner: false },
  ];

  const currentUser = { email: "usuario@email.com", name: "Usuario Principal", isOwner: true };
  const maxUsers = 6;
  const totalUsers = sharedUsers.length + 1; // +1 for current user

  const handleInvite = async () => {
    if (!email) {
      toast.error("Por favor ingresa un email");
      return;
    }

    if (totalUsers >= maxUsers) {
      toast.error(`No puedes agregar más de ${maxUsers} personas`);
      return;
    }

    setIsInviting(true);
    
    // Simulate API call
    setTimeout(() => {
      toast.success(`Invitación enviada a ${email}`);
      setEmail("");
      setIsInviting(false);
    }, 1000);
  };

  const handleRemoveUser = (userId: string, userName: string) => {
    toast.success(`${userName} ha sido removido`);
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
  };

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Compartir</h1>
        <p className="text-muted-foreground mt-2">
          Comparte tus suscripciones y gastos con hasta {maxUsers} personas
        </p>
      </div>

      {/* Current Usage */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Personas compartiendo</span>
            <Badge variant={totalUsers >= maxUsers ? "destructive" : "secondary"}>
              {totalUsers}/{maxUsers}
            </Badge>
          </CardTitle>
          <CardDescription>
            Perfecto para parejas y familias que quieren gestionar gastos juntos
          </CardDescription>
        </CardHeader>
      </Card>

      {/* Add New Person */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plus className="h-5 w-5" />
            Invitar persona
          </CardTitle>
          <CardDescription>
            La persona recibirá un email de invitación para acceder a tus suscripciones
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="ejemplo@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={totalUsers >= maxUsers}
            />
          </div>
          <Button 
            onClick={handleInvite} 
            disabled={isInviting || totalUsers >= maxUsers}
            className="w-full"
          >
            {isInviting ? "Enviando..." : "Enviar invitación"}
          </Button>
        </CardContent>
      </Card>

      {/* Current User */}
      <Card>
        <CardHeader>
          <CardTitle>Tu cuenta</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between p-3 rounded-lg border">
            <div className="flex items-center gap-3">
              <Avatar>
                <AvatarFallback>{getInitials(currentUser.name)}</AvatarFallback>
              </Avatar>
              <div>
                <p className="font-medium">{currentUser.name}</p>
                <p className="text-sm text-muted-foreground">{currentUser.email}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Crown className="h-4 w-4 text-yellow-500" />
              <Badge>Propietario</Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Shared Users */}
      {sharedUsers.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Personas con acceso</CardTitle>
            <CardDescription>
              Estas personas pueden ver y gestionar las suscripciones compartidas
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {sharedUsers.map((user) => (
              <div key={user.id} className="flex items-center justify-between p-3 rounded-lg border">
                <div className="flex items-center gap-3">
                  <Avatar>
                    <AvatarFallback>{getInitials(user.name)}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">{user.name}</p>
                    <p className="text-sm text-muted-foreground">{user.email}</p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleRemoveUser(user.id, user.name)}
                  className="text-destructive hover:text-destructive"
                >
                  <UserMinus className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default Share;