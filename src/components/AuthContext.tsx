"use client";
import React, { createContext, useContext, useState, useEffect } from 'react';
import { createClient } from '@/lib/supabaseClient';

const supabase = createClient();
import AuthCardOLVUniversal from './AuthCardOLVUniversal';

interface AuthContextType {
  user: any;
  loading: boolean;
  showAuthModal: boolean;
  authMode: 'login' | 'signup';
  openAuthModal: (mode?: 'login' | 'signup') => void;
  closeAuthModal: () => void;
  setAuthMode: (mode: 'login' | 'signup') => void;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');

  useEffect(() => {
    // Verificar sessão atual
    const getSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user ?? null);
      setLoading(false);
    };

    getSession();

    // Escutar mudanças de autenticação
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event: string, session: any) => {
        setUser(session?.user ?? null);
        setLoading(false);
        
        // Fechar modal após login bem-sucedido
        if (event === 'SIGNED_IN') {
          setShowAuthModal(false);
        }
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const openAuthModal = (mode: 'login' | 'signup' = 'login') => {
    setAuthMode(mode);
    setShowAuthModal(true);
  };

  const closeAuthModal = () => {
    setShowAuthModal(false);
  };

  const setAuthModeHandler = (mode: 'login' | 'signup') => {
    setAuthMode(mode);
  };

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  const value = {
    user,
    loading,
    showAuthModal,
    authMode,
    openAuthModal,
    closeAuthModal,
    setAuthMode: setAuthModeHandler,
    signOut,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
      
      {/* Modal de Autenticação */}
      <AuthCardOLVUniversal
        mode={authMode}
        onModeChange={setAuthModeHandler}
        onClose={closeAuthModal}
        isOpen={showAuthModal}
      />
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
} 