import React from 'react';
import { FormularioSolicitacao } from '../components/solicitacao/FormularioSolicitacao';

interface NovaSolicitacaoProps {
  onSucesso: (id: number) => void;
  onVoltar: () => void;
}

export function NovaSolicitacao({ onSucesso, onVoltar }: NovaSolicitacaoProps) {
  return (
    <div className="p-8 max-w-2xl">
      <div className="flex items-center gap-3 mb-6">
        <button
          onClick={onVoltar}
          className="text-slate-400 hover:text-slate-600 transition-colors focus:outline-none"
          aria-label="Voltar"
        >
          <svg className="w-5 h-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
          </svg>
        </button>
        <div>
          <h1 className="text-xl font-semibold text-slate-800">Nova solicitação</h1>
          <p className="text-slate-400 text-sm">Preencha os dados para registrar o atendimento</p>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 p-6">
        <FormularioSolicitacao onSucesso={onSucesso} />
      </div>
    </div>
  );
}