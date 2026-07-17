"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Logo } from "@/components/marketing/logo";
import { Button } from "@/components/ui/button";
import { Field, Input } from "@/components/ui/input";
import { useAuth } from "@/components/app/auth";
import { ApiError } from "@/lib/api";

export default function LoginPage() {
  const { entrar } = useAuth();
  const router = useRouter();
  const [form, setForm] = React.useState({
    tenant_slug: "",
    email: "",
    password: "",
    totp_code: "",
  });
  const [erro, setErro] = React.useState<string | null>(null);
  const [enviando, setEnviando] = React.useState(false);

  const set =
    (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
      setForm((f) => ({ ...f, [k]: e.target.value }));

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErro(null);
    setEnviando(true);
    try {
      await entrar({
        tenant_slug: form.tenant_slug,
        email: form.email,
        password: form.password,
        totp_code: form.totp_code || undefined,
      });
      router.push("/briefing");
    } catch (err) {
      setErro(
        err instanceof ApiError
          ? `${err.status} · ${err.message}`
          : "falha de rede — o POC está acessível?"
      );
    } finally {
      setEnviando(false);
    }
  }

  return (
    <div className="grid min-h-screen place-items-center bg-bg-0 px-5">
      <div className="w-full max-w-sm">
        <div className="mb-6 flex flex-col items-center gap-2">
          <Link href="/" aria-label="Início">
            <Logo className="text-lg" />
          </Link>
          <p className="text-[12px] font-medium uppercase tracking-[0.08em] text-accent-300">
            Console clínico
          </p>
        </div>

        <div className="rounded-md border border-border bg-bg-1 p-6">
          <h1 className="font-serif text-[22px] font-semibold tracking-[-0.01em] text-text-1">
            Entrar
          </h1>
          <p className="mt-1 text-[13px] text-text-3">
            POC · dados fake · a sessão vive só em memória (recarregar = sair).
          </p>

          <form onSubmit={onSubmit} className="mt-5 flex flex-col gap-4">
            <Field label="Clínica" htmlFor="tenant">
              <Input
                id="tenant"
                value={form.tenant_slug}
                onChange={set("tenant_slug")}
                placeholder="slug da clínica"
                autoComplete="organization"
                required
              />
            </Field>
            <Field label="E-mail" htmlFor="email">
              <Input
                id="email"
                type="email"
                value={form.email}
                onChange={set("email")}
                placeholder="voce@clinica.com.br"
                autoComplete="username"
                required
              />
            </Field>
            <Field label="Senha" htmlFor="senha">
              <Input
                id="senha"
                type="password"
                value={form.password}
                onChange={set("password")}
                autoComplete="current-password"
                required
              />
            </Field>
            <Field
              label="Código MFA"
              htmlFor="totp"
              hint="obrigatório para perfis clínicos (TOTP de 6 dígitos)"
            >
              <Input
                id="totp"
                inputMode="numeric"
                value={form.totp_code}
                onChange={set("totp_code")}
                placeholder="000000"
              />
            </Field>

            {erro && (
              <p className="rounded-sm border border-[color-mix(in_srgb,var(--danger)_35%,transparent)] bg-[color-mix(in_srgb,var(--danger)_12%,transparent)] px-3 py-2 text-[12.5px] text-[var(--danger)]">
                ✕ {erro}
              </p>
            )}

            <Button type="submit" disabled={enviando} className="w-full">
              {enviando ? "Entrando…" : "Entrar"}
            </Button>
          </form>
        </div>

        <p className="mt-4 text-center text-[12px] text-text-3">
          Backend: FastAPI no VPS (proxy /api/poc) · RBAC + RLS por clínica
        </p>
      </div>
    </div>
  );
}
