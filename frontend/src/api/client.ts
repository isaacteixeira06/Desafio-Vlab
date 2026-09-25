import axios, { AxiosError } from 'axios';
import type { ApiValidationError } from '../types';

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? 'http://localhost:8000/api/v1',
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
  timeout: 10_000,
});

// ─── Injeta token em toda requisição ─────────────────────────────────────────
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('auth_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ─── Interceptor de resposta ──────────────────────────────────────────────────
api.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    // Se 401, limpa token e redireciona para login
    if (error.response?.status === 401) {
      localStorage.removeItem('auth_token');
      localStorage.removeItem('auth_user');
      // Dispara evento para o AuthContext reagir
      window.dispatchEvent(new Event('auth:unauthenticated'));
    }
    return Promise.reject(error);
  }
);

/**
 * Extrai as mensagens de erro de uma resposta da API.
 */
export function extrairErrosApi(
  error: unknown
): { campo: Record<string, string[]>; geral: string } {
  if (axios.isAxiosError(error)) {
    const data = error.response?.data as ApiValidationError | undefined;
    if (data?.errors) {
      return { campo: data.errors, geral: data.message ?? 'Dados inválidos.' };
    }
    const msg = (data as { message?: string })?.message;
    return { campo: {}, geral: msg ?? 'Erro de comunicação com o servidor.' };
  }
  return { campo: {}, geral: 'Erro inesperado. Tente novamente.' };
}