import React, { useState } from 'react';
import { Layout } from './components/layout/Layout';
import { Dashboard } from './pages/Dashboard';
import { ListaSolicitacoes } from './pages/ListaSolicitacoes';
import { NovaSolicitacao } from './pages/NovaSolicitacao';
import { DetalheSolicitacao } from './components/solicitacao/DetalheSolicitacao';
import type { Status } from './types';

// ─── Estado de navegação ──────────────────────────────────────────────────────

type Pagina = 'dashboard' | 'listar' | 'nova';

interface NavState {
  pagina: Pagina;
  filtroStatus?: Status;
}

export default function App() {
  const [nav, setNav]           = useState<NavState>({ pagina: 'dashboard' });
  const [detalheId, setDetalheId] = useState<number | null>(null);
  const [listaKey, setListaKey] = useState(0); // força refresh da lista após atualização

  function navegar(pagina: Pagina, filtroStatus?: Status) {
    setNav({ pagina, filtroStatus });
  }

  function verDetalhe(id: number) {
    setDetalheId(id);
  }

  function fecharDetalhe() {
    setDetalheId(null);
  }

  function aposAtualizarStatus() {
    setListaKey((k) => k + 1);
  }

  function aposCriarSolicitacao(id: number) {
    // Vai para lista e abre o detalhe da recém-criada
    navegar('listar');
    setDetalheId(id);
  }

  return (
    <>
      <Layout paginaAtiva={nav.pagina} onNavegar={navegar}>
        {nav.pagina === 'dashboard' && (
          <Dashboard
            onVerLista={(status) => navegar('listar', status)}
            onVerDetalhe={verDetalhe}
          />
        )}

        {nav.pagina === 'listar' && (
          <ListaSolicitacoes
            key={listaKey}
            filtroInicial={{ status: nav.filtroStatus }}
            onVerDetalhe={verDetalhe}
            onNovaSolicitacao={() => navegar('nova')}
          />
        )}

        {nav.pagina === 'nova' && (
          <NovaSolicitacao
            onSucesso={aposCriarSolicitacao}
            onVoltar={() => navegar('listar')}
          />
        )}
      </Layout>

      {/* Modal de detalhe — renderizado acima do layout */}
      {detalheId !== null && (
        <DetalheSolicitacao
          id={detalheId}
          onFechar={fecharDetalhe}
          onAtualizado={aposAtualizarStatus}
        />
      )}
    </>
  );
}