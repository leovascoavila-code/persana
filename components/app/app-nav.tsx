"use client";

/** Nav agrupada da casca Tinta. 18 telas -> 2 links diretos + 4 grupos com
 * dropdown (Clínica / Comercial / Jornada / Gestão). Dropdown leve: estado React
 * + click-outside, zero dependência. */
import * as React from "react";
import Link from "next/link";

type Item = { key: string; label: string; href: string };

// metadados de TODAS as telas (a fonte do type AppTab)
const TELAS = {
  hoje: { label: "Hoje", href: "/hoje" },
  pacientes: { label: "Pacientes", href: "/pacientes" },
  agenda: { label: "Agenda", href: "/agenda" },
  consulta: { label: "Consulta", href: "/consulta" },
  exames: { label: "Exames", href: "/exames" },
  proms: { label: "PROMs", href: "/proms" },
  briefing: { label: "Briefing", href: "/briefing" },
  instrumento: { label: "Instrumental", href: "/instrumento" },
  biblioteca: { label: "Biblioteca", href: "/biblioteca" },
  planos: { label: "Planos", href: "/planos" },
  cobranca: { label: "Cobrança", href: "/cobranca" },
  crm: { label: "CRM", href: "/crm" },
  cadencias: { label: "Cadências", href: "/cadencias" },
  automacoes: { label: "Automações", href: "/automacoes" },
  dashboard: { label: "ROI", href: "/dashboard" },
  relatorios: { label: "Relatórios", href: "/relatorios" },
  metas: { label: "Metas", href: "/metas" },
  modulos: { label: "Módulos", href: "/modulos" },
} as const;

export type AppTab = keyof typeof TELAS;

const it = (k: AppTab): Item => ({ key: k, ...TELAS[k] });

// 2 links diretos + 4 grupos
const DIRETO_INICIO = it("hoje");
const DIRETO_FIM = it("modulos");

const GRUPOS: { label: string; itens: Item[] }[] = [
  { label: "Clínica", itens: (["pacientes", "agenda", "consulta", "exames", "proms", "briefing", "instrumento", "biblioteca"] as AppTab[]).map(it) },
  { label: "Comercial", itens: (["planos", "cobranca"] as AppTab[]).map(it) },
  { label: "Jornada", itens: (["crm", "cadencias", "automacoes"] as AppTab[]).map(it) },
  { label: "Gestão", itens: (["dashboard", "relatorios", "metas"] as AppTab[]).map(it) },
];

const linkBase = "rounded-sm px-[11px] py-[5px] text-[12.5px] transition-colors";
const linkAtivo = "bg-bg-2 text-text-1";
const linkInativo = "text-text-3 hover:text-text-1";

export function AppNav({ active }: { active: AppTab }) {
  const [aberto, setAberto] = React.useState<string | null>(null);
  const ref = React.useRef<HTMLElement>(null);

  React.useEffect(() => {
    if (!aberto) return;
    function onDoc(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setAberto(null);
    }
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, [aberto]);

  return (
    <nav ref={ref} className="ml-3.5 flex items-center gap-1">
      <Link
        href={DIRETO_INICIO.href}
        aria-current={active === DIRETO_INICIO.key ? "page" : undefined}
        className={`${linkBase} ${active === DIRETO_INICIO.key ? linkAtivo : linkInativo}`}
      >
        {DIRETO_INICIO.label}
      </Link>

      {GRUPOS.map((g) => {
        const ativoNoGrupo = g.itens.some((i) => i.key === active);
        const open = aberto === g.label;
        return (
          <div key={g.label} className="relative">
            <button
              type="button"
              aria-expanded={open}
              aria-haspopup="menu"
              onClick={() => setAberto(open ? null : g.label)}
              className={`${linkBase} flex items-center gap-1 ${ativoNoGrupo || open ? linkAtivo : linkInativo}`}
            >
              {g.label}
              <span aria-hidden className={`text-[9px] transition-transform ${open ? "rotate-180" : ""}`}>
                ▾
              </span>
            </button>
            {open && (
              <div
                role="menu"
                className="absolute left-0 top-[calc(100%+6px)] z-50 min-w-[168px] overflow-hidden rounded-md border border-border bg-bg-1 py-1 shadow-lg"
              >
                {g.itens.map((i) => (
                  <Link
                    key={i.key}
                    href={i.href}
                    role="menuitem"
                    aria-current={i.key === active ? "page" : undefined}
                    onClick={() => setAberto(null)}
                    className={`block px-3 py-1.5 text-[12.5px] transition-colors ${
                      i.key === active ? "bg-bg-2 text-text-1" : "text-text-2 hover:bg-bg-2 hover:text-text-1"
                    }`}
                  >
                    {i.label}
                  </Link>
                ))}
              </div>
            )}
          </div>
        );
      })}

      <Link
        href={DIRETO_FIM.href}
        aria-current={active === DIRETO_FIM.key ? "page" : undefined}
        className={`${linkBase} ${active === DIRETO_FIM.key ? linkAtivo : linkInativo}`}
      >
        {DIRETO_FIM.label}
      </Link>
    </nav>
  );
}
