"use client";

/** Automação da jornada (S.17) — catálogo de gatilhos + cobertura N5 — view Tinta.
 * Deslogado: MOCK. Logado: GET /automacoes/regras + /cobertura, PUT toggle, POST
 * tick. Erro: mock + banner. A automação escreve só operacional (touchpoint/tarefa),
 * com fallback humano e consentimento respeitado; nunca prontuário oficial. */
import * as React from "react";
import { StatTile } from "@/components/ui/stat-tile";
import { Card, CardBody, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/components/app/auth";
import { api } from "@/lib/api";
import {
  MOCK_COBERTURA,
  MOCK_REGRAS,
  OUTCOME_LABEL,
  type Cobertura,
  type Regra,
} from "@/lib/automacao";

const btn =
  "rounded-sm bg-brand-500 px-3 py-1.5 text-[13px] font-medium text-white transition-colors hover:bg-brand-600 disabled:opacity-40";

export function AutomacaoView() {
  const { authed } = useAuth();
  const [regras, setRegras] = React.useState<Regra[]>(MOCK_REGRAS);
  const [cob, setCob] = React.useState<Cobertura>(MOCK_COBERTURA);
  const [mock, setMock] = React.useState(true);
  const [erro, setErro] = React.useState<string | null>(null);
  const [busy, setBusy] = React.useState(false);

  const carregar = React.useCallback(async () => {
    const [rs, cb] = await Promise.all([api.automacaoRegras(), api.automacaoCobertura()]);
    setRegras(rs);
    setCob(cb);
    setMock(false);
  }, []);

  React.useEffect(() => {
    if (!authed) {
      setMock(true);
      setRegras(MOCK_REGRAS);
      setCob(MOCK_COBERTURA);
      return;
    }
    carregar().catch((e) => {
      setErro(e instanceof Error ? e.message : "falha ao carregar");
      setRegras(MOCK_REGRAS);
      setCob(MOCK_COBERTURA);
      setMock(true);
    });
  }, [authed, carregar]);

  async function toggle(codigo: string, habilitado: boolean) {
    if (mock) {
      setRegras((rs) => rs.map((r) => (r.codigo === codigo ? { ...r, habilitado } : r)));
      return;
    }
    setRegras((rs) => rs.map((r) => (r.codigo === codigo ? { ...r, habilitado } : r)));
    try {
      await api.automacaoToggle(codigo, habilitado);
    } catch {
      setRegras((rs) => rs.map((r) => (r.codigo === codigo ? { ...r, habilitado: !habilitado } : r)));
    }
  }

  async function rodarTick() {
    if (mock) return;
    setBusy(true);
    try {
      await api.automacaoTick();
      await carregar();
    } catch (e) {
      setErro(e instanceof Error ? e.message : "falha no tick");
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-[11px] uppercase tracking-[0.14em] text-accent-300">
            Cobertura auditável
          </p>
          <h1 className="mt-1 font-serif text-[26px] font-semibold tracking-[-0.01em] text-text-1">
            Automação da jornada
          </h1>
          <p className="mt-1 text-[13px] text-text-3">
            Cada evento operacional resolvido sem ação humana — ou com fallback para a equipe.
          </p>
        </div>
        <div className="flex items-center gap-2">
          {(mock || erro) && (
            <Badge variant="warn">{erro ? "sem conexão — exemplo" : "prévia (deslogado)"}</Badge>
          )}
          <button className={btn} onClick={rodarTick} disabled={busy || mock}>
            {busy ? "Rodando…" : "Rodar avaliação"}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <StatTile label="Cobertura de automação (N5)" value={cob.n5_pct === null ? "—" : `${cob.n5_pct}%`} delta="alvo ≥ 80%" trend="up" />
        <StatTile label="Resolvidos sem humano" value={`${cob.auto}`} delta={`de ${cob.elegiveis} elegíveis`} trend="up" />
        <StatTile label="Fallback humano" value={`${cob.por_outcome.fallback_human ?? 0}`} delta="viraram tarefa" trend="flat" />
        <StatTile label="Sem consentimento" value={`${cob.por_outcome.skip_consent ?? 0}`} delta="LGPD — não enviados" trend="flat" />
      </div>

      <Card className="mt-4">
        <CardHeader>
          <CardTitle>Gatilhos da jornada (S.17)</CardTitle>
        </CardHeader>
        <CardBody>
          <div className="divide-y divide-border">
            {regras.map((r) => (
              <div key={r.codigo} className="flex items-center gap-3 py-3">
                <button
                  role="switch"
                  aria-checked={r.habilitado}
                  onClick={() => toggle(r.codigo, !r.habilitado)}
                  className={
                    "relative h-5 w-9 shrink-0 rounded-full transition-colors " +
                    (r.habilitado ? "bg-brand-500" : "bg-bg-1 border border-border")
                  }
                >
                  <span
                    className={
                      "absolute top-0.5 h-4 w-4 rounded-full bg-white transition-transform " +
                      (r.habilitado ? "translate-x-[18px]" : "translate-x-0.5")
                    }
                  />
                </button>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[13px] text-text-1">{r.nome}</span>
                    {r.wired ? (
                      <Badge variant="ok">ativo</Badge>
                    ) : (
                      <Badge variant="neutral">planejado</Badge>
                    )}
                    {r.interno && <Badge variant="accent">interno</Badge>}
                  </div>
                  <div className="mt-0.5 text-[12px] text-text-3">
                    {r.acao} · canal {r.canal} · fallback: {r.fallback}
                  </div>
                </div>
              </div>
            ))}
          </div>
          <p className="mt-3 text-[12px] text-text-3">
            A automação escreve só o operacional (lembrete/tarefa) e respeita consentimento por
            canal; sem consentimento vira tarefa da equipe. Nunca toca o prontuário oficial.
          </p>
        </CardBody>
      </Card>
    </>
  );
}
