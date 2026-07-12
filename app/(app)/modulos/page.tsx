import type { Metadata } from "next";
import Link from "next/link";
import { AppShell } from "@/components/app/app-shell";
import { Badge } from "@/components/ui/badge";
import { Card, CardBody, CardHeader, CardTitle } from "@/components/ui/card";
import { StatTile } from "@/components/ui/stat-tile";
import { MODULES, STATUS_META, modulesByGroup } from "@/lib/modules";

export const metadata: Metadata = {
  title: "Persana — Módulos",
};

export default function ModulosPage() {
  const grupos = modulesByGroup();
  const total = MODULES.length;
  const live = MODULES.filter((m) => m.status === "live").length;
  const prontos = MODULES.filter((m) => m.status === "pronto").length;
  const comFront = MODULES.filter((m) => m.frontPersana !== "nenhum").length;

  return (
    <AppShell active="modulos">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-serif text-[28px] font-semibold tracking-[-0.01em] text-text-1">
            Módulos
          </h1>
          <p className="mt-1 text-sm text-text-3">
            Mapa vivo do produto: o que existe no backend, o que já tem interface
            e o que falta lapidar em cada módulo.
          </p>
        </div>
        <Badge variant="brand">persana.com.br</Badge>
      </div>

      <div className="mb-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatTile label="Módulos mapeados" value={String(total)} />
        <StatTile label="Live no VPS" value={String(live)} />
        <StatTile label="Código pronto" value={String(prontos)} />
        <StatTile label="Com interface Persana" value={`${comFront}/${total}`} />
      </div>

      {grupos.map(({ grupo, modules }) => (
        <section key={grupo} className="mb-8">
          <h2 className="mb-3 text-[13.5px] font-semibold text-text-1">
            {grupo}
            <span className="ml-2 font-normal text-text-3">
              {modules.length} {modules.length === 1 ? "módulo" : "módulos"}
            </span>
          </h2>
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
            {modules.map((m) => {
              const meta = STATUS_META[m.status];
              return (
                <Link
                  key={m.slug}
                  href={`/modulos/${m.slug}`}
                  className="group rounded-md focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-500"
                >
                  <Card className="h-full transition-colors group-hover:border-border-strong">
                    <CardHeader className="flex flex-wrap items-start justify-between gap-2">
                      <CardTitle className="leading-snug">{m.nome}</CardTitle>
                      <Badge variant={meta.badge} className="shrink-0">
                        {meta.label}
                      </Badge>
                    </CardHeader>
                    <CardBody>
                      <p className="text-[13px] leading-relaxed text-text-2">
                        {m.resumo}
                      </p>
                      <p className="mt-3 text-[12px] text-text-3">
                        {m.entregue.length} entregue
                        {m.entregue.length === 1 ? "" : "s"} ·{" "}
                        {m.faltas.length} pendente
                        {m.faltas.length === 1 ? "" : "s"}
                      </p>
                    </CardBody>
                  </Card>
                </Link>
              );
            })}
          </div>
        </section>
      ))}
    </AppShell>
  );
}
