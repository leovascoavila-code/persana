"use client";

/** Análise Instrumental (BIO-2) — viewer da análise individual, mundo Tinta.
 * Deslogado: MOCK_SCAN (ilustrativo, QRMA).
 * Logado + feature habilitada: 1ª análise real do 1º paciente com scan
 *   (GET /instrumento/entitlement/me -> /paciente/{pid}/scans -> /scans/{id}).
 * Logado SEM a feature: estado "módulo não habilitado" (o gate por profissional
 *   é a novidade deste módulo — ativado só para quem trabalha com essa linha).
 * Módulo DESACOPLADO de exames; leitura NÃO-DIAGNÓSTICA (só intra-paciente). */
import * as React from "react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Card, CardBody, CardHeader, CardTitle } from "@/components/ui/card";
import { StatTile } from "@/components/ui/stat-tile";
import { useAuth } from "@/components/app/auth";
import { Comparador } from "@/components/app/instrumento-comparador";
import { SerieHistorica } from "@/components/app/instrumento-serie";
import { api } from "@/lib/api";
import {
  MOCK_SCAN,
  MOCK_SCAN_PREV,
  MOCK_SERIE,
  MOCK_SERIE_ITEM,
  METODO_LABEL,
  agruparLeituras,
  fmtData,
  grauIntensidade,
  grauLabel,
  type EntitlementMe,
  type ScanDetail,
  type SeriePonto,
} from "@/lib/instrumento";

function celda(g: number | null): string {
  const f = grauIntensidade(g);
  return f > 0
    ? `color-mix(in srgb, var(--accent-500) ${Math.round(18 + f * 52)}%, transparent)`
    : "var(--bg-3)";
}

