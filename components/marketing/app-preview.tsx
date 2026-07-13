import { Logo } from "./logo";
import { StatTile } from "@/components/ui/stat-tile";
import { RevenueCard } from "@/components/app/revenue-card";

const TABS = ["Visão geral", "Pacientes", "Protocolos"];

/** Preview ilustrativo do app (mundo Tinta) dentro do hero de marketing. */
export function AppPreview() {
  return (
    <div className="mx-auto mt-14 max-w-[1000px] overflow-hidden rounded-t-lg border border-border-strong bg-bg-1 shadow-[var(--shadow-2)]">
      {/* topbar */}
      <div className="flex items-center gap-3 border-b border-border px-[18px] py-3">
        <Logo className="text-base" />
        <nav className="ml-3.5 flex gap-1">
          {TABS.map((t, i) => (
            <span
              key={t}
              className={
                i === 0
                  ? "rounded-sm bg-bg-2 px-[11px] py-[5px] text-[12.5px] text-text-1"
                  : "rounded-sm px-[11px] py-[5px] text-[12.5px] text-text-3"
              }
            >
              {t}
            </span>
          ))}
        </nav>
      </div>

      {/* corpo — números ilustrativos */}
      <div className="px-5 py-[22px]">
        <div className="mb-3 grid grid-cols-1 gap-3 sm:grid-cols-3">
          <StatTile label="Pacientes ativos" value="1.284" delta="3,1% vs. mês anterior" />
          <StatTile label="Protocolos em curso" value="342" delta="8 novos esta semana" />
          <StatTile label="Exames analisados" value="96%" delta="recall da extração por IA" trend="flat" />
        </div>

        <RevenueCard />
      </div>
    </div>
  );
}
