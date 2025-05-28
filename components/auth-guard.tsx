'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { User } from '@supabase/supabase-js';

interface AuthGuardProps {
  children: React.ReactNode;
  requireAuth?: boolean;
}

export function AuthGuard({ children, requireAuth = true }: AuthGuardProps) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [initialized, setInitialized] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    let mounted = true;

    const initializeAuth = async () => {
      try {
        // Buscar sessão inicial
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Erro ao buscar sessão:', error);
        }

        if (mounted) {
          setUser(session?.user ?? null);
          setLoading(false);
          setInitialized(true);

          // Redirecionar baseado no estado de autenticação
          if (requireAuth && !session?.user) {
            router.push('/auth/login');
          } else if (!requireAuth && session?.user) {
            router.push('/dashboard');
          }
        }
      } catch (error) {
        console.error('Erro na inicialização da autenticação:', error);
        if (mounted) {
          setLoading(false);
          setInitialized(true);
        }
      }
    };

    initializeAuth();

    // Escutar mudanças na autenticação
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state change:', event, session?.user?.email);
        
        if (mounted) {
          setUser(session?.user ?? null);
          setLoading(false);

          // Redirecionar baseado no evento
          if (event === 'SIGNED_OUT' && requireAuth) {
            router.push('/auth/login');
          } else if (event === 'SIGNED_IN' && !requireAuth) {
            router.push('/dashboard');
          }
        }
      }
    );

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [supabase.auth, router, requireAuth]);

  // Mostrar loading enquanto inicializa
  if (!initialized || loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Carregando...</p>
        </div>
      </div>
    );
  }

  // Se requer autenticação mas não há usuário, não renderizar nada (redirecionamento em andamento)
  if (requireAuth && !user) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Redirecionando...</p>
        </div>
      </div>
    );
  }

  // Se não requer autenticação mas há usuário, não renderizar nada (redirecionamento em andamento)
  if (!requireAuth && user) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Redirecionando...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
} 