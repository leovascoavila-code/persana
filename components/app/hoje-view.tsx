"use client";

/** Workspace "Hoje" (Onda 1) — view Tinta.
 * Deslogado: MOCK ilustrativo do contrato. Logado: GET /workspace/today real
 * (agenda do dia + inbox clínico) + bloco INSTRUMENTAL SEPARADO e rotulado
 * (GET /instrumento/pendentes; some sem entitlement/403 — quarentena).
 * Erro de API: cai pro mock com banner danger (padrão briefing/agenda). */
import * as React from "react";
import { Badge } from "@/components/ui/badge";
import { Card, CardBody, CardHeader, CardTitle } from "@/components/ui/card";
import { StatTile } from "@/components/ui/stat-tile";
import { useAuth } from "@/components/app/auth";
import { api, ApiError } from "@/lib/api";
import { horaLabel } from "@/lib/agenda";
import {
  MOCK_INSTRUMENTAL,
  MOCK_TODAY,
  PRIORIDADE_LABEL,
  TIPO_LABEL,
  fmtDia,
  ordenarItens,
  type InstrumentoPendente,
  type WorkItem,
  type WorkspaceToday,
} from "@/lib/workspace";

function PrioridadeBadge({ p }: { p: WorkItem["prioridade"] }) {
  // semântica só com ícone+rótulo; vermelho reservado a risco real (urgent)
  if (p === "urgent") return <Badge variant="danger">▲ {PRIORIDADE_LABEL[p]}</Badge>;
  if (p === "high") return <Badge variant="warn">▲ {PRIORIDADE_LABEL[p]}</Badge>;
  return <Badge>{PRIORIDADE_LABEL[p]}</Badge>;
}

function ItemCard({
  item,
  authed,
  onAcao,
}: {
  item: WorkItem;
  authed: boolean;
  onAcao: (id: string, acao: "done" | "dismiss" | "snooze") => void;
}) {
  return (
    <div className="flex items-start justify-between gap-3 border-b border-border py-3 last:border-b-0">
      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-2">
          <PrioridadeBadge p={item.prioridade} />
          <span className="text-[12px] text-text-3">{TIPO_LABEL[item.tipo]}</span>
        </div>
        <p className="mt-1 truncate text-sm font-medium text-text-1">
          {item.paciente ?? "—"}
          <span className="font-normal text-text-2"> · {item.titulo}</span>
        </p>
        {item.resumo && (
          <p className="mt-0.5 text-[13px] text-text-3">{item.resumo}</p>
        )}
      </div>
      <div className="flex shrink-0 items-center gap-1.5">
        <button
          onClick={() => onAcao(item.id, "done")}
          disabled={!authed}
          className="rounded-sm bg-brand-500/10 px-2.5 py-1 text-[12px] font-medium text-brand-300 transition-colors hover:bg-brand-500/20 disabled:opacity-40"
        >
          Concluir
        </button>
        <button
          onClick={() => onAcao(item.id, "snooze")}
          disabled={!authed}
          className="rounded-sm px-2 py-1 text-[12px] text-text-3 transition-colors hover:text-text-1 disabled:opacity-40"
        >
          Adiar
        </button>
        <button
          onClick={() => onAcao(item.id, "dismiss")}
          disabled={!authed}
          className="rounded-sm px-2 py-1 text-[12px] text-text-3 transition-colors hover:text-text-1 disabled:opacity-40"
        >
          Dispensar
        </button>
      </div>
    </div>
  );
}

