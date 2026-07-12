import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { AppShell } from "@/components/app/app-shell";
import { Badge } from "@/components/ui/badge";
import { Card, CardBody, CardHeader, CardTitle } from "@/components/ui/card";
import { MODULES, POC_BASE, STATUS_META, getModule } from "@/lib/modules";

export const dynamicParams = false;

export function generateStaticParams() {
  return MODULES.map((m) => ({ slug: m.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const mod = getModule(slug);
  return { title: mod ? `Persana — ${mod.nome}` : "Persana — Módulo" };
}

const FRONT_LABEL: Record<string, string> = {
  nenhum: "Sem interface no Persana ainda",
  parcial: "Interface parcial no Persana",
  pronto: "Interface pronta no Persana",
};

export default async function ModuloPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const mod = getModule(slug);
  if (!mod) notFound();

  const meta = STATUS_META[mod.status];

  return (
    <AppShell active="modulos">
      <div className="mb-6">
        <Link
          href="/modulos"
          className="text-[12.5px] text-text-3 transition-colors hover:text-text-1"
        >
          ← Módulos
        </Link>
        <div className="mt-2 flex flex-wrap items-center gap-3">
          <h1 className="font-serif text-[28px] font-semibold tracking-[-0.01em] text-text-1">
            {mod.nome}
          </h1>
          <Badge variant={meta.badge}>{meta.label}</Badge>
        </div>
        <p className="mt-2 max-w-[720px] text-sm leading-relaxed text-text-2">
          {mod.resumo}
        </p>
        <div className="mt-3 flex flex-wrap items-center gap-2 text-[12px] text-text-3">
          <span>{mod.grupo}</span>
          {mod.backend ? (
            <>
              <span aria-hidden>·</span>
              <code className="rounded-sm bg-bg-2 px-1.5 py-0.5 font-mono text-[11.5px]">
                {mod.backend}
              </code>
            </>
          ) : null}
          <span aria-hidden>·</span>
          <span>{FRONT_LABEL[mod.frontPersana]}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>✓ Entregue</CardTitle>
          </CardHeader>
          <CardBody>
            {mod.entregue.length === 0 ? (
              <p className="text-[13px] text-text-3">
                Nada construído ainda — módulo em planejamento.
              </p>
            ) : (
              <ul className="space-y-2">
                {mod.entregue.map((item) => (
                  <li
                    key={item}
                    className="flex gap-2 text-[13px] leading-relaxed text-text-2"
                  >
                    <span aria-hidden className="text-[var(--success)]">
                      ✓
                    </span>
                    {item}
                  </li>
                ))}
              </ul>
            )}
          </CardBody>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>○ Falta</CardTitle>
          </CardHeader>
          <CardBody>
            {mod.faltas.length === 0 ? (
              <p className="text-[13px] text-text-3">Sem pendências mapeadas.</p>
            ) : (
              <ul className="space-y-2">
                {mod.faltas.map((item) => (
                  <li
                    key={item}
                    className="flex gap-2 text-[13px] leading-relaxed text-text-2"
                  >
                    <span aria-hidden className="text-text-3">
                      ○
                    </span>
                    {item}
                  </li>
                ))}
              </ul>
            )}
          </CardBody>
        </Card>
      </div>

      {mod.pocPath ? (
        <Card className="mt-3">
          <CardHeader>
            <CardTitle>Interface atual (POC)</CardTitle>
          </CardHeader>
          <CardBody>
            <p className="text-[13px] leading-relaxed text-text-2">
              Este módulo já tem uma interface provisória servida pelo backend
              (React inline, fora do design Persana). Ela é o mapa do que portar
              para cá.
            </p>
            <a
              href={`${POC_BASE}${mod.pocPath}`}
              target="_blank"
              rel="noreferrer"
              className="mt-2 inline-block text-[13px] font-medium text-brand-300 underline-offset-4 hover:underline"
            >
              Abrir POC em {POC_BASE}
              {mod.pocPath} ↗
            </a>
            <p className="mt-2 text-[12px] text-text-3">
              Ambiente de demonstração (dados fictícios, HTTP). Será substituído
              por persana.com.br no deploy F6.
            </p>
          </CardBody>
        </Card>
      ) : null}
    </AppShell>
  );
}
