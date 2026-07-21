"use client";

/** Comparador de 2 sessões (BIO-3) — atual vs anterior, mundo Tinta.
 * Generaliza o Current vs Previous do próprio device para qualquer par de
 * sessões do mesmo paciente. NÃO-DIAGNÓSTICO: o Δ é grandeza, não veredito. */
import * as React from "react";
import { Badge } from "@/components/ui/badge";
import { Card, CardBody, CardHeader, CardTitle } from "@/components/ui/card";
import {
  agruparLeituras,
  fmtData,
  grauLabel,
  type InstrumentReading,
  type ScanDetail,
} from "@/lib/instrumento";

export function Comparador({
  atual,
  anterior,
}: {
  atual: ScanDetail;
  anterior: ScanDetail | null;
}) {
  const mapaAnterior = new Map<string, InstrumentReading>();
  if (anterior) {
    for (const r of anterior.leituras) mapaAnterior.set(r.item.toLowerCase(), r);
  }
  const grupos = agruparLeituras(atual.leituras);

  return (
    <Card className="mb-4">
      <CardHeader>
        <CardTitle>
          Comparador de sessões
          <span className="ml-2 font-normal text-text-3">· atual vs anterior</span>
        </CardTitle>
      </CardHeader>
      <CardBody>
        {!anterior ? (
          <p className="text-[13px] text-text-3">
            Só há uma sessão para este paciente — o comparador aparece a partir da
            2ª análise.
          </p>
        ) : (
          <>
            <div className="mb-2 flex items-center justify-between text-[11.5px] text-text-3">
              <span>anterior · {fmtData(anterior.data_sessao)}</span>
              <span>atual · {fmtData(atual.data_sessao)}</span>
            </div>
            {grupos.map((g) => (
              <div key={g.grupo} className="mb-3 last:mb-0">
                <p className="mb-1 font-serif text-[14px] text-text-1">{g.grupo}</p>
                {g.itens.map((r, i) => {
                  const prev = mapaAnterior.get(r.item.toLowerCase());
                  const d =
                    r.valor_num != null && prev?.valor_num != null
                      ? r.valor_num - prev.valor_num
                      : null;
                  const gl = grauLabel(r.grau_ordinal);
                  const mudouGrau =
                    prev != null &&
                    (r.grau_ordinal ?? -1) !== (prev.grau_ordinal ?? -1);
                  return (
                    <div
                      key={i}
                      className="flex items-center gap-3 border-t border-border py-1.5 first:border-t-0"
                      style={
                        mudouGrau
                          ? { boxShadow: "inset 2px 0 0 var(--accent-500)" }
                          : undefined
                      }
                    >
                      <span className="min-w-0 flex-1 truncate pl-2 text-[12.5px] text-text-1">
                        {r.item}
                      </span>
                      <span className="tabular hidden w-20 shrink-0 text-right text-[11.5px] text-text-3 sm:inline">
                        {prev?.valor_num != null ? prev.valor_num : "—"}
                      </span>
                      <span className="tabular w-20 shrink-0 text-right text-[12.5px] text-text-1">
                        {r.valor_num != null ? r.valor_num : "—"}
                      </span>
                      <span className="tabular w-16 shrink-0 text-right text-[11.5px] text-text-3">
                        {d != null
                          ? `${d > 0 ? "+" : ""}${d.toFixed(2).replace(".", ",")}`
                          : "—"}
                      </span>
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
            ))}
            <p className="mt-2 text-[11px] text-text-3">
              Barra azul à esquerda = o grau mudou entre as sessões. O sentido do Δ é
              leitura do médico.
            </p>
          </>
        )}
      </CardBody>
    </Card>
  );
}
