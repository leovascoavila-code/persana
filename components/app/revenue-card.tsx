import { RevenueChart } from "./revenue-chart";

/**
 * Cartão de grafico reutilizado no preview de marketing e no dashboard.
 * Rotulos ilustrativos da jornada clinica (series 1 = verde, series 2 = azul).
 */
export function RevenueCard({
  title = "Jornadas ativas — últimos 8 meses",
  legend1 = "Novos pacientes",
  legend2 = "Protocolos iniciados",
}: {
  title?: string;
  legend1?: string;
  legend2?: string;
}) {
  return (
    <div className="rounded-md border border-border bg-bg-2 p-[17px] text-left">
      <div className="mb-1.5 flex flex-wrap items-baseline justify-between gap-2">
        <h4 className="text-[13.5px] font-semibold text-text-1">{title}</h4>
        <div className="flex gap-4 text-[12px] text-text-2">
          <span className="inline-flex items-center gap-1.5">
            <i className="inline-block h-2.5 w-2.5 rounded-[3px] bg-series-1" />
            {legend1}
          </span>
          <span className="inline-flex items-center gap-1.5">
            <i className="inline-block h-2.5 w-2.5 rounded-[3px] bg-series-2" />
            {legend2}
          </span>
        </div>
      </div>
      <RevenueChart />
    </div>
  );
}
