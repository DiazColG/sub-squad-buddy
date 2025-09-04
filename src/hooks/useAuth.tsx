import { useState, useEffect, createContext, useContext } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { toast } from "sonner";

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signUp: (email: string, password: string, fullName: string, accountType: 'personal' | 'team') => Promise<{ error: any }>;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);
      }
    );

    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signUp = async (email: string, password: string, fullName: string, accountType: 'personal' | 'team') => {
    try {
      const redirectUrl = `${window.location.origin}/`;
      
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: redirectUrl,
          data: {
            full_name: fullName,
            account_type: accountType
          }
        }
      });

      if (error) {
        toast.error(error.message);
        return { error };
      }

      toast.success('¡Cuenta creada! Revisa tu email para confirmar tu registro.');
      return { error: null };
    } catch (error: any) {
      toast.error('Error al crear la cuenta');
      return { error };
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      // Basic input validation
      if (!email || !password) {
        toast.error('Email y contraseña son requeridos');
        return { error: new Error('Missing credentials') };
      }

      // Email format validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        toast.error('Formato de email inválido');
        return { error: new Error('Invalid email format') };
      }

      const { error } = await supabase.auth.signInWithPassword({
        email: email.toLowerCase().trim(),
        password,
      });

      if (error) {
        // Handle specific Supabase errors
        if (error.message === 'Invalid login credentials') {
          toast.error('Email o contraseña incorrectos');
        } else if (error.message.includes('Email not confirmed')) {
          toast.error('Por favor confirma tu email antes de iniciar sesión');
        } else if (error.message.includes('Too many requests')) {
          toast.error('Demasiados intentos. Intenta más tarde');
        } else {
          toast.error('Error al iniciar sesión');
        }
        return { error };
      }

      toast.success('¡Bienvenido de vuelta!');
      return { error: null };
    } catch (error: any) {
      toast.error('Error de conexión. Verifica tu internet');
      return { error };
    }
  };

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        toast.error(error.message);
      } else {
        toast.success('Sesión cerrada');
      }
    } catch (error: any) {
      toast.error('Error al cerrar sesión');
    }
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      session, 
      loading, 
      signUp, 
      signIn, 
      signOut 
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};