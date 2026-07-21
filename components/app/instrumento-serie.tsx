"use client";

/** Série histórica (BIO-3) — um marcador ao longo das sessões, mundo Tinta.
 * Sparkline do valor + faixa de referência sombreada + delta; a leitura
 * defensável é a intra-paciente ao longo do tempo. NÃO-DIAGNÓSTICO: o sentido
 * do delta é do médico. Espelha GET /instrumento/paciente/{pid}/serie. */
import * as React from "react";
import { Badge } from "@/components/ui/badge";
import { Card, CardBody, CardHeader, CardTitle } from "@/components/ui/card";
import {
  fmtData,
  grauLabel,
  serieDelta,
  type SeriePonto,
} from "@/lib/instrumento";

const W = 560;
const H = 132;
const PAD = 10;

export function SerieHistorica({
  pontos,
  item,
}: {
  pontos: SeriePonto[];
  item: string;
}) {
  const vals = pontos.map((p) => p.valor_num).filter((v): v is number => v != null);
  const refMin = pontos.find((p) => p.ref_min != null)?.ref_min ?? null;
  const refMax = pontos.find((p) => p.ref_max != null)?.ref_max ?? null;
  const delta = serieDelta(pontos);

  const lo = Math.min(...vals, ...(refMin != null ? [refMin] : []));
  const hi = Math.max(...vals, ...(refMax != null ? [refMax] : []));
  const span = hi - lo || 1;
  const x = (i: number) =>
    PAD + (pontos.length <= 1 ? 0.5 : i / (pontos.length - 1)) * (W - 2 * PAD);
  const y = (v: number) => PAD + (1 - (v - lo) / span) * (H - 2 * PAD);
  const linha = pontos
    .map((p, i) => (p.valor_num != null ? `${x(i)},${y(p.valor_num)}` : null))
    .filter(Boolean)
    .join(" ");

  return (
    <Card className="mb-4">
      <CardHeader>
        <CardTitle>
          Série histórica
          <span className="ml-2 font-normal text-text-3">
            · {item} · intra-paciente · {pontos.length}{" "}
            {pontos.length === 1 ? "sessão" : "sessões"}
          </span>
        </CardTitle>
      </CardHeader>
      <CardBody>
        {pontos.length === 0 ? (
          <p className="text-[13px] text-text-3">
            Sem histórico para este marcador ainda — a série começa a partir da 2ª
            sessão.
          </p>
        ) : (
          <>
            <div className="mb-3 flex flex-wrap items-baseline gap-x-4 gap-y-1">
              <span className="text-[12px] text-text-3">
                último:{" "}
                <span className="tabular text-text-1">
                  {vals.length ? vals[vals.length - 1] : "—"}
                </span>
              </span>
              {delta && (
                <span className="text-[12px] text-text-3">
                  Δ vs anterior:{" "}
                  <span className="tabular text-text-2">
                    {delta.dir === "up" ? "↑" : delta.dir === "down" ? "↓" : "→"}{" "}
                    {Math.abs(delta.valor).toFixed(2).replace(".", ",")}
                  </span>
                </span>
              )}
              {refMin != null && refMax != null && (
                <span className="text-[12px] text-text-3">
                  faixa de referência:{" "}
                  <span className="tabular text-text-2">
                    {refMin}–{refMax}
                  </span>
                </span>
              )}
            </div>

            <svg
              viewBox={`0 0 ${W} ${H}`}
              className="w-full"
              style={{ height: H }}
              role="img"
              aria-label={`Série histórica de ${item}`}
            >
              {refMin != null && refMax != null && (
                <rect
                  x={0}
                  y={y(refMax)}
                  width={W}
                  height={Math.max(1, y(refMin) - y(refMax))}
                  style={{ fill: "color-mix(in srgb, var(--text-3) 12%, transparent)" }}
                />
              )}
              {pontos.length > 1 && (
                <polyline
                  points={linha}
                  style={{
                    fill: "none",
                    stroke: "var(--accent-500)",
                    strokeWidth: 1.5,
                  }}
                />
              )}
              {pontos.map((p, i) =>
                p.valor_num != null ? (
                  <circle
                    key={i}
                    cx={x(i)}
                    cy={y(p.valor_num)}
                    r={3.5}
                    style={{
                      fill: grauLabel(p.grau_ordinal).fora
                        ? "var(--warn)"
                        : "var(--accent-400)",
                    }}
                  >
                    <title>{`${fmtData(p.data_sessao)} · ${p.valor_num} · ${grauLabel(p.grau_ordinal).label}`}</title>
                  </circle>
                ) : null
              )}
            </svg>
            <div className="mt-1 flex items-center justify-between text-[10.5px] text-text-3">
              <span>{fmtData(pontos[0].data_sessao)}</span>
              <span>faixa de referência sombreada · ponto laranja = fora</span>
              <span>{fmtData(pontos[pontos.length - 1].data_sessao)}</span>
            </div>

            <div className="mt-3">
              {pontos.map((p, i) => {
                const gl = grauLabel(p.grau_ordinal);
                const prev = i > 0 ? pontos[i - 1].valor_num : null;
                const d =
                  p.valor_num != null && prev != null ? p.valor_num - prev : null;
                return (
                  <div
                    key={i}
                    className="flex items-center gap-3 border-t border-border py-1.5 first:border-t-0"
                  >
                    <span className="w-36 shrink-0 text-[12px] text-text-2">
                      {fmtData(p.data_sessao)}
                    </span>
                    <span className="tabular w-20 shrink-0 text-right text-[12.5px] text-text-1">
                      {p.valor_num != null ? p.valor_num : "—"}
                    </span>
                    <span className="tabular hidden w-16 shrink-0 text-right text-[11.5px] text-text-3 sm:inline">
                      {d != null
                        ? `${d > 0 ? "+" : ""}${d.toFixed(2).replace(".", ",")}`
                        : "—"}
                    </span>
                    <span className="flex-1" />
                    {p.status_revisao === "pendente" && (
                      <Badge variant="neutral" className="shrink-0">
                        pendente
                      </Badge>
                    )}
                    <Badge
                      variant={gl.fora ? "warn" : "neutral"}
                      className="w-[92px] shrink-0 justify-center whitespace-nowrap"
                    >
                      {gl.icon} {gl.label}
                    </Badge>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </CardBody>
    </Card>
  );
}
