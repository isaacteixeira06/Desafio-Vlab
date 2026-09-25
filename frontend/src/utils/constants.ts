import type { Categoria, Prioridade, Status } from '../types'

// ─── Status ───────────────────────────────────────────────────────────────────

export const STATUS_LABEL: Record<Status, string> = {
  RECEBIDA: 'Recebida',
  EM_ANALISE: 'Em análise',
  AGENDADA: 'Agendada',
  CONCLUIDA: 'Concluída',
  CANCELADA: 'Cancelada',
};

// Classes Tailwind para cada badge de status
export const STATUS_BADGE: Record<Status, string> = {
  RECEBIDA:   'bg-blue-100 text-blue-800',
  EM_ANALISE: 'bg-yellow-100 text-yellow-800',
  AGENDADA:   'bg-teal-100 text-teal-800',
  CONCLUIDA:  'bg-green-100 text-green-800',
  CANCELADA:  'bg-red-100 text-red-800',
};

// Cor do card KPI de status no dashboard
export const STATUS_CARD_COLOR: Record<Status, string> = {
  RECEBIDA:   'border-blue-400',
  EM_ANALISE: 'border-yellow-400',
  AGENDADA:   'border-teal-400',
  CONCLUIDA:  'border-green-400',
  CANCELADA:  'border-red-400',
};

// ─── Prioridade ───────────────────────────────────────────────────────────────

export const PRIORIDADE_LABEL: Record<Prioridade, string> = {
  BAIXA:   'Baixa',
  MEDIA:   'Média',
  ALTA:    'Alta',
  URGENTE: 'Urgente',
};

export const PRIORIDADE_BADGE: Record<Prioridade, string> = {
  BAIXA:   'bg-slate-100 text-slate-600',
  MEDIA:   'bg-blue-50 text-blue-700',
  ALTA:    'bg-orange-100 text-orange-700',
  URGENTE: 'bg-red-100 text-red-700 font-semibold',
};

// ─── Categoria ────────────────────────────────────────────────────────────────

export const CATEGORIA_LABEL: Record<Categoria, string> = {
  CONSULTA:  'Consulta',
  EXAME:     'Exame',
  VACINACAO: 'Vacinação',
  OUTRO:     'Outro',
};

// ─── Listas para selects ──────────────────────────────────────────────────────

export const STATUS_OPTIONS: Status[] = [
  'RECEBIDA',
  'EM_ANALISE',
  'AGENDADA',
  'CONCLUIDA',
  'CANCELADA',
];

export const CATEGORIA_OPTIONS: Categoria[] = [
  'CONSULTA',
  'EXAME',
  'VACINACAO',
  'OUTRO',
];

export const PRIORIDADE_OPTIONS: Prioridade[] = [
  'BAIXA',
  'MEDIA',
  'ALTA',
  'URGENTE',
];