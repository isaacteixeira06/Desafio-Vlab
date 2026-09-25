import React, { useState } from 'react';
import type { FiltrosSolicitacao, Status, Categoria, Prioridade } from '../types';
import {
  STATUS_OPTIONS, STATUS_LABEL,
  CATEGORIA_OPTIONS, CATEGORIA_LABEL,
  PRIORIDADE_OPTIONS, PRIORIDADE_LABEL,
} from '../utils/constants';
import { useSolicitacoes } from '../hooks/useSolicitacoes';
import { StatusBadge, PrioridadeBadge, Spinner, EmptyState, ErrorBanner, Button } from '../components/ui';

interface ListaSolicitacoesProps {
  filtroInicial?: { status?: Status };
  onVerDetalhe: (id: number) => void;
  onNovaSolicitacao: () => void;
}

export function ListaSolicitacoes({ filtroInicial, onVerDetalhe, onNovaSolicitacao }: ListaSolicitacoesProps) {
  const [filtros, setFiltros] = useState<FiltrosSolicitacao>({
    status:    filtroInicial?.status ?? '',
    categoria: '',
    prioridade: '',
    page: 1,
    per_page: 15,
  });

  const { data, loading, error, refetch } = useSolicitacoes(filtros);

  function setFiltro<K extends keyof FiltrosSolicitacao>(campo: K, valor: FiltrosSolicitacao[K]) {
    setFiltros((prev) => ({ ...prev, [campo]: valor, page: 1 }));
  }

  function limparFiltros() {
    setFiltros({ status: '', categoria: '', prioridade: '', page: 1, per_page: 15 });
  }

  const temFiltro = filtros.status || filtros.categoria || filtros.prioridade;

  return (
    <div className="p-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-slate-800">Solicitações</h1>
          {data && (
            <p className="text-slate-400 text-sm mt-0.5">
              {data.meta.total} {data.meta.total === 1 ? 'registro' : 'registros'} encontrados
            </p>
          )}
        </div>
        <Button onClick={onNovaSolicitacao} size="sm">
          <svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
          </svg>
          Nova solicitação
        </Button>
      </div>

      {/* Filtros */}
      <div className="bg-white rounded-xl border border-slate-200 px-4 py-3">
        <div className="flex flex-wrap gap-3 items-end">
          <div className="min-w-[140px]">
            <label className="block text-xs text-slate-500 mb-1">Status</label>
            <select
              value={filtros.status}
              onChange={(e) => setFiltro('status', e.target.value as Status | '')}
              className="w-full border border-slate-300 rounded-lg px-3 py-1.5 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-teal-500"
            >
              <option value="">Todos</option>
              {STATUS_OPTIONS.map((s) => (
                <option key={s} value={s}>{STATUS_LABEL[s]}</option>
              ))}
            </select>
          </div>

          <div className="min-w-[130px]">
            <label className="block text-xs text-slate-500 mb-1">Categoria</label>
            <select
              value={filtros.categoria}
              onChange={(e) => setFiltro('categoria', e.target.value as Categoria | '')}
              className="w-full border border-slate-300 rounded-lg px-3 py-1.5 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-teal-500"
            >
              <option value="">Todas</option>
              {CATEGORIA_OPTIONS.map((c) => (
                <option key={c} value={c}>{CATEGORIA_LABEL[c]}</option>
              ))}
            </select>
          </div>

          <div className="min-w-[120px]">
            <label className="block text-xs text-slate-500 mb-1">Prioridade</label>
            <select
              value={filtros.prioridade}
              onChange={(e) => setFiltro('prioridade', e.target.value as Prioridade | '')}
              className="w-full border border-slate-300 rounded-lg px-3 py-1.5 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-teal-500"
            >
              <option value="">Todas</option>
              {PRIORIDADE_OPTIONS.map((p) => (
                <option key={p} value={p}>{PRIORIDADE_LABEL[p]}</option>
              ))}
            </select>
          </div>

          {temFiltro && (
            <button
              onClick={limparFiltros}
              className="text-xs text-slate-400 hover:text-slate-600 underline self-end pb-2"
            >
              Limpar filtros
            </button>
          )}
        </div>
      </div>

      {/* Tabela */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        {loading && (
          <div className="flex justify-center py-16"><Spinner /></div>
        )}

        {error && (
          <div className="p-6"><ErrorBanner message={error} onRetry={refetch} /></div>
        )}

        {!loading && !error && data?.data.length === 0 && (
          <EmptyState
            title="Nenhuma solicitação encontrada"
            description={temFiltro ? 'Tente ajustar os filtros.' : 'Registre a primeira solicitação de atendimento.'}
            action={
              !temFiltro && (
                <Button onClick={onNovaSolicitacao} size="sm">
                  Nova solicitação
                </Button>
              )
            }
          />
        )}

        {!loading && !error && data && data.data.length > 0 && (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50">
                  <th className="text-left text-xs font-medium text-slate-500 px-4 py-3">Protocolo</th>
                  <th className="text-left text-xs font-medium text-slate-500 px-4 py-3">Solicitante</th>
                  <th className="text-left text-xs font-medium text-slate-500 px-4 py-3 hidden sm:table-cell">Categoria</th>
                  <th className="text-left text-xs font-medium text-slate-500 px-4 py-3">Prioridade</th>
                  <th className="text-left text-xs font-medium text-slate-500 px-4 py-3">Status</th>
                  <th className="text-left text-xs font-medium text-slate-500 px-4 py-3 hidden md:table-cell">Data</th>
                  <th className="px-4 py-3"><span className="sr-only">Ações</span></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {data.data.map((s) => (
                  <tr
                    key={s.id}
                    className={`hover:bg-slate-50 transition-colors ${s.prioridade === 'URGENTE' ? 'bg-orange-50/40' : ''}`}
                  >
                    <td className="px-4 py-3">
                      <span className="font-mono text-xs text-slate-500">{s.protocolo}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="font-medium text-slate-700">{s.nome_solicitante}</span>
                    </td>
                    <td className="px-4 py-3 hidden sm:table-cell text-slate-500">
                      {CATEGORIA_LABEL[s.categoria]}
                    </td>
                    <td className="px-4 py-3">
                      <PrioridadeBadge prioridade={s.prioridade} />
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={s.status} />
                    </td>
                    <td className="px-4 py-3 text-slate-400 text-xs hidden md:table-cell">
                      {new Date(s.data_criacao).toLocaleDateString('pt-BR')}
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => onVerDetalhe(s.id)}
                        className="text-teal-600 hover:text-teal-800 text-xs font-medium focus:outline-none focus:underline"
                      >
                        Ver detalhes
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Paginação */}
        {data && data.meta.last_page > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-slate-100">
            <p className="text-xs text-slate-400">
              Página {data.meta.current_page} de {data.meta.last_page}
              {' · '}{data.meta.total} registros
            </p>
            <div className="flex gap-2">
              <Button
                variant="secondary"
                size="sm"
                disabled={data.meta.current_page <= 1}
                onClick={() => setFiltros((prev) => ({ ...prev, page: (prev.page ?? 1) - 1 }))}
              >
                Anterior
              </Button>
              <Button
                variant="secondary"
                size="sm"
                disabled={data.meta.current_page >= data.meta.last_page}
                onClick={() => setFiltros((prev) => ({ ...prev, page: (prev.page ?? 1) + 1 }))}
              >
                Próxima
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}