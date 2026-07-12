import { RevenueChart } from "./revenue-chart";

/** Cartão de gráfico reutilizado no preview de marketing e no dashboard. */
export function RevenueCard({
  title = "Receita mensal — últimos 8 meses (R$ mil)",
}: {
  title?: string;
}) {
  return (
    <div className="rounded-md border border-border bg-bg-2 p-[17px] text-left">
      <div className="mb-1.5 flex flex-wrap items-baseline justify-between gap-2">
        <h4 className="text-[13.5px] font-semibold text-text-1">{title}</h4>
        <div className="flex gap-4 text-[12px] text-text-2">
          <span className="inline-flex items-center gap-1.5">
            <i className="inline-block h-2.5 w-2.5 rounded-[3px] bg-series-1" />
            Assinaturas
          </span>
          <span className="inline-flex items-center gap-1.5">
            <i className="inline-block h-2.5 w-2.5 rounded-[3px] bg-series-2" />
            Serviços
          </span>
        </div>
      </div>
      <RevenueChart />
    </div>
  );
}