export function HojeView() {
  const { authed } = useAuth();
  const [real, setReal] = React.useState<WorkspaceToday | null>(null);
  const [instr, setInstr] = React.useState<InstrumentoPendente[] | null>(null);
  const [erro, setErro] = React.useState<string | null>(null);

  const carregar = React.useCallback(() => {
    if (!authed) return;
    setErro(null);
    api
      .workspaceToday()
      .then(setReal)
      .catch((e) => {
        setReal(null);
        setErro(String(e.message ?? e));
      });
    api
      .instrumentoPendentes()
      .then(setInstr)
      .catch((e) => {
        // 403 = sem entitlement -> bloco some em silêncio (por design)
        setInstr(null);
        if (!(e instanceof ApiError && e.status === 403)) {
          // outros erros não derrubam a tela; instrumental só não aparece
        }
      });
  }, [authed]);

  React.useEffect(() => {
    if (!authed) {
      setReal(null);
      setInstr(null);
      setErro(null);
      return;
    }
    carregar();
  }, [authed, carregar]);

  const t = real ?? MOCK_TODAY;
  const itens = ordenarItens(t.work_items);
  const urgentes = itens.filter((i) => i.prioridade === "urgent").length;
  const instrumental = authed ? instr : MOCK_INSTRUMENTAL;

  const onAcao = (id: string, acao: "done" | "dismiss" | "snooze") => {
    if (!authed) return;
    api
      .workspaceItemAcao(id, acao)
      .then(carregar)
      .catch((e) => setErro(String(e.message ?? e)));
  };

  return (
    <>
      <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-[12px] font-medium uppercase tracking-[0.08em] text-accent-300">
            Workspace
          </p>
          <h1 className="mt-1 font-serif text-[28px] font-semibold tracking-[-0.01em] text-text-1">
            Hoje
          </h1>
          <p className="mt-1 text-sm text-text-3">
            {fmtDia(t.data)} · agenda e pendências num lugar só
          </p>
        </div>
        {!authed && <Badge variant="warn">entrar para dados reais</Badge>}
      </div>

      {erro && (
        <div className="mb-4 rounded-md border border-danger/40 bg-danger/10 px-3 py-2 text-[13px] text-danger">
          API indisponível ({erro}) — exibindo dados ilustrativos.
        </div>
      )}

      <div className="mb-6 grid grid-cols-2 gap-3 md:grid-cols-3">
        <StatTile label="Consultas hoje" value={String(t.agenda.length)} />
        <StatTile label="Pendências abertas" value={String(itens.length)} />
        <StatTile label="Urgentes" value={String(urgentes)} />
      </div>

      <div className="grid gap-4 lg:grid-cols-[1fr_1.2fr]">
        <Card>
          <CardHeader>
            <CardTitle>Agenda do dia</CardTitle>
          </CardHeader>
          <CardBody>
            {t.agenda.length === 0 ? (
              <p className="text-sm text-text-3">Nenhuma consulta hoje.</p>
            ) : (
              <ul className="space-y-0">
                {t.agenda.map((a) => (
                  <li
                    key={a.id}
                    className="flex items-center justify-between gap-3 border-b border-border py-2.5 last:border-b-0"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-text-1">
                        {a.paciente ?? "(bloqueio)"}
                      </p>
                      <p className="text-[12.5px] text-text-3">
                        {a.tipo} · {a.status}
                      </p>
                    </div>
                    <span className="tabular shrink-0 text-[13px] text-text-2">
                      {horaLabel(a.inicio)}–{horaLabel(a.fim)}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </CardBody>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Inbox clínico</CardTitle>
          </CardHeader>
          <CardBody>
            {itens.length === 0 ? (
              <p className="text-sm text-text-3">
                Nada pendente — inbox zerado.
              </p>
            ) : (
              itens.map((i) => (
                <ItemCard key={i.id} item={i} authed={authed} onAcao={onAcao} />
              ))
            )}
          </CardBody>
        </Card>
      </div>

      {instrumental && instrumental.length > 0 && (
        <Card className="mt-4">
          <CardHeader>
            <CardTitle>Análises instrumentais pendentes</CardTitle>
            <p className="mt-1 text-[12px] text-text-3">
              Dado de wellness/biofeedback — não-diagnóstico. Uso apenas
              intra-paciente; não alimenta o inbox clínico.
            </p>
          </CardHeader>
          <CardBody>
            <ul className="space-y-0">
              {instrumental.map((s) => (
                <li
                  key={s.id}
                  className="flex items-center justify-between gap-3 border-b border-border py-2.5 last:border-b-0"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-text-1">
                      {s.paciente ?? "—"}
                    </p>
                    <p className="text-[12.5px] text-text-3">
                      {s.metodo}
                      {s.dispositivo ? ` · ${s.dispositivo}` : ""}
                    </p>
                  </div>
                  <span className="tabular shrink-0 text-[13px] text-text-2">
                    {fmtDia(s.data_sessao)}
                  </span>
                </li>
              ))}
            </ul>
          </CardBody>
        </Card>
      )}
    </>
  );
}
