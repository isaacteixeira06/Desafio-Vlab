// ─── Enums ────────────────────────────────────────────────────────────────────

export type Status =
  | 'RECEBIDA'
  | 'EM_ANALISE'
  | 'AGENDADA'
  | 'CONCLUIDA'
  | 'CANCELADA';

export type Categoria = 'CONSULTA' | 'EXAME' | 'VACINACAO' | 'OUTRO';

export type Prioridade = 'BAIXA' | 'MEDIA' | 'ALTA' | 'URGENTE';

// ─── Modelo principal ─────────────────────────────────────────────────────────

export interface Solicitacao {
  id: number;
  protocolo: string;
  nome_solicitante: string;
  categoria: Categoria;
  prioridade: Prioridade;
  status: Status;
  descricao: string;
  justificativa_prioridade: string | null;
  proximos_status: Status[];
  data_criacao: string;
  data_atualizacao: string;
}

// ─── Payloads ─────────────────────────────────────────────────────────────────

export interface CriarSolicitacaoPayload {
  nome_solicitante: string;
  categoria: Categoria;
  prioridade: Prioridade;
  descricao: string;
  justificativa_prioridade?: string;
}

export interface AtualizarStatusPayload {
  status: Status;
}

// ─── Respostas da API ─────────────────────────────────────────────────────────

export interface ApiResource<T> {
  data: T;
}

export interface ApiCollection<T> {
  data: T[];
  meta: PaginationMeta;
  links: PaginationLinks;
}

export interface PaginationMeta {
  current_page: number;
  from: number | null;
  last_page: number;
  per_page: number;
  to: number | null;
  total: number;
}

export interface PaginationLinks {
  first: string;
  last: string;
  prev: string | null;
  next: string | null;
}

export interface ApiValidationError {
  message: string;
  errors: Record<string, string[]>;
}

// ─── Filtros ──────────────────────────────────────────────────────────────────

export interface FiltrosSolicitacao {
  status?: Status | '';
  categoria?: Categoria | '';
  prioridade?: Prioridade | '';
  page?: number;
  per_page?: number;
}

// ─── Autenticação ─────────────────────────────────────────────────────────────

export interface Usuario {
  id: number;
  name: string;
  email: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface RegisterPayload {
  name: string;
  email: string;
  password: string;
  password_confirmation: string;
}

export interface AuthResponse {
  message: string;
  user: Usuario;
  token: string;
}