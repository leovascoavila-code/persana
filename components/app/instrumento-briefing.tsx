"use client";

/** Seção "Análise Instrumental" do briefing pré-consulta (design §8).
 * SEPARADA e ROTULADA — front-only: busca a análise do paciente por conta
 * própria, NÃO entra no bloco de analitos alterados (preserva o desacoplamento).
 * Profissional SEM a feature (403): a seção some do briefing. Deslogado: mock. */
import * as React from "react";
import Link from "next/link";
import { Card, CardBody, CardHeader, CardTitle } from "@/components/ui/card";
import { api } from "@/lib/api";
import {
  MOCK_SCAN,
  METODO_LABEL,
  agruparLeituras,
  fmtData,
  type ScanDetail,
} from "@/lib/instrumento";

export function BriefingInstrumento({
  pid,
  authed,
}: {
  pid: string | null;
  authed: boolean;
}) {
  const [scan, setScan] = React.useState<ScanDetail | null>(null);
  const [oculto, setOculto] = React.useState(false);

  React.useEffect(() => {
    if (!authed || !pid) {
      setScan(null);
      setOculto(false);
      return;
    }
    let cancelado = false;
    (async () => {
      try {
        const scans = await api.instrumentoScans(pid);
        if (cancelado) return;
        if (scans.length === 0) {
          setOculto(true); // sem análise: não polui o briefing
          setScan(null);
          return;
        }
        const d = await api.instrumentoScan(scans[0].id);
        if (cancelado) return;
        setScan(d);
        setOculto(false);
      } catch {
        // 403 (sem a feature) ou erro: a seção some
        if (!cancelado) {
          setOculto(true);
          setScan(null);
        }
      }
    })();
    return () => {
      cancelado = true;
    };
  }, [authed, pid]);

  if (authed && oculto) return null;
  const s = authed ? scan : MOCK_SCAN;
  if (!s) return null;

  const grupos = agruparLeituras(s.leituras);
  const fora = s.leituras.filter((r) => (r.grau_ordinal ?? 0) >= 1).length;

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          Análise instrumental
          <span className="ml-2 font-normal text-text-3">· não-diagnóstica</span>
        </CardTitle>
      </CardHeader>
      <CardBody className="flex flex-col gap-2">
        <p className="text-[13px] text-text-2">
          Última: <span className="tabular">{fmtData(s.data_sessao)}</span> ·{" "}
          {METODO_LABEL[s.metodo]}
        </p>
        <div className="flex flex-wrap gap-x-4 gap-y-1 text-[12px] text-text-3">
          <span className="tabular">{grupos.length} sistemas</span>
          <span className="tabular">{fora} fora da faixa</span>
          <span>revisão {s.status_revisao}</span>
        </div>
        <p className="text-[11.5px] leading-relaxed text-text-3">
          Leitura de instrumento de bem-estar, separada dos exames laboratoriais —
          a comparação defensável é intra-paciente ao longo do tempo.
        </p>
        <Link
          href="/instrumento"
          className="text-[12.5px] text-accent-300 hover:underline"
        >
          Ver série e detalhe →
        </Link>
      </CardBody>
    </Card>
  );
}
