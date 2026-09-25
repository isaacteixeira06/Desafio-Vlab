import React, { useState } from 'react';
import { criarSolicitacao } from '../../api/solicitacoes';
import { extrairErrosApi } from '../../api/client';
import type { CriarSolicitacaoPayload, Categoria, Prioridade } from '../../types';
import { CATEGORIA_OPTIONS, CATEGORIA_LABEL, PRIORIDADE_OPTIONS, PRIORIDADE_LABEL } from '../../utils/constants';
import { Button, Field, inputClass } from '../ui';

interface FormularioSolicitacaoProps {
  onSucesso: (id: number) => void;
}

type FormData = {
  nome_solicitante: string;
  categoria: Categoria | '';
  prioridade: Prioridade | '';
  descricao: string;
  justificativa_prioridade: string;
};

type Erros = Partial<Record<keyof FormData, string>>;

const INICIAL: FormData = {
  nome_solicitante: '',
  categoria: '',
  prioridade: '',
  descricao: '',
  justificativa_prioridade: '',
};

export function FormularioSolicitacao({ onSucesso }: FormularioSolicitacaoProps) {
  const [form, setForm] = useState<FormData>(INICIAL);
  const [erros, setErros] = useState<Erros>({});
  const [erroGeral, setErroGeral] = useState('');
  const [loading, setLoading] = useState(false);
  const [sucesso, setSucesso] = useState(false);

  const set = (campo: keyof FormData) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    setForm((prev) => ({ ...prev, [campo]: e.target.value }));
    setErros((prev) => ({ ...prev, [campo]: undefined }));
    setErroGeral('');
  };

  function validarLocal(): boolean {
    const novos: Erros = {};
    if (!form.nome_solicitante.trim()) novos.nome_solicitante = 'Informe o nome do solicitante.';
    if (!form.categoria)              novos.categoria = 'Selecione uma categoria.';
    if (!form.prioridade)             novos.prioridade = 'Selecione a prioridade.';
    if (!form.descricao.trim())       novos.descricao = 'Descreva a solicitação.';
    if (form.prioridade === 'URGENTE' && !form.justificativa_prioridade.trim()) {
      novos.justificativa_prioridade = 'A justificativa é obrigatória para prioridade urgente.';
    }
    setErros(novos);
    return Object.keys(novos).length === 0;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validarLocal()) return;

    setLoading(true);
    setErroGeral('');

    const payload: CriarSolicitacaoPayload = {
      nome_solicitante:         form.nome_solicitante.trim(),
      categoria:                form.categoria as Categoria,
      prioridade:               form.prioridade as Prioridade,
      descricao:                form.descricao.trim(),
      justificativa_prioridade: form.prioridade === 'URGENTE' ? form.justificativa_prioridade.trim() : undefined,
    };

    try {
      const criada = await criarSolicitacao(payload);
      setSucesso(true);
      setTimeout(() => onSucesso(criada.id), 1200);
    } catch (err) {
      const { campo, geral } = extrairErrosApi(err);
      // Mapeia erros da API para campos do form
      const novos: Erros = {};
      for (const [k, msgs] of Object.entries(campo)) {
        novos[k as keyof FormData] = msgs[0];
      }
      setErros(novos);
      if (geral && Object.keys(campo).length === 0) setErroGeral(geral);
    } finally {
      setLoading(false);
    }
  }

  if (sucesso) {
    return (
      <div className="flex flex-col items-center justify-center py-16 gap-3">
        <div className="w-12 h-12 rounded-full bg-teal-100 flex items-center justify-center">
          <svg className="w-6 h-6 text-teal-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <p className="text-slate-700 font-medium">Solicitação registrada!</p>
        <p className="text-slate-400 text-sm">Redirecionando para os detalhes...</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-5">
      {erroGeral && (
        <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
          {erroGeral}
        </div>
      )}

      <Field label="Nome do solicitante" required error={erros.nome_solicitante}>
        <input
          type="text"
          value={form.nome_solicitante}
          onChange={set('nome_solicitante')}
          placeholder="Nome fictício do solicitante"
          className={inputClass(erros.nome_solicitante)}
          maxLength={150}
          autoComplete="off"
        />
      </Field>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <Field label="Categoria" required error={erros.categoria}>
          <select
            value={form.categoria}
            onChange={set('categoria')}
            className={inputClass(erros.categoria)}
          >
            <option value="">Selecione...</option>
            {CATEGORIA_OPTIONS.map((c) => (
              <option key={c} value={c}>{CATEGORIA_LABEL[c]}</option>
            ))}
          </select>
        </Field>

        <Field label="Prioridade" required error={erros.prioridade}>
          <select
            value={form.prioridade}
            onChange={set('prioridade')}
            className={inputClass(erros.prioridade)}
          >
            <option value="">Selecione...</option>
            {PRIORIDADE_OPTIONS.map((p) => (
              <option key={p} value={p}>{PRIORIDADE_LABEL[p]}</option>
            ))}
          </select>
        </Field>
      </div>

      <Field label="Descrição" required error={erros.descricao}>
        <textarea
          value={form.descricao}
          onChange={set('descricao')}
          placeholder="Descreva o motivo da solicitação de atendimento..."
          className={`${inputClass(erros.descricao)} resize-none`}
          rows={4}
          maxLength={2000}
        />
        <p className="mt-1 text-xs text-slate-400 text-right">
          {form.descricao.length}/2000
        </p>
      </Field>

      {form.prioridade === 'URGENTE' && (
        <Field
          label="Justificativa de prioridade urgente"
          required
          error={erros.justificativa_prioridade}
          hint="Obrigatório para solicitações urgentes."
        >
          <textarea
            value={form.justificativa_prioridade}
            onChange={set('justificativa_prioridade')}
            placeholder="Descreva o motivo da urgência..."
            className={`${inputClass(erros.justificativa_prioridade)} resize-none border-orange-300 focus:ring-orange-400`}
            rows={3}
            maxLength={1000}
          />
        </Field>
      )}

      <div className="flex items-center justify-end gap-3 pt-2 border-t border-slate-100">
        <Button type="submit" loading={loading}>
          Registrar solicitação
        </Button>
      </div>
    </form>
  );
}