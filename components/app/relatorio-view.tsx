"use client";

/** Relatório mensal da clínica (S.19) — diagnóstico executivo — Tinta.
 * Deslogado: MOCK. Logado (admin): gerar por competência → revisar (métricas +
 * narrativa IA + recomendações) → aprovar. Erro: mock + banner. Invariante: a
 * narrativa é rascunho; o admin aprova (a IA não publica sozinha). */
import * as React from "react";
import { StatTile } from "@/components/ui/stat-tile";
import { Card, CardBody, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/components/app/auth";
import { api } from "@/lib/api";
import {
  MOCK_RELATORIO,
  PRIORIDADE_BADGE,
  fmtBRL,
  mesAtual,
  pct,
  type Relatorio,
} from "@/lib/relatorio";

const inputCls =
  "rounded-md border border-border bg-bg-1 px-3 py-1.5 text-sm text-text-1 focus:border-brand-500 focus:outline-none";
const btn =
  "rounded-sm bg-brand-500 px-3 py-1.5 text-[13px] font-medium text-white transition-colors hover:bg-brand-600 disabled:opacity-40";

export function RelatorioView() {
  const { authed } = useAuth();
  const [rel, setRel] = React.useState<Relatorio>(MOCK_RELATORIO);
  const [comp, setComp] = React.useState(mesAtual());
  const [mock, setMock] = React.useState(true);
  const [erro, setErro] = React.useState<string | null>(null);
  const [busy, setBusy] = React.useState(false);

  React.useEffect(() => {
    if (!authed) {
      setMock(true);
      setRel(MOCK_RELATORIO);
    }
  }, [authed]);

  async function gerar() {
    if (!authed) return;
    setBusy(true);
    try {
      const r = await api.relatorioGerar(comp);
      setRel(r);
      setMock(false);
      setErro(null);
    } catch (e) {
      setErro(e instanceof Error ? e.message : "falha ao gerar");
      setRel(MOCK_RELATORIO);
      setMock(true);
    } finally {
      setBusy(false);
    }
  }

  async function aprovar() {
    if (mock) return;
    try {
      await api.relatorioAprovar(rel.id);
      setRel({ ...rel, status: "aprovado", aprovado_em: new Date().toISOString() });
    } catch (e) {
      setErro(e instanceof Error ? e.message : "falha ao aprovar");
    }
  }

  const m = rel.metricas;

  return (
    <>
      <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-[11px] uppercase tracking-[0.14em] text-accent-300">
            Camada Agência
          </p>
          <h1 className="mt-1 font-serif text-[26px] font-semibold tracking-[-0.01em] text-text-1">
            Relatório mensal
          </h1>
          <p className="mt-1 text-[13px] text-text-3">
            Diagnóstico executivo da clínica — a IA redige, você revisa e aprova.
          </p>
        </div>
        <div className="flex items-center gap-2">
          {(mock || erro) && (
            <Badge variant="warn">{erro ? `sem conexão — ${erro}` : "prévia (deslogado)"}</Badge>
          )}
          <input
            className={inputCls}
            type="month"
            value={comp}
            onChange={(e) => setComp(e.target.value)}
          />
          <button className={btn} onClick={gerar} disabled={busy || !authed}>
            {busy ? "Gerando…" : "Gerar"}
          </button>
        </div>
      </div>

      {/* métricas do mês */}
      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-6">
        <StatTile label="Consultas" value={`${m.consultas}`} delta={`${m.consultas_agendadas} agendadas`} trend="up" />
        <StatTile label="Funil → protocolo" value={pct(m.funil_conversao_pct)} delta="meta ≥ 40%" trend="up" />
        <StatTile label="Adesão média" value={pct(m.adesao_media_pct)} delta="meta ≥ 70%" trend="up" />
        <StatTile label="Honorários" value={fmtBRL(m.honorarios_centavos)} delta="serviço próprio" trend="up" />
        <StatTile label="No-show" value={pct(m.no_show_pct)} delta={`${m.churn} churn`} trend={(m.no_show_pct ?? 0) >= 15 ? "down" : "flat"} />
        <StatTile label="Automação" value={pct(m.automacao_cobertura_pct)} delta="meta ≥ 80%" trend="up" />
      </div>

      <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-[1.3fr_1fr]">
        {/* narrativa */}
        <Card>
          <CardHeader>
            <CardTitle>
              Diagnóstico · {rel.competencia}{" "}
              <Badge variant={rel.status === "aprovado" ? "ok" : "warn"}>{rel.status}</Badge>{" "}
              {rel.origem_narrativa === "ia" ? (
                <Badge variant="accent">IA</Badge>
              ) : (
                <Badge variant="neutral">determinístico</Badge>
              )}
            </CardTitle>
          </CardHeader>
          <CardBody>
            <p className="text-[13.5px] leading-relaxed text-text-2">{rel.narrativa}</p>
            {rel.status === "rascunho" && (
              <div className="mt-4 flex items-center gap-3">
                <button className={btn} onClick={aprovar} disabled={mock}>
                  Aprovar relatório
                </button>
                <span className="text-[12px] text-text-3">
                  A IA gerou um rascunho — a aprovação é sua (invariante).
                </span>
              </div>
            )}
          </CardBody>
        </Card>

        {/* recomendações */}
        <Card>
          <CardHeader>
            <CardTitle>Recomendações acionáveis</CardTitle>
          </CardHeader>
          <CardBody>
            <ol className="space-y-3">
              {rel.recomendacoes.map((r, i) => (
                <li key={i} className="flex gap-2">
                  <span className="font-serif text-[15px] tabular text-text-3">{i + 1}.</span>
                  <div>
                    <div className="text-[13px] text-text-1">{r.titulo}</div>
                    <Badge variant={PRIORIDADE_BADGE[r.prioridade] ?? "neutral"}>{r.prioridade}</Badge>
                  </div>
                </li>
              ))}
            </ol>
            <p className="mt-4 text-[12px] text-text-3">
              Honorários = serviço próprio da clínica; o relatório nunca exibe receita da farmácia
              nem vincula ganho a volume prescrito (S.16.3).
            </p>
          </CardBody>
        </Card>
      </div>
    </>
  );
}
