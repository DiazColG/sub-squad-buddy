import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Mail, ArrowLeft, Loader2, CheckCircle2 } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

const ForgotPassword = () => {
  const { resetPassword } = useAuth();
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email) {
      toast.error('Por favor ingresa tu email');
      return;
    }

    // Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      toast.error('Formato de email inválido');
      return;
    }
    
    setIsSubmitting(true);
    
    const { error } = await resetPassword(email);
    
    if (!error) {
      setEmailSent(true);
    }
    
    setIsSubmitting(false);
  };

  return (
    <div className="min-h-screen bg-background-subtle flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo/Brand */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold bg-gradient-primary bg-clip-text text-transparent">
            Suscrify
          </h1>
          <p className="text-muted-foreground mt-2">
            Recupera el acceso a tu cuenta
          </p>
        </div>

        <Card className="shadow-card border-card-border">
          <CardHeader className="space-y-2 text-center">
            <CardTitle className="text-2xl font-semibold">
              {emailSent ? '¡Email enviado!' : 'Recuperar Contraseña'}
            </CardTitle>
            <CardDescription>
              {emailSent 
                ? 'Revisa tu bandeja de entrada y sigue las instrucciones'
                : 'Ingresa tu email y te enviaremos un enlace para restablecer tu contraseña'
              }
            </CardDescription>
          </CardHeader>
          <CardContent>
            {emailSent ? (
              <div className="space-y-4">
                <div className="flex justify-center">
                  <div className="rounded-full bg-success/10 p-3">
                    <CheckCircle2 className="h-12 w-12 text-success" />
                  </div>
                </div>
                <div className="text-center space-y-2">
                  <p className="text-sm text-muted-foreground">
                    Hemos enviado un enlace de recuperación a:
                  </p>
                  <p className="font-medium">{email}</p>
                  <p className="text-sm text-muted-foreground">
                    Si no lo ves, revisa tu carpeta de spam.
                  </p>
                </div>
                <div className="space-y-2">
                  <Button 
                    variant="outline" 
                    className="w-full" 
                    onClick={() => {
                      setEmailSent(false);
                      setEmail("");
                    }}
                  >
                    Enviar a otro email
                  </Button>
                  <Link to="/login" className="block">
                    <Button variant="default" className="w-full">
                      Volver al inicio de sesión
                    </Button>
                  </Link>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Correo electrónico</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="tu@email.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="pl-10"
                      required
                      autoFocus
                    />
                  </div>
                </div>

                <Button type="submit" className="w-full" size="lg" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Enviando...
                    </>
                  ) : (
                    'Enviar enlace de recuperación'
                  )}
                </Button>

                <Link to="/login" className="block">
                  <Button variant="ghost" className="w-full" type="button">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Volver al inicio de sesión
                  </Button>
                </Link>
              </form>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ForgotPassword;
