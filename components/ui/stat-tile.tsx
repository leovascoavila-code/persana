import { cn } from "@/lib/utils";

type Trend = "up" | "down" | "flat";

const trendColor: Record<Trend, string> = {
  up: "text-[var(--success)]",
  down: "text-[var(--danger)]",
  flat: "text-text-2",
};

const trendGlyph: Record<Trend, string> = {
  up: "↑",
  down: "↓",
  flat: "→",
};

export function StatTile({
  label,
  value,
  delta,
  trend = "up",
  className,
}: {
  label: string;
  value: string;
  delta?: string;
  trend?: Trend;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "bg-bg-2 border border-border rounded-md px-[17px] py-[15px] text-left",
        className
      )}
    >
      <div className="text-[12px] text-text-3">{label}</div>
      {/* número-herói: Spectral, tabular */}
      <div className="mt-1.5 font-serif text-[27px] font-semibold leading-tight tracking-[-0.01em] tabular">
        {value}
      </div>
      {delta && (
        <div className={cn("mt-1 text-[12px]", trendColor[trend])}>
          {trendGlyph[trend]} {delta}
        </div>
      )}
    </div>
  );
}
