import Link from "next/link";
import { Logo } from "@/components/marketing/logo";
import { SessionChip } from "@/components/app/auth";

const TABS = [
  { key: "hoje", label: "Hoje", href: "/hoje" },
  { key: "pacientes", label: "Pacientes", href: "/pacientes" },
  { key: "biblioteca", label: "Biblioteca", href: "/biblioteca" },
  { key: "planos", label: "Planos", href: "/planos" },
  { key: "cobranca", label: "Cobrança", href: "/cobranca" },
  { key: "crm", label: "CRM", href: "/crm" },
  { key: "cadencias", label: "Cadências", href: "/cadencias" },
  { key: "proms", label: "PROMs", href: "/proms" },
  { key: "consulta", label: "Consulta", href: "/consulta" },
  { key: "dashboard", label: "Visão geral", href: "/dashboard" },
  { key: "agenda", label: "Agenda", href: "/agenda" },
  { key: "briefing", label: "Briefing", href: "/briefing" },
  { key: "instrumento", label: "Instrumental", href: "/instrumento" },
  { key: "modulos", label: "Módulos", href: "/modulos" },
] as const;

export type AppTab = (typeof TABS)[number]["key"];

/** Casca do app (mundo Tinta): topbar + área de conteúdo. */
export function AppShell({
  children,
  active = "dashboard",
}: {
  children: React.ReactNode;
  active?: AppTab;
}) {
  return (
    <div className="flex min-h-screen flex-col bg-bg-0">
      <header className="sticky top-0 z-40 border-b border-border bg-bg-1/90 backdrop-blur-md">
        <div className="mx-auto flex max-w-[1120px] items-center gap-3 px-5 py-3 md:px-8">
          <Link href="/" aria-label="Início">
            <Logo className="text-base" />
          </Link>
          <nav className="ml-3.5 flex gap-1">
            {TABS.map((t) => (
              <Link
                key={t.key}
                href={t.href}
                aria-current={t.key === active ? "page" : undefined}
                className={
                  t.key === active
                    ? "rounded-sm bg-bg-2 px-[11px] py-[5px] text-[12.5px] text-text-1"
                    : "rounded-sm px-[11px] py-[5px] text-[12.5px] text-text-3 transition-colors hover:text-text-1"
                }
              >
                {t.label}
              </Link>
            ))}
          </nav>
          <div className="ml-auto flex items-center gap-3">
            <SessionChip />
            <span className="hidden text-[13px] text-text-3 sm:inline">
              Minas Pharma
            </span>
            <span
              aria-hidden
              className="grid h-8 w-8 place-items-center rounded-full bg-accent-wash font-serif text-[13px] font-semibold text-accent-300"
            >
              MP
            </span>
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-[1120px] flex-1 px-5 py-8 md:px-8">
        {children}
      </main>
    </div>
  );
}
