import React, { useEffect, useState } from 'react';
import { listarSolicitacoes } from '../api/solicitacoes';
import type { Status, Solicitacao } from '../types';
import { STATUS_LABEL, STATUS_CARD_COLOR, STATUS_OPTIONS } from '../utils/constants';
import { StatusBadge, PrioridadeBadge, Spinner, ErrorBanner } from '../components/ui';

interface DashboardProps {
  onVerLista: (status?: Status) => void;
  onVerDetalhe: (id: number) => void;
}

interface Contagens {
  [key: string]: number;
}

export function Dashboard({ onVerLista, onVerDetalhe }: DashboardProps) {
  const [contagens, setContagens] = useState<Contagens>({});
  const [recentes, setRecentes] = useState<Solicitacao[]>([]);
  const [urgentes, setUrgentes] = useState<Solicitacao[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;
    setLoading(true);

    async function carregar() {
      try {
        // Busca todas para calcular contagens por status
        const [todasRes, urgentesRes] = await Promise.all([
          listarSolicitacoes({ per_page: 100 }),
          listarSolicitacoes({ prioridade: 'URGENTE', status: 'RECEBIDA', per_page: 5 }),
        ]);

        if (cancelled) return;

        // Agrupa contagens por status
        const c: Contagens = {};
        for (const s of STATUS_OPTIONS) c[s] = 0;
        for (const sol of todasRes.data) c[sol.status] = (c[sol.status] ?? 0) + 1;

        setContagens(c);
        setRecentes(todasRes.data.slice(0, 5));
        setUrgentes(urgentesRes.data);
      } catch {
        if (!cancelled) setError('Não foi possível carregar o painel.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    carregar();
    return () => { cancelled = true; };
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Spinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8">
        <ErrorBanner message={error} />
      </div>
    );
  }

  return (
    <div className="p-8 space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-xl font-semibold text-slate-800">Painel de atendimento</h1>
        <p className="text-slate-400 text-sm mt-0.5">Visão geral das solicitações registradas</p>
      </div>

      {/* KPIs por status */}
      <div>
        <h2 className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-3">
          Por status
        </h2>
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
          {STATUS_OPTIONS.map((s) => (
            <button
              key={s}
              onClick={() => onVerLista(s)}
              className={`text-left rounded-xl bg-white border-l-4 ${STATUS_CARD_COLOR[s]} px-4 py-3 shadow-sm hover:shadow-md transition-shadow focus:outline-none focus:ring-2 focus:ring-teal-500`}
            >
              <p className="text-2xl font-bold text-slate-800">{contagens[s] ?? 0}</p>
              <p className="text-xs text-slate-500 mt-0.5">{STATUS_LABEL[s]}</p>
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Urgentes pendentes */}
        <div>
          <h2 className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-3">
            Urgentes aguardando
          </h2>
          <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
            {urgentes.length === 0 ? (
              <p className="text-sm text-slate-400 px-4 py-6 text-center">
                Nenhuma solicitação urgente pendente.
              </p>
            ) : (
              <ul className="divide-y divide-slate-100">
                {urgentes.map((s) => (
                  <li key={s.id}>
                    <button
                      onClick={() => onVerDetalhe(s.id)}
                      className="w-full text-left px-4 py-3 hover:bg-slate-50 transition-colors flex items-center gap-3"
                    >
                      <span className="text-orange-500 text-base">⚠</span>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-slate-700 truncate">{s.nome_solicitante}</p>
                        <p className="text-xs text-slate-400 truncate">{s.protocolo}</p>
                      </div>
                      <StatusBadge status={s.status} />
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        {/* Recentes */}
        <div>
          <h2 className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-3">
            Registradas recentemente
          </h2>
          <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
            {recentes.length === 0 ? (
              <p className="text-sm text-slate-400 px-4 py-6 text-center">
                Nenhuma solicitação registrada ainda.
              </p>
            ) : (
              <ul className="divide-y divide-slate-100">
                {recentes.map((s) => (
                  <li key={s.id}>
                    <button
                      onClick={() => onVerDetalhe(s.id)}
                      className="w-full text-left px-4 py-3 hover:bg-slate-50 transition-colors"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-sm font-medium text-slate-700 truncate">{s.nome_solicitante}</p>
                        <StatusBadge status={s.status} />
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        <PrioridadeBadge prioridade={s.prioridade} />
                        <span className="text-xs text-slate-400">{s.protocolo}</span>
                      </div>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}