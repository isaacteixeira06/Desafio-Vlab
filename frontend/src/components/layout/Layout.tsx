import React from 'react';

interface LayoutProps {
  children: React.ReactNode;
  paginaAtiva: 'dashboard' | 'listar' | 'nova';
  onNavegar: (pagina: 'dashboard' | 'listar' | 'nova') => void;
}

export function Layout({ children, paginaAtiva, onNavegar }: LayoutProps) {
  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Sidebar */}
      <aside className="w-56 shrink-0 bg-[#1B3A5C] flex flex-col">
        {/* Logo / Marca */}
        <div className="px-5 py-6 border-b border-white/10">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-teal-500 flex items-center justify-center shrink-0">
              <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <div>
              <p className="text-white font-semibold text-sm leading-tight">Atendimento</p>
              <p className="text-blue-200 text-xs leading-tight">Saúde Pública</p>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-1" aria-label="Menu principal">
          <NavItem
            icon={<DashboardIcon />}
            label="Painel"
            active={paginaAtiva === 'dashboard'}
            onClick={() => onNavegar('dashboard')}
          />
          <NavItem
            icon={<ListIcon />}
            label="Solicitações"
            active={paginaAtiva === 'listar'}
            onClick={() => onNavegar('listar')}
          />
          <NavItem
            icon={<PlusIcon />}
            label="Nova solicitação"
            active={paginaAtiva === 'nova'}
            onClick={() => onNavegar('nova')}
          />
        </nav>

        <div className="px-5 py-4 border-t border-white/10">
          <p className="text-blue-300 text-xs">V-Lab · CIn UFPE</p>
        </div>
      </aside>

      {/* Conteúdo */}
      <main className="flex-1 min-w-0 overflow-auto">
        {children}
      </main>
    </div>
  );
}

// ─── NavItem ──────────────────────────────────────────────────────────────────

interface NavItemProps {
  icon: React.ReactNode;
  label: string;
  active: boolean;
  onClick: () => void;
}

function NavItem({ icon, label, active, onClick }: NavItemProps) {
  return (
    <button
      onClick={onClick}
      aria-current={active ? 'page' : undefined}
      className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors text-left
        ${active
          ? 'bg-white/15 text-white'
          : 'text-blue-200 hover:bg-white/10 hover:text-white'
        }`}
    >
      <span className="w-4 h-4 shrink-0">{icon}</span>
      {label}
    </button>
  );
}

// ─── Ícones inline ────────────────────────────────────────────────────────────

const DashboardIcon = () => (
  <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
    <path d="M2 4a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 01-1 1H3a1 1 0 01-1-1V4zM8 4a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 01-1 1H9a1 1 0 01-1-1V4zM14 4a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 01-1 1h-2a1 1 0 01-1-1V4zM2 10a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 01-1 1H3a1 1 0 01-1-1v-2zM8 10a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 01-1 1H9a1 1 0 01-1-1v-2zM14 10a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 01-1 1h-2a1 1 0 01-1-1v-2z" />
  </svg>
);

const ListIcon = () => (
  <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
    <path fillRule="evenodd" d="M3 4a1 1 0 000 2h14a1 1 0 100-2H3zm0 4a1 1 0 000 2h14a1 1 0 100-2H3zm0 4a1 1 0 000 2h14a1 1 0 100-2H3z" clipRule="evenodd" />
  </svg>
);

const PlusIcon = () => (
  <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
    <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
  </svg>
);