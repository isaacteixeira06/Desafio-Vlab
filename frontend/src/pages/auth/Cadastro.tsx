import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { extrairErrosApi } from '../../api/client';
import { Button, Field, inputClass } from '../../components/ui';
import { AuthShell } from './Login';

interface CadastroProps {
  onIrParaLogin: () => void;
}

type FormData = {
  name: string;
  email: string;
  password: string;
  password_confirmation: string;
};

type Erros = Partial<Record<keyof FormData, string>>;

export function Cadastro({ onIrParaLogin }: CadastroProps) {
  const { register } = useAuth();

  const [form, setForm]         = useState<FormData>({ name: '', email: '', password: '', password_confirmation: '' });
  const [erros, setErros]       = useState<Erros>({});
  const [erroGeral, setErroGeral] = useState('');
  const [loading, setLoading]   = useState(false);

  const set = (campo: keyof FormData) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((prev) => ({ ...prev, [campo]: e.target.value }));
    setErros((prev) => ({ ...prev, [campo]: undefined }));
    setErroGeral('');
  };

  function validar(): boolean {
    const novos: Erros = {};
    if (!form.name.trim())                        novos.name = 'Informe seu nome.';
    if (!form.email.trim())                        novos.email = 'Informe o e-mail.';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) novos.email = 'E-mail inválido.';
    if (!form.password)                            novos.password = 'Crie uma senha.';
    else if (form.password.length < 8)             novos.password = 'A senha deve ter pelo menos 8 caracteres.';
    if (!form.password_confirmation)               novos.password_confirmation = 'Confirme a senha.';
    else if (form.password !== form.password_confirmation) novos.password_confirmation = 'As senhas não conferem.';
    setErros(novos);
    return Object.keys(novos).length === 0;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validar()) return;

    setLoading(true);
    setErroGeral('');

    try {
      await register({
        name:                  form.name.trim(),
        email:                 form.email.trim(),
        password:              form.password,
        password_confirmation: form.password_confirmation,
      });
      // AuthContext atualiza user → App redireciona automaticamente
    } catch (err) {
      const { campo, geral } = extrairErrosApi(err);
      const mapeados: Erros = {};
      for (const [k, msgs] of Object.entries(campo)) {
        mapeados[k as keyof FormData] = msgs[0];
      }
      setErros(mapeados);
      if (geral && Object.keys(campo).length === 0) setErroGeral(geral);
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthShell titulo="Criar conta" subtitulo="Sistema de Solicitações de Atendimento">
      <form onSubmit={handleSubmit} noValidate className="space-y-4">
        {erroGeral && (
          <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
            {erroGeral}
          </div>
        )}

        <Field label="Nome completo" required error={erros.name}>
          <input
            type="text"
            value={form.name}
            onChange={set('name')}
            placeholder="Seu nome"
            className={inputClass(erros.name)}
            autoComplete="name"
            autoFocus
            maxLength={100}
          />
        </Field>

        <Field label="E-mail" required error={erros.email}>
          <input
            type="email"
            value={form.email}
            onChange={set('email')}
            placeholder="seu@email.com"
            className={inputClass(erros.email)}
            autoComplete="email"
            maxLength={150}
          />
        </Field>

        <Field label="Senha" required error={erros.password} hint="Mínimo de 8 caracteres.">
          <input
            type="password"
            value={form.password}
            onChange={set('password')}
            placeholder="••••••••"
            className={inputClass(erros.password)}
            autoComplete="new-password"
          />
        </Field>

        <Field label="Confirmar senha" required error={erros.password_confirmation}>
          <input
            type="password"
            value={form.password_confirmation}
            onChange={set('password_confirmation')}
            placeholder="••••••••"
            className={inputClass(erros.password_confirmation)}
            autoComplete="new-password"
          />
        </Field>

        <Button type="submit" loading={loading} className="w-full justify-center mt-2">
          Criar conta
        </Button>
      </form>

      <p className="mt-5 text-center text-sm text-slate-500">
        Já tem conta?{' '}
        <button
          type="button"
          onClick={onIrParaLogin}
          className="text-teal-600 font-medium hover:underline focus:outline-none"
        >
          Entrar
        </button>
      </p>
    </AuthShell>
  );
}