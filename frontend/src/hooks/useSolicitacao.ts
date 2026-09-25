import { useEffect, useReducer } from 'react'
import { buscarSolicitacao } from '../api/solicitacoes'
import type { Solicitacao } from '../types'

interface State {
  data: Solicitacao | null;
  loading: boolean;
  error: string | null;
}

type Action =
  | { type: 'LOADING' }
  | { type: 'SUCCESS'; payload: Solicitacao }
  | { type: 'ERROR'; payload: string };

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'LOADING': return { ...state, loading: true, error: null };
    case 'SUCCESS': return { data: action.payload, loading: false, error: null };
    case 'ERROR':   return { ...state, loading: false, error: action.payload };
  }
}

export function useSolicitacao(id: number | null) {
  const [state, dispatch] = useReducer(reducer, {
    data: null,
    loading: false,
    error: null,
  });

  useEffect(() => {
    if (id === null) return;
    let cancelled = false;

    dispatch({ type: 'LOADING' });
    buscarSolicitacao(id)
      .then((s) => { if (!cancelled) dispatch({ type: 'SUCCESS', payload: s }); })
      .catch(() => { if (!cancelled) dispatch({ type: 'ERROR', payload: 'Solicitação não encontrada.' }); });

    return () => { cancelled = true; };
  }, [id]);

  return state;
}