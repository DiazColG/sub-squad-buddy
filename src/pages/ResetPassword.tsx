import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Lock, Eye, EyeOff, Loader2 } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

const ResetPassword = () => {
  const navigate = useNavigate();
  const { updatePassword } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    password: "",
    confirmPassword: ""
  });
  const [passwordStrength, setPasswordStrength] = useState({ score: 0, feedback: [] as string[] });

  const validatePasswordStrength = (password: string) => {
    const feedback = [];
    let score = 0;

    if (password.length >= 8) score += 1;
    else feedback.push("Mínimo 8 caracteres");

    if (/[A-Z]/.test(password)) score += 1;
    else feedback.push("Al menos 1 mayúscula");

    if (/[a-z]/.test(password)) score += 1;
    else feedback.push("Al menos 1 minúscula");

    if (/\d/.test(password)) score += 1;
    else feedback.push("Al menos 1 número");

    if (/[!@#$%^&*]/.test(password)) score += 1;
    else feedback.push("Al menos 1 símbolo");

    return { score, feedback };
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    if (field === 'password') {
      setPasswordStrength(validatePasswordStrength(value));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.password !== formData.confirmPassword) {
      toast.error('Las contraseñas no coinciden');
      return;
    }

    if (passwordStrength.score < 3) {
      toast.error('La contraseña debe ser más fuerte');
      return;
    }
    
    setIsSubmitting(true);
    
    const { error } = await updatePassword(formData.password);
    
    if (!error) {
      setTimeout(() => {
        navigate('/dashboard');
      }, 1000);
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
            Establece tu nueva contraseña
          </p>
        </div>

        <Card className="shadow-card border-card-border">
          <CardHeader className="space-y-2 text-center">
            <CardTitle className="text-2xl font-semibold">Nueva Contraseña</CardTitle>
            <CardDescription>
              Ingresa una contraseña segura para tu cuenta
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="password">Nueva contraseña</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={(e) => handleInputChange("password", e.target.value)}
                    className="pl-10 pr-10"
                    required
                    autoFocus
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                
                {/* Password Strength Indicator */}
                {formData.password && (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <div className="flex-1 bg-muted rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full transition-all duration-300 ${
                            passwordStrength.score <= 2 ? 'bg-destructive' :
                            passwordStrength.score <= 3 ? 'bg-warning' : 'bg-success'
                          }`}
                          style={{ width: `${(passwordStrength.score / 5) * 100}%` }}
                        />
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {passwordStrength.score <= 2 ? 'Débil' :
                         passwordStrength.score <= 3 ? 'Media' : 'Fuerte'}
                      </span>
                    </div>
                    {passwordStrength.feedback.length > 0 && (
                      <div className="text-xs text-muted-foreground">
                        {passwordStrength.feedback.join(", ")}
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirmar contraseña</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={formData.confirmPassword}
                    onChange={(e) => handleInputChange("confirmPassword", e.target.value)}
                    className="pl-10 pr-10"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-3 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <Button type="submit" className="w-full" size="lg" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Actualizando...
                  </>
                ) : (
                  'Actualizar contraseña'
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ResetPassword;
