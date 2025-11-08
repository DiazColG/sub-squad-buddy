import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';

const AuthCallback = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Supabase maneja automáticamente el hash fragment
    // Solo necesitamos esperar un momento y redirigir
    const timer = setTimeout(() => {
      navigate('/dashboard', { replace: true });
    }, 1000);

    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div className="min-h-screen bg-background-subtle flex items-center justify-center p-4">
      <div className="text-center space-y-4">
        <div className="flex justify-center">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
        </div>
        <h2 className="text-xl font-semibold">Iniciando sesión...</h2>
        <p className="text-muted-foreground">Un momento por favor</p>
      </div>
    </div>
  );
};

export default AuthCallback;
