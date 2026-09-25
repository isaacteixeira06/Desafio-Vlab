import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { extrairErrosApi } from '../../api/client';
import { Button, Field, inputClass } from '../../components/ui';

interface LoginProps {
  onIrParaCadastro: () => void;
}

export function Login({ onIrParaCadastro }: LoginProps) {
  const { login } = useAuth();

  const [email, setEmail]       = useState('');
  const [senha, setSenha]       = useState('');
  const [erros, setErros]       = useState<Record<string, string>>({});
  const [erroGeral, setErroGeral] = useState('');
  const [loading, setLoading]   = useState(false);

  function validar(): boolean {
    const novos: Record<string, string> = {};
    if (!email.trim())  novos.email = 'Informe o e-mail.';
    if (!senha)         novos.senha = 'Informe a senha.';
    setErros(novos);
    return Object.keys(novos).length === 0;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validar()) return;

    setLoading(true);
    setErroGeral('');

    try {
      await login({ email: email.trim(), password: senha });
      // AuthContext atualiza user → App redireciona automaticamente
    } catch (err) {
      const { campo, geral } = extrairErrosApi(err);
      const mapeados: Record<string, string> = {};
      for (const [k, msgs] of Object.entries(campo)) {
        mapeados[k] = msgs[0];
      }
      setErros(mapeados);
      if (geral && Object.keys(campo).length === 0) setErroGeral(geral);
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthShell titulo="Entrar na conta" subtitulo="Sistema de Solicitações de Atendimento">
      <form onSubmit={handleSubmit} noValidate className="space-y-4">
        {erroGeral && (
          <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
            {erroGeral}
          </div>
        )}

        <Field label="E-mail" required error={erros.email}>
          <input
            type="email"
            value={email}
            onChange={(e) => { setEmail(e.target.value); setErros((p) => ({ ...p, email: '' })); }}
            placeholder="seu@email.com"
            className={inputClass(erros.email)}
            autoComplete="email"
            autoFocus
          />
        </Field>

        <Field label="Senha" required error={erros.senha}>
          <input
            type="password"
            value={senha}
            onChange={(e) => { setSenha(e.target.value); setErros((p) => ({ ...p, senha: '' })); }}
            placeholder="••••••••"
            className={inputClass(erros.senha)}
            autoComplete="current-password"
          />
        </Field>

        <Button type="submit" loading={loading} className="w-full justify-center mt-2">
          Entrar
        </Button>
      </form>

      {/* Credencial demo */}
      <div className="mt-4 rounded-lg bg-blue-50 border border-blue-100 px-4 py-3">
        <p className="text-xs text-blue-700 font-medium mb-1">Conta de demonstração</p>
        <p className="text-xs text-blue-600">E-mail: <span className="font-mono">demo@vlab.dev</span></p>
        <p className="text-xs text-blue-600">Senha: <span className="font-mono">senha1234</span></p>
      </div>

      <p className="mt-5 text-center text-sm text-slate-500">
        Não tem conta?{' '}
        <button
          type="button"
          onClick={onIrParaCadastro}
          className="text-teal-600 font-medium hover:underline focus:outline-none"
        >
          Cadastre-se
        </button>
      </p>
    </AuthShell>
  );
}

// ─── Shell compartilhado das páginas de auth ──────────────────────────────────

function AuthShell({ titulo, subtitulo, children }: {
  titulo: string;
  subtitulo: string;
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="flex items-center gap-3 mb-8 justify-center">
          <div className="w-10 h-10 rounded-xl bg-[#1B3A5C] flex items-center justify-center">
            <div className="w-5 h-5 rounded-md bg-teal-400 flex items-center justify-center">
              <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5}
                  d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
          </div>
          <div>
            <p className="text-slate-800 font-semibold text-sm leading-tight">V-Lab · CIn UFPE</p>
            <p className="text-slate-400 text-xs leading-tight">{subtitulo}</p>
          </div>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 px-6 py-7">
          <h1 className="text-lg font-semibold text-slate-800 mb-5">{titulo}</h1>
          {children}
        </div>
      </div>
    </div>
  );
}

export { AuthShell };