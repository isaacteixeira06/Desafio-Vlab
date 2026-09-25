import axios, { AxiosError } from 'axios'
import type { ApiValidationError } from '../types'

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? 'http://localhost:8000/api/v1',
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
  timeout: 10_000,
});

// ─── Interceptor de resposta ───────────────────────────────────────────────────
api.interceptors.response.use(
  (response) => response,
  (error: AxiosError<ApiValidationError | { message: string }>) => {

    return Promise.reject(error);
  }
);


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