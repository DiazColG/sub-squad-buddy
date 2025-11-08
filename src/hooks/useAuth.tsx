import { useState, useEffect, createContext, useContext } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { toast } from "sonner";
import { useAnalytics } from '@/lib/analytics';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signUp: (email: string, password: string, fullName: string, accountType: 'personal' | 'team') => Promise<{ error: any }>;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signInWithGoogle: () => Promise<{ error: any }>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ error: any }>;
  updatePassword: (newPassword: string) => Promise<{ error: any }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const analytics = useAnalytics();

  useEffect(() => {
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);

        // Track authentication events
        if (event === 'SIGNED_IN' && session?.user) {
          analytics.identify(session.user.id, {
            email: session.user.email,
            name: session.user.user_metadata?.full_name,
            account_type: session.user.user_metadata?.account_type,
          });
        } else if (event === 'SIGNED_OUT') {
          analytics.reset();
        }
      }
    );

    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);

      // Identify existing user
      if (session?.user) {
        analytics.identify(session.user.id, {
          email: session.user.email,
          name: session.user.user_metadata?.full_name,
        });
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const signUp = async (email: string, password: string, fullName: string, accountType: 'personal' | 'team') => {
    try {
      const redirectUrl = `${window.location.origin}/`;
      
      const { error, data } = await supabase.auth.signUp({
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
        analytics.track('signup_failed', { error: error.message, method: 'email' });
        toast.error(error.message);
        return { error };
      }

      // Track successful signup
      analytics.track('user_signed_up', {
        method: 'email',
        account_type: accountType,
      });

      toast.success('¡Cuenta creada! Revisa tu email para confirmar tu registro.');
      return { error: null };
    } catch (error: any) {
      analytics.track('signup_error', { error: 'Unknown error' });
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
        // Track failed login
        analytics.track('login_failed', {
          error: error.message,
          method: 'email',
        });

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

      // Track successful login
      analytics.track('user_logged_in', {
        method: 'email',
      });

      toast.success('¡Bienvenido de vuelta!');
      return { error: null };
    } catch (error: any) {
      analytics.track('login_error', { error: 'Connection error' });
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

  const signInWithGoogle = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          }
        }
      });

      if (error) {
        // Track Google OAuth failure
        analytics.track('login_failed', {
          error: error.message,
          method: 'google',
        });
        toast.error('Error al conectar con Google');
        return { error };
      }

      // Note: Successful Google login will be tracked in the useEffect
      // when the session is established after redirect
      return { error: null };
    } catch (error: any) {
      analytics.track('login_error', {
        error: 'Connection error',
        method: 'google',
      });
      toast.error('Error de conexión. Verifica tu internet');
      return { error };
    }
  };

  const resetPassword = async (email: string) => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) {
        // Track password reset request failure
        analytics.track('password_reset_requested', {
          success: false,
          error: error.message,
        });
        toast.error('Error al enviar el correo de recuperación');
        return { error };
      }

      // Track successful password reset request
      analytics.track('password_reset_requested', {
        success: true,
      });

      toast.success('¡Email enviado! Revisa tu bandeja de entrada');
      return { error: null };
    } catch (error: any) {
      analytics.track('password_reset_error', {
        error: 'Unknown error',
      });
      toast.error('Error al procesar la solicitud');
      return { error };
    }
  };

  const updatePassword = async (newPassword: string) => {
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      });

      if (error) {
        // Track password update failure
        analytics.track('password_updated', {
          success: false,
          error: error.message,
        });
        toast.error('Error al actualizar la contraseña');
        return { error };
      }

      // Track successful password update
      analytics.track('password_updated', {
        success: true,
      });

      toast.success('¡Contraseña actualizada exitosamente!');
      return { error: null };
    } catch (error: any) {
      analytics.track('password_update_error', {
        error: 'Unknown error',
      });
      toast.error('Error al procesar la solicitud');
      return { error };
    }
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      session, 
      loading, 
      signUp, 
      signIn, 
      signInWithGoogle,
      signOut,
      resetPassword,
      updatePassword
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