import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react';
import { login as apiLogin, logout as apiLogout, register as apiRegister } from '../api/auth';
import type { LoginPayload, RegisterPayload, Usuario } from '../types';

// ─── Tipos ────────────────────────────────────────────────────────────────────

interface AuthContextValue {
  user: Usuario | null;
  token: string | null;
  loading: boolean;          // true enquanto verifica sessão salva
  isAuthenticated: boolean;
  login: (payload: LoginPayload) => Promise<void>;
  register: (payload: RegisterPayload) => Promise<void>;
  logout: () => Promise<void>;
}

// ─── Context ──────────────────────────────────────────────────────────────────

const AuthContext = createContext<AuthContextValue | null>(null);

// ─── Provider ─────────────────────────────────────────────────────────────────

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser]   = useState<Usuario | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Restaura sessão do localStorage na montagem
  useEffect(() => {
    const savedToken = localStorage.getItem('auth_token');
    const savedUser  = localStorage.getItem('auth_user');

    if (savedToken && savedUser) {
      try {
        setToken(savedToken);
        setUser(JSON.parse(savedUser) as Usuario);
      } catch {
        localStorage.removeItem('auth_token');
        localStorage.removeItem('auth_user');
      }
    }
    setLoading(false);
  }, []);

  // Escuta evento disparado pelo interceptor axios quando recebe 401
  useEffect(() => {
    const handleUnauthenticated = () => {
      setUser(null);
      setToken(null);
    };
    window.addEventListener('auth:unauthenticated', handleUnauthenticated);
    return () => window.removeEventListener('auth:unauthenticated', handleUnauthenticated);
  }, []);

  function salvarSessao(novoToken: string, novoUser: Usuario) {
    localStorage.setItem('auth_token', novoToken);
    localStorage.setItem('auth_user', JSON.stringify(novoUser));
    setToken(novoToken);
    setUser(novoUser);
  }

  function limparSessao() {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('auth_user');
    setToken(null);
    setUser(null);
  }

  const login = useCallback(async (payload: LoginPayload) => {
    const result = await apiLogin(payload);
    salvarSessao(result.token, result.user);
  }, []);

  const register = useCallback(async (payload: RegisterPayload) => {
    const result = await apiRegister(payload);
    salvarSessao(result.token, result.user);
  }, []);

  const logout = useCallback(async () => {
    try {
      await apiLogout();
    } finally {
      limparSessao();
    }
  }, []);

  return (
    <AuthContext.Provider value={{
      user,
      token,
      loading,
      isAuthenticated: !!token,
      login,
      register,
      logout,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth deve ser usado dentro de AuthProvider');
  return ctx;
}