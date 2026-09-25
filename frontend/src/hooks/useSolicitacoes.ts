import { useCallback, useEffect, useReducer } from 'react';
import { listarSolicitacoes } from '../api/solicitacoes';
import type { ApiCollection, FiltrosSolicitacao, Solicitacao } from '../types';

// ─── Estado ───────────────────────────────────────────────────────────────────

interface State {
  data: ApiCollection<Solicitacao> | null;
  loading: boolean;
  error: string | null;
}

type Action =
  | { type: 'LOADING' }
  | { type: 'SUCCESS'; payload: ApiCollection<Solicitacao> }
  | { type: 'ERROR'; payload: string };

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'LOADING': return { ...state, loading: true, error: null };
    case 'SUCCESS': return { data: action.payload, loading: false, error: null };
    case 'ERROR':   return { ...state, loading: false, error: action.payload };
  }
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useSolicitacoes(filtros: FiltrosSolicitacao) {
  const [state, dispatch] = useReducer(reducer, {
    data: null,
    loading: true,
    error: null,
  });

  const buscar = useCallback(async () => {
    dispatch({ type: 'LOADING' });
    try {
      const result = await listarSolicitacoes(filtros);
      dispatch({ type: 'SUCCESS', payload: result });
    } catch {
      dispatch({ type: 'ERROR', payload: 'Não foi possível carregar as solicitações.' });
    }
  }, [JSON.stringify(filtros)]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    buscar();
  }, [buscar]);

  return { ...state, refetch: buscar };
}