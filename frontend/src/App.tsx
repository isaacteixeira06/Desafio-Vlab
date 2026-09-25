import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Layout } from './components/layout/Layout';
import { Dashboard } from './pages/Dashboard';
import { ListaSolicitacoes } from './pages/ListaSolicitacoes';
import { NovaSolicitacao } from './pages/NovaSolicitacao';
import { DetalheSolicitacao } from './components/solicitacao/DetalheSolicitacao';
import { Login } from './pages/auth/Login';
import { Cadastro } from './pages/auth/Cadastro';
import { Spinner } from './components/ui';
import type { Status } from './types';

type Pagina = 'dashboard' | 'listar' | 'nova';
type PaginaAuth = 'login' | 'cadastro';

// ─── Roteador interno (sem react-router, por simplicidade) ────────────────────

function AppRouter() {
  const { isAuthenticated, loading } = useAuth();

  const [paginaAuth, setPaginaAuth] = useState<PaginaAuth>('login');
  const [nav, setNav]               = useState<{ pagina: Pagina; filtroStatus?: Status }>({ pagina: 'dashboard' });
  const [detalheId, setDetalheId]   = useState<number | null>(null);
  const [listaKey, setListaKey]     = useState(0);

  // Enquanto restaura sessão do localStorage
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Spinner size="lg" />
      </div>
    );
  }

  // Não autenticado → tela de login ou cadastro
  if (!isAuthenticated) {
    return paginaAuth === 'login'
      ? <Login onIrParaCadastro={() => setPaginaAuth('cadastro')} />
      : <Cadastro onIrParaLogin={() => setPaginaAuth('login')} />;
  }

  // Autenticado → app principal
  return (
    <>
      <Layout paginaAtiva={nav.pagina} onNavegar={(p) => setNav({ pagina: p })}>
        {nav.pagina === 'dashboard' && (
          <Dashboard
            onVerLista={(status) => setNav({ pagina: 'listar', filtroStatus: status })}
            onVerDetalhe={setDetalheId}
          />
        )}
        {nav.pagina === 'listar' && (
          <ListaSolicitacoes
            key={listaKey}
            filtroInicial={{ status: nav.filtroStatus }}
            onVerDetalhe={setDetalheId}
            onNovaSolicitacao={() => setNav({ pagina: 'nova' })}
          />
        )}
        {nav.pagina === 'nova' && (
          <NovaSolicitacao
            onSucesso={(id) => { setNav({ pagina: 'listar' }); setDetalheId(id); }}
            onVoltar={() => setNav({ pagina: 'listar' })}
          />
        )}
      </Layout>

      {detalheId !== null && (
        <DetalheSolicitacao
          id={detalheId}
          onFechar={() => setDetalheId(null)}
          onAtualizado={() => setListaKey((k) => k + 1)}
        />
      )}
    </>
  );
}

// ─── Root com provider ────────────────────────────────────────────────────────

export default function App() {
  return (
    <AuthProvider>
      <AppRouter />
    </AuthProvider>
  );
}