/**
 * RevenueChart — SVG declarativo portado de persana-exibicao.html (script).
 * Server component: geometria calculada em módulo, cores via var() inline.
 * Reutilizado no preview da homepage e no dashboard do app.
 */

const W = 940;
const H = 200;
const PAD = { t: 12, r: 16, b: 26, l: 38 };
const Y_MAX = 90;

type Series = { name: string; data: number[]; color: string };

const DEFAULT_MONTHS = ["Dez", "Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul"];
const DEFAULT_SERIES: Series[] = [
  { name: "Assinaturas", data: [46, 51, 49, 57, 61, 66, 72, 78], color: "var(--series-1)" },
  { name: "Serviços", data: [12, 14, 15, 14, 17, 19, 18, 21], color: "var(--series-2)" },
];

export function RevenueChart({
  months = DEFAULT_MONTHS,
  series = DEFAULT_SERIES,
  gridLines = [0, 30, 60, 90],
}: {
  months?: string[];
  series?: Series[];
  gridLines?: number[];
}) {
  const xA = (i: number) =>
    PAD.l + (i / (months.length - 1)) * (W - PAD.l - PAD.r);
  const yA = (v: number) => PAD.t + (1 - v / Y_MAX) * (H - PAD.t - PAD.b);

  return (
    <svg
      width="100%"
      height="200"
      viewBox={`0 0 ${W} ${H}`}
      role="img"
      aria-label="Receita mensal dos últimos 8 meses por linha de receita"
    >
      {/* gridlines + rótulos do eixo Y */}
      {gridLines.map((v) => (
        <g key={`grid-${v}`}>
          <line
            x1={PAD.l}
            x2={W - PAD.r}
            y1={yA(v)}
            y2={yA(v)}
            stroke="var(--border)"
            strokeWidth={1}
          />
          <text
            x={PAD.l - 8}
            y={yA(v) + 4}
            textAnchor="end"
            fill="var(--text-3)"
            fontSize={11}
            fontFamily="var(--font-sans)"
          >
            {v}
          </text>
        </g>
      ))}

      {/* rótulos do eixo X */}
      {months.map((m, i) => (
        <text
          key={`m-${m}`}
          x={xA(i)}
          y={H - 7}
          textAnchor="middle"
          fill="var(--text-3)"
          fontSize={11}
          fontFamily="var(--font-sans)"
        >
          {m}
        </text>
      ))}

      {/* séries: área + linha + ponto/rótulo final */}
      {series.map((s) => {
        const pts = s.data.map((v, i) => `${xA(i)},${yA(v)}`).join(" ");
        const lastI = s.data.length - 1;
        const lastV = s.data[lastI];
        return (
          <g key={s.name}>
            <polygon
              points={`${PAD.l},${yA(0)} ${pts} ${xA(lastI)},${yA(0)}`}
              fill={s.color}
              opacity={0.08}
            />
            <polyline
              points={pts}
              fill="none"
              stroke={s.color}
              strokeWidth={2.4}
              strokeLinejoin="round"
              strokeLinecap="round"
            />
            <circle
              cx={xA(lastI)}
              cy={yA(lastV)}
              r={4}
              fill={s.color}
              stroke="var(--bg-2)"
              strokeWidth={2}
            />
            <text
              x={xA(lastI) - 8}
              y={yA(lastV) - 9}
              textAnchor="end"
              fill="var(--text-2)"
              fontSize={12}
              fontWeight={600}
              fontFamily="var(--font-sans)"
            >
              {lastV}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

export { DEFAULT_SERIES, DEFAULT_MONTHS };