export function InstrumentoView() {
  const { authed } = useAuth();
  const [ent, setEnt] = React.useState<EntitlementMe | null>(null);
  const [scan, setScan] = React.useState<ScanDetail | null>(null);
  const [vazio, setVazio] = React.useState(false);
  const [erro, setErro] = React.useState<string | null>(null);
  const [serie, setSerie] = React.useState<SeriePonto[] | null>(null);
  const [serieItem, setSerieItem] = React.useState<string | null>(null);
  const [anterior, setAnterior] = React.useState<ScanDetail | null>(null);

  React.useEffect(() => {
    if (!authed) {
      setEnt(null);
      setScan(null);
      setVazio(false);
      setErro(null);
      setSerie(null);
      setSerieItem(null);
      setAnterior(null);
      return;
    }
    let cancelado = false;
    (async () => {
      try {
        const e = await api.entitlementMe();
        if (cancelado) return;
        setEnt(e);
        if (!e.habilitado) {
          setScan(null);
          setVazio(false);
          return;
        }
        const pacientes = await api.patients();
        let achou: ScanDetail | null = null;
        let anteriorScan: ScanDetail | null = null;
        for (const p of pacientes.slice(0, 15)) {
          const scans = await api.instrumentoScans(p.id);
          if (scans.length > 0) {
            achou = await api.instrumentoScan(scans[0].id);
            if (scans.length > 1) {
              anteriorScan = await api.instrumentoScan(scans[1].id);
            }
            break;
          }
        }
        if (cancelado) return;
        setScan(achou);
        setVazio(achou === null);
        setAnterior(anteriorScan);
        if (achou) {
          const alvo =
            achou.leituras.find((r) => (r.grau_ordinal ?? 0) >= 1) ??
            achou.leituras[0];
          if (alvo) {
            const s = await api.instrumentoSerie(achou.patient_id, alvo.item);
            if (cancelado) return;
            setSerie(s);
            setSerieItem(alvo.item);
          }
        }
        setErro(null);
      } catch (e) {
        if (!cancelado) setErro(String((e as Error)?.message ?? e));
      }
    })();
    return () => {
      cancelado = true;
    };
  }, [authed]);

  const habilitado = ent?.habilitado === true;
  const bloqueado = authed && ent !== null && !habilitado && erro === null;
  const semAnalise = authed && habilitado && vazio && erro === null;
  const real = scan !== null && habilitado;
  const scanView = scan ?? MOCK_SCAN;
  const grupos = agruparLeituras(scanView.leituras);
  const foraDaFaixa = scanView.leituras.filter(
    (r) => (r.grau_ordinal ?? 0) >= 1
  ).length;
  const serieView = serie ?? MOCK_SERIE;
  const serieItemView = serieItem ?? MOCK_SERIE_ITEM;
  const anteriorView = authed ? anterior : MOCK_SCAN_PREV;

  const cabecalho = (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
      <div>
        <p className="text-[12px] font-medium uppercase tracking-[0.08em] text-accent-300">
          Análise Instrumental · BIO
        </p>
        <h1 className="mt-1 font-serif text-[28px] font-semibold tracking-[-0.01em] text-text-1">
          {METODO_LABEL[scanView.metodo]}
        </h1>
        <p className="mt-1 text-sm text-text-3">
          {real
            ? `${fmtData(scanView.data_sessao)} · ${scanView.leituras.length} leituras`
            : bloqueado || semAnalise
              ? "módulo ativado por profissional"
              : `${fmtData(scanView.data_sessao)} · dados ilustrativos`}{" "}
          · contrato do GET /instrumento/scans/{"{id}"}
        </p>
      </div>
      {real ? (
        <Badge variant="brand">dados reais do POC</Badge>
      ) : bloqueado ? (
        <Badge variant="neutral">sem acesso ao módulo</Badge>
      ) : semAnalise ? (
        <Badge variant="neutral">sem análises ainda</Badge>
      ) : (
        <Badge variant="neutral">
          dados ilustrativos
          {!authed && (
            <Link href="/login" className="text-accent-300 hover:underline">
              {" "}
              · entrar
            </Link>
          )}
        </Badge>
      )}
    </div>
  );

  // Aviso não-diagnóstico — SEMPRE visível (invariante do módulo).
  const disclaimer = (
    <p className="mb-4 rounded-sm border border-[color-mix(in_srgb,var(--warn)_35%,transparent)] bg-[color-mix(in_srgb,var(--warn)_10%,transparent)] px-3 py-2 text-[12.5px] text-text-2">
      <span className="font-medium text-text-1">Leitura de instrumento de bem-estar — não é diagnóstico.</span>{" "}
      A interpretação clínica é do médico. A comparação defensável é a do paciente
      consigo mesmo ao longo do tempo, nunca contra uma faixa populacional. Este
      módulo é separado dos exames laboratoriais e não alimenta sugestão de conduta.
    </p>
  );

  if (bloqueado) {
    return (
      <>
        {cabecalho}
        {disclaimer}
        <Card>
          <CardHeader>
            <CardTitle>Módulo não habilitado para o seu perfil</CardTitle>
          </CardHeader>
          <CardBody className="flex flex-col gap-2">
            <p className="text-[13px] text-text-2">
              A Análise Instrumental é ativada <strong>por profissional</strong> — só
              para quem trabalha com essa linha. A clínica assina o módulo e o
              administrador habilita cada profissional individualmente.
            </p>
            <p className="text-[12px] text-text-3">
              Peça ao administrador da clínica para conceder o acesso
              (POST /instrumento/entitlement/profissional). A API responde 403 até lá.
            </p>
          </CardBody>
        </Card>
      </>
    );
  }

  return (
    <>
      {cabecalho}
      {disclaimer}

      {authed && erro && (
        <p className="mb-4 rounded-sm border border-[color-mix(in_srgb,var(--danger)_35%,transparent)] bg-[color-mix(in_srgb,var(--danger)_12%,transparent)] px-3 py-2 text-[12.5px] text-[var(--danger)]">
          ✕ {erro} — exibindo o mock do contrato.
        </p>
      )}

      {semAnalise ? (
        <Card>
          <CardHeader>
            <CardTitle>Nenhuma análise registrada ainda</CardTitle>
          </CardHeader>
          <CardBody className="flex flex-col gap-2">
            <p className="text-[13px] text-text-2">
              Envie um laudo (QRMA em PDF ou body-scan em XLSX) para começar a série
              deste paciente.
            </p>
            <p className="text-[12px] text-text-3">
              Ingestão via POST /instrumento/scans — o parser gera um rascunho
              (pendente) e o médico confirma.
            </p>
          </CardBody>
        </Card>
      ) : (
        <>
          {/* números da sessão */}
          <div className="mb-4 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <StatTile
              label="Sistemas analisados"
              value={String(grupos.length)}
              delta={METODO_LABEL[scanView.metodo]}
              trend="flat"
            />
            <StatTile
              label="Leituras"
              value={String(scanView.leituras.length)}
              delta={`${scanView.dispositivo ?? "instrumento"}`}
              trend="flat"
            />
            <StatTile
              label="Fora da faixa"
              value={String(foraDaFaixa)}
              delta="marcador do device — não é diagnóstico"
              trend="flat"
            />
            <StatTile
              label="Revisão"
              value={scanView.status_revisao === "confirmado" ? "confirmada" : "pendente"}
              delta={scanView.origem_ia ? "origem: parser (apoio)" : "entrada manual"}
              trend="flat"
            />
          </div>

          {/* heatmap de grau por sistema (1 matiz sequencial) */}
          <Card className="mb-4">
            <CardHeader>
              <CardTitle>
                Grau por sistema
                <span className="ml-2 font-normal text-text-3">
                  · intensidade = desvio da faixa (na faixa → +++)
                </span>
              </CardTitle>
            </CardHeader>
            <CardBody>
              <div className="flex flex-col gap-1.5">
                {grupos.map((g) => (
                  <div key={g.grupo} className="flex items-center gap-2">
                    <span
                      className="w-[168px] shrink-0 truncate text-[11.5px] text-text-2"
                      title={g.grupo}
                    >
                      {g.grupo}
                    </span>
                    <div className="flex flex-1 flex-wrap gap-[2px]">
                      {g.itens.map((r, i) => (
                        <div
                          key={i}
                          className="h-5 w-5 rounded-sm"
                          style={{ background: celda(r.grau_ordinal) }}
                          title={`${r.item} · ${grauLabel(r.grau_ordinal).label}${
                            r.valor_num != null ? ` · valor ${r.valor_num}` : ""
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                ))}
                <div className="mt-1 flex items-center gap-2 pl-[176px] text-[10.5px] text-text-3">
                  <span>na faixa</span>
                  <div className="h-3 w-3 rounded-sm" style={{ background: "var(--bg-3)" }} />
                  <div
                    className="h-3 w-3 rounded-sm"
                    style={{ background: "color-mix(in srgb, var(--accent-500) 35%, transparent)" }}
                  />
                  <div
                    className="h-3 w-3 rounded-sm"
                    style={{ background: "color-mix(in srgb, var(--accent-500) 70%, transparent)" }}
                  />
                  <span>fora +++</span>
                </div>
              </div>
            </CardBody>
          </Card>

          {/* leituras por sistema */}
          <Card className="mb-4">
            <CardHeader>
              <CardTitle>
                Leituras
                <span className="ml-2 font-normal text-text-3">
                  · valor medido vs faixa do laudo
                </span>
              </CardTitle>
            </CardHeader>
            <CardBody>
              {grupos.map((g) => {
                const escore = g.itens.find((r) => r.escore_grupo != null)?.escore_grupo;
                const fora = g.itens.filter((r) => (r.grau_ordinal ?? 0) >= 1).length;
                return (
                  <div key={g.grupo} className="mb-4 last:mb-0">
                    <div className="mb-1 flex items-baseline justify-between gap-2">
                      <p className="font-serif text-[15px] text-text-1">{g.grupo}</p>
                      <p className="shrink-0 text-[11px] text-text-3">
                        {fora} fora · {g.itens.length} leituras
                        {escore != null ? ` · ${escore}% do ideal` : ""}
                      </p>
                    </div>
                    <div>
                      {g.itens.map((r, i) => {
                        const gl = grauLabel(r.grau_ordinal);
                        return (
                          <div
                            key={i}
                            className="flex items-center gap-3 border-t border-border py-1.5 first:border-t-0"
                          >
                            <span className="min-w-0 flex-1 truncate text-[12.5px] text-text-1">
                              {r.item}
                            </span>
                            <span className="tabular w-24 shrink-0 text-right text-[12px] text-text-2">
                              {r.valor_num != null ? r.valor_num : "—"}
                              {r.unidade ? ` ${r.unidade}` : ""}
                            </span>
                            <span className="tabular hidden w-28 shrink-0 text-right text-[11.5px] text-text-3 sm:inline">
                              {r.ref_min != null && r.ref_max != null
                                ? `${r.ref_min}–${r.ref_max}`
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
                  </div>
                );
              })}
            </CardBody>
          </Card>

          <SerieHistorica pontos={serieView} item={serieItemView} />

          <Comparador atual={scanView} anterior={anteriorView} />

          <Card>
            <CardHeader>
              <CardTitle>Em breve na análise instrumental</CardTitle>
            </CardHeader>
            <CardBody className="flex flex-col gap-2.5">
              {[
                [
                  "Ingestão pela tela",
                  "upload do laudo direto na UI; hoje a ingestão é via POST /instrumento/scans",
                ],
                [
                  "Bioimpedância por device (BIO-4)",
                  "InBody/Tanita via API entram no mesmo módulo como metodo='bioimpedancia'",
                ],
              ].map(([titulo, motivo]) => (
                <div key={titulo} className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-[13px] text-text-2">{titulo}</p>
                    <p className="text-[11.5px] text-text-3">{motivo}</p>
                  </div>
                  <Badge variant="neutral" className="shrink-0 whitespace-nowrap">
                    em breve
                  </Badge>
                </div>
              ))}
            </CardBody>
          </Card>
        </>
      )}
    </>
  );
}
