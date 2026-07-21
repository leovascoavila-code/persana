"use client";

/** CRM Pipeline (Onda 4 Slice 1) — funil por estágio + fila de risco — view Tinta.
 * Deslogado: MOCK. Logado: GET /crm/pipeline + POST avaliar-risco (regras
 * explicáveis; risco alto vira work_item, D-6). Erro: mock + banner (padrão irmãs). */
import * as React from "react";
import { Badge } from "@/components/ui/badge";
import { Card, CardBody, CardHeader, CardTitle } from "@/components/ui/card";
import { StatTile } from "@/components/ui/stat-tile";
import { useAuth } from "@/components/app/auth";
import { api } from "@/lib/api";
import {
  MOCK_PIPELINE,
  RISK_LABEL,
  fmtDia,
  riskBadge,
  stageLabel,
  type Pipeline,
} from "@/lib/crm";

const inputCls =
  "w-full rounded-md border border-border bg-bg-1 px-3 py-1.5 text-sm text-text-1 placeholder:text-text-3 focus:border-brand-500 focus:outline-none";
const btnGhost =
  "rounded-sm bg-brand-500/10 px-2.5 py-1 text-[12px] font-medium text-brand-300 transition-colors hover:bg-brand-500/20 disabled:opacity-40";

export function CrmView() {
  const { authed } = useAuth();
  const [pipe, setPipe] = React.useState<Pipeline | null>(null);
  const [erro, setErro] = React.useState<string | null>(null);
  const [msg, setMsg] = React.useState<string | null>(null);
  const [q, setQ] = React.useState("");
  const [lista, setLista] = React.useState<{ id: string; nome: string }[]>([]);
  const [pid, setPid] = React.useState<string | null>(null);

  const carregar = React.useCallback(() => {
    if (!authed) return;
    setErro(null);
    api.crmPipeline().then(setPipe).catch((e) => {
      setPipe(null);
      setErro(String(e.message ?? e));
    });
  }, [authed]);

  React.useEffect(() => {
    if (!authed) {
      setPipe(null);
      setErro(null);
      setMsg(null);
      return;
    }
    carregar();
  }, [authed, carregar]);

  React.useEffect(() => {
    if (!authed) return;
    const t = setTimeout(() => {
      api.patients(q || undefined).then((ps) => {
        setLista(ps);
        if (!pid && ps.length) setPid(ps[0].id);
      }).catch(() => {});
    }, 250);
    return () => clearTimeout(t);
  }, [authed, q, pid]);

  const p = authed ? pipe ?? (erro ? MOCK_PIPELINE : { funil: [], fila_risco: [] }) : MOCK_PIPELINE;
  const maxN = Math.max(1, ...p.funil.map((f) => f.n));
  const nAlto = p.fila_risco.filter((r) => r.risk_band === "alto").length;
  const nMedio = p.fila_risco.filter((r) => r.risk_band === "medio").length;
  const totalFunil = p.funil.reduce((s, f) => s + f.n, 0);

  const avaliar = (patientId: string | null) => {
    if (!authed || !patientId) return;
    setMsg(null);
    setErro(null);
    api.crmAvaliarRisco(patientId).then((r) => {
      setMsg(
        `Risco ${RISK_LABEL[r.risk_band]} (${r.risk_score})` +
          (r.work_item_id ? " — tarefa criada na fila" : "")
      );
      carregar();
    }).catch((e) => setErro(String(e.message ?? e)));
  };

  return (
    <>
      <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-[12px] font-medium uppercase tracking-[0.08em] text-accent-300">
            CRM
          </p>
          <h1 className="mt-1 font-serif text-[28px] font-semibold tracking-[-0.01em] text-text-1">
            Pipeline
          </h1>
          <p className="mt-1 text-sm text-text-3">
            Funil da jornada · fila de risco por regras explicáveis (risco alto vira tarefa)
          </p>
        </div>
        {!authed && <Badge variant="warn">entrar para dados reais</Badge>}
      </div>

      {erro && (
        <div className="mb-4 rounded-md border border-danger/40 bg-danger/10 px-3 py-2 text-[13px] text-danger">
          API indisponível ({erro}) — exibindo dados ilustrativos.
        </div>
      )}
      {msg && (
        <div className="mb-4 rounded-md border border-[color-mix(in_srgb,var(--brand-500)_35%,transparent)] bg-brand-wash px-3 py-2 text-[13px] text-brand-300">
          {msg}
        </div>
      )}

      <div className="mb-6 grid grid-cols-2 gap-3 md:grid-cols-3">
        <StatTile label="Risco alto" value={String(nAlto)} />
        <StatTile label="Risco médio" value={String(nMedio)} />
        <StatTile label="Pacientes no funil" value={String(totalFunil)} />
      </div>

      <div className="grid gap-4 lg:grid-cols-[1fr_1.3fr]">
        {/* ── Funil ── */}
        <Card>
          <CardHeader>
            <CardTitle>Funil por estágio</CardTitle>
          </CardHeader>
          <CardBody>
            {p.funil.length === 0 ? (
              <p className="text-sm text-text-3">Sem pacientes classificados ainda.</p>
            ) : (
              <ul className="space-y-2.5">
                {p.funil.map((f) => (
                  <li key={f.lifecycle_stage}>
                    <div className="mb-1 flex items-center justify-between">
                      <span className="text-[13px] text-text-2">
                        {stageLabel(f.lifecycle_stage)}
                      </span>
                      <span className="tabular text-[13px] text-text-1">{f.n}</span>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-bg-2">
                      <div
                        className="h-full rounded-full bg-brand-500"
                        style={{ width: `${Math.round((f.n / maxN) * 100)}%` }}
                      />
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </CardBody>
        </Card>

        {/* ── Fila de risco ── */}
        <Card>
          <CardHeader>
            <CardTitle>Fila de risco</CardTitle>
            {authed && (
              <div className="mt-2 flex items-center gap-2">
                <input
                  className={inputCls}
                  placeholder="Buscar paciente para avaliar…"
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                />
                {lista.length > 0 && (
                  <select
                    className="max-w-40 rounded-md border border-border bg-bg-1 px-2 py-1.5 text-sm text-text-1"
                    value={pid ?? ""}
                    onChange={(e) => setPid(e.target.value)}
                  >
                    {lista.map((x) => (
                      <option key={x.id} value={x.id}>
                        {x.nome}
                      </option>
                    ))}
                  </select>
                )}
                <button onClick={() => avaliar(pid)} disabled={!pid} className={btnGhost}>
                  Avaliar
                </button>
              </div>
            )}
          </CardHeader>
          <CardBody>
            {p.fila_risco.length === 0 ? (
              <p className="text-sm text-text-3">Nenhum paciente em risco.</p>
            ) : (
              p.fila_risco.map((r) => (
                <div
                  key={r.patient_id}
                  className="border-b border-border py-3 last:border-b-0"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <Badge variant={riskBadge(r.risk_band)}>
                          {r.risk_band === "alto" ? "▲ " : ""}
                          {RISK_LABEL[r.risk_band]}
                        </Badge>
                        <span className="truncate text-sm font-medium text-text-1">
                          {r.paciente}
                        </span>
                        <span className="tabular text-[12px] text-text-3">
                          {r.risk_score} pts
                        </span>
                      </div>
                      {r.next_best_action && (
                        <p className="mt-1 text-[13px] text-text-2">
                          Próxima ação:{" "}
                          <span className="text-text-1">{r.next_best_action}</span>
                        </p>
                      )}
                      {r.risk_reasons.length > 0 && (
                        <ul className="mt-1 space-y-0.5">
                          {r.risk_reasons.map((m, i) => (
                            <li key={i} className="text-[12px] text-text-3">
                              · {m}
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                    <div className="flex shrink-0 flex-col items-end gap-1">
                      <button
                        onClick={() => avaliar(r.patient_id)}
                        disabled={!authed}
                        className={btnGhost}
                      >
                        Reavaliar
                      </button>
                      <span className="tabular text-[12px] text-text-3">
                        {fmtDia(r.atualizado_em)}
                      </span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </CardBody>
        </Card>
      </div>
    </>
  );
}
