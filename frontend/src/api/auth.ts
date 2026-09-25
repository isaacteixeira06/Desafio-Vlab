import { api } from './client';
import type { AuthResponse, LoginPayload, RegisterPayload, Usuario } from '../types';

export async function register(payload: RegisterPayload): Promise<AuthResponse> {
  const { data } = await api.post<AuthResponse>('/auth/register', payload);
  return data;
}

export async function login(payload: LoginPayload): Promise<AuthResponse> {
  const { data } = await api.post<AuthResponse>('/auth/login', payload);
  return data;
}

export async function logout(): Promise<void> {
  await api.post('/auth/logout');
}

export async function me(): Promise<Usuario> {
  const { data } = await api.get<Usuario>('/auth/me');
  return data;
}