"use client";

/** Biblioteca Clínica — curadoria assistida de merge (Onda 2 Sakana) — view Tinta.
 * Deslogado: MOCK do contrato. Logado: GET /biblioteca/fila (clusters de dedup) +
 * GET /biblioteca/propostas/{id} (diff golden × membros). Aceite/rejeição são atos
 * HUMANOS (doutrina 021: o pipeline só propõe; o médico funde). Erro de API: cai
 * pro mock com banner danger (padrão hoje/pacientes). */
import * as React from "react";
import { Badge } from "@/components/ui/badge";
import { Card, CardBody, CardHeader, CardTitle } from "@/components/ui/card";
import { StatTile } from "@/components/ui/stat-tile";
import { useAuth } from "@/components/app/auth";
import { api } from "@/lib/api";
import {
  DECISION_LABEL,
  MOCK_FILA,
  MOCK_PROPOSTAS,
  confiancaPct,
  decisionBadge,
  paresPayload,
  tipoLabel,
  type FilaCluster,
  type MembroProposta,
  type PropostaDetalhe,
} from "@/lib/biblioteca";

function PayloadResumo({ payload }: { payload: Record<string, unknown> | null }) {
  const pares = paresPayload(payload);
  if (pares.length === 0)
    return <p className="text-[12px] text-text-3">sem campos estruturados</p>;
  return (
    <dl className="mt-1 grid grid-cols-[auto_1fr] gap-x-2 gap-y-0.5">
      {pares.map(([k, v]) => (
        <React.Fragment key={k}>
          <dt className="text-[12px] text-text-3">{k}</dt>
          <dd className="truncate text-[12px] text-text-2">{v}</dd>
        </React.Fragment>
      ))}
    </dl>
  );
}

function MembroCard({ m }: { m: MembroProposta }) {
  return (
    <div className="rounded-md border border-border bg-bg-1 p-3">
      <div className="flex items-center justify-between gap-2">
        <p className="truncate text-[13px] font-medium text-text-1">
          {m.canonical_title}
        </p>
        <Badge variant="neutral">{m.status}</Badge>
      </div>
      {m.fonte && <p className="text-[12px] text-text-3">fonte · {m.fonte}</p>}
      <PayloadResumo payload={m.payload} />
    </div>
  );
}

function ClusterRow({
  c,
  ativo,
  onSelecionar,
}: {
  c: FilaCluster;
  ativo: boolean;
  onSelecionar: (c: FilaCluster) => void;
}) {
  const temProp = !!c.proposta_id;
  return (
    <button
      type="button"
      onClick={() => temProp && onSelecionar(c)}
      disabled={!temProp}
      aria-current={ativo ? "true" : undefined}
      className={
        "flex w-full items-start justify-between gap-3 border-b border-border py-3 text-left last:border-b-0 " +
        (ativo
          ? "bg-bg-2"
          : temProp
          ? "transition-colors hover:bg-bg-1"
          : "cursor-default opacity-70")
      }
    >
      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="neutral">{tipoLabel(c.content_type)}</Badge>
          {c.tem_terceiro && (
            <span className="text-[11px] text-text-3">3+ fontes</span>
          )}
        </div>
        <p className="mt-1 truncate text-sm font-medium text-text-1">
          {c.titulo_exemplo ?? "(sem título)"}
        </p>
        <p className="text-[12.5px] text-text-3">
          {c.n_itens} itens · {c.n_fontes} fonte(s)
        </p>
      </div>
      <div className="flex shrink-0 flex-col items-end gap-1">
        {c.decision ? (
          <Badge variant={decisionBadge(c.decision)}>
            {DECISION_LABEL[c.decision]}
          </Badge>
        ) : (
          <span className="text-[12px] text-text-3">sem proposta</span>
        )}
        {c.confidence !== null && (
          <span className="tabular text-[12px] text-text-3">
            {confiancaPct(c.confidence)}
          </span>
        )}
      </div>
    </button>
  );
}

export function BibliotecaView() {
  const { authed } = useAuth();
  const [fila, setFila] = React.useState<FilaCluster[] | null>(null);
  const [selId, setSelId] = React.useState<string | null>(null);
  const [detalhe, setDetalhe] = React.useState<PropostaDetalhe | null>(null);
  const [motivo, setMotivo] = React.useState("");
  const [erro, setErro] = React.useState<string | null>(null);
  const [msg, setMsg] = React.useState<string | null>(null);
  const [ocupado, setOcupado] = React.useState(false);

  const carregar = React.useCallback(() => {
    if (!authed) return;
    setErro(null);
    api
      .bibliotecaFila()
      .then((fs) => {
        setFila(fs);
        // auto-seleciona a 1a proposta aberta se a seleção atual saiu da fila
        setSelId((cur) => {
          if (cur && fs.some((c) => c.proposta_id === cur)) return cur;
          return fs.find((c) => c.proposta_id)?.proposta_id ?? null;
        });
      })
      .catch((e) => {
        setFila(null);
        setErro(String(e.message ?? e));
      });
  }, [authed]);

  React.useEffect(() => {
    if (!authed) {
      // deslogado: mock ilustrativo, já com a proposta idêntica aberta
      setFila(null);
      setErro(null);
      setMsg(null);
      setSelId("mock-pr1");
      return;
    }
    carregar();
  }, [authed, carregar]);

  // carrega o diff da proposta selecionada
  React.useEffect(() => {
    if (!selId) {
      setDetalhe(null);
      return;
    }
    if (!authed) {
      setDetalhe(MOCK_PROPOSTAS[selId] ?? null);
      return;
    }
    api
      .bibliotecaProposta(selId)
      .then(setDetalhe)
      .catch((e) => {
        setDetalhe(null);
        setErro(String(e.message ?? e));
      });
  }, [selId, authed]);

  const filaView = fila ?? MOCK_FILA;
  const nProp = filaView.filter((c) => c.proposta_id).length;
  const nIdent = filaView.filter((c) => c.decision === "identical").length;

  const selecionar = (c: FilaCluster) => {
    setMsg(null);
    setMotivo("");
    setSelId(c.proposta_id);
  };

  const aceitar = () => {
    if (!authed || !detalhe || ocupado) return;
    setOcupado(true);
    setMsg(null);
    api
      .bibliotecaAceitar(detalhe.id)
      .then((r) => {
        setMsg(
          r.golden_item_id
            ? "Merge aceito — registro canônico criado."
            : "Decisão registrada (cluster distinto, nada a fundir)."
        );
        setSelId(null);
        carregar();
      })
      .catch((e) => setErro(String(e.message ?? e)))
      .finally(() => setOcupado(false));
  };

  const rejeitar = () => {
    if (!authed || !detalhe || ocupado) return;
    setOcupado(true);
    setMsg(null);
    api
      .bibliotecaRejeitar(detalhe.id, motivo || undefined)
      .then(() => {
        setMsg("Proposta rejeitada.");
        setSelId(null);
        carregar();
      })
      .catch((e) => setErro(String(e.message ?? e)))
      .finally(() => setOcupado(false));
  };

  const d = detalhe;

  return (
    <>
      <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-[12px] font-medium uppercase tracking-[0.08em] text-accent-300">
            Curadoria
          </p>
          <h1 className="mt-1 font-serif text-[28px] font-semibold tracking-[-0.01em] text-text-1">
            Biblioteca
          </h1>
          <p className="mt-1 text-sm text-text-3">
            Fila de duplicatas · o pipeline propõe, o médico funde o registro
            canônico
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
        <StatTile label="Clusters na fila" value={String(filaView.length)} />
        <StatTile label="Propostas abertas" value={String(nProp)} />
        <StatTile label="Idênticas (1 clique)" value={String(nIdent)} />
      </div>

      {authed && fila && fila.length > 0 && nProp === 0 && (
        <div className="mb-4 rounded-md border border-border bg-bg-1 px-3 py-2 text-[13px] text-text-3">
          Nenhuma proposta aberta ainda — rode{" "}
          <span className="text-text-2">scripts/curadoria_batch.py</span> para
          gerar candidatos (fase determinística ou{" "}
          <span className="text-text-2">--llm</span>).
        </div>
      )}

      <div className="grid gap-4 lg:grid-cols-[1fr_1.1fr]">
        <Card>
          <CardHeader>
            <CardTitle>Fila de clusters</CardTitle>
          </CardHeader>
          <CardBody>
            {filaView.length === 0 ? (
              <p className="text-sm text-text-3">Fila vazia — nada a curar.</p>
            ) : (
              filaView.map((c) => (
                <ClusterRow
                  key={c.content_key}
                  c={c}
                  ativo={!!c.proposta_id && c.proposta_id === selId}
                  onSelecionar={selecionar}
                />
              ))
            )}
          </CardBody>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Proposta de merge</CardTitle>
            {d && (
              <p className="mt-1 text-[12px] text-text-3">
                {tipoLabel(d.content_type)} · {d.proposed_by}
                {d.model_ref ? ` (${d.model_ref})` : ""}
              </p>
            )}
          </CardHeader>
          <CardBody>
            {!d ? (
              <p className="text-sm text-text-3">
                Selecione uma proposta na fila para ver o diff e decidir.
              </p>
            ) : (
              <div className="space-y-4">
                {/* golden record sugerido */}
                <div className="rounded-md border border-[color-mix(in_srgb,var(--accent-500)_25%,transparent)] bg-accent-wash p-3">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="text-[11px] font-medium uppercase tracking-[0.06em] text-accent-300">
                      Registro canônico sugerido
                    </span>
                    <div className="flex items-center gap-2">
                      <Badge variant={decisionBadge(d.decision)}>
                        {DECISION_LABEL[d.decision]}
                      </Badge>
                      <span className="tabular text-[12px] text-text-3">
                        {confiancaPct(d.confidence)}
                      </span>
                    </div>
                  </div>
                  <p className="mt-1.5 text-sm font-medium text-text-1">
                    {d.golden_title}
                  </p>
                  <PayloadResumo payload={d.golden_payload} />
                  {d.conflicts.length > 0 && (
                    <ul className="mt-2 space-y-0.5">
                      {d.conflicts.map((c, i) => (
                        <li key={i} className="text-[12px] text-warning">
                          ▲ {c}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>

                {/* diff: membros do cluster */}
                <div>
                  <p className="mb-2 text-[12px] font-medium uppercase tracking-[0.06em] text-text-3">
                    Membros do cluster ({d.membros.length})
                  </p>
                  <div className="space-y-2">
                    {d.membros.map((m) => (
                      <MembroCard key={m.id} m={m} />
                    ))}
                  </div>
                </div>

                {/* nota por tipo de decisão */}
                {d.decision === "identical" && (
                  <p className="text-[12px] text-text-3">
                    Composição idêntica entre os membros — aceitar funde em 1
                    clique.
                  </p>
                )}
                {d.decision === "distinct" && (
                  <p className="text-[12px] text-text-3">
                    Cluster de itens distintos — aceitar só registra a decisão
                    (nada a fundir).
                  </p>
                )}

                {/* ações — aceite/rejeição humanas */}
                <div className="flex flex-col gap-2 border-t border-border pt-3">
                  <input
                    value={motivo}
                    onChange={(e) => setMotivo(e.target.value)}
                    placeholder="Motivo (opcional, usado na rejeição)…"
                    className="w-full rounded-md border border-border bg-bg-1 px-3 py-1.5 text-sm text-text-1 placeholder:text-text-3 focus:border-brand-500 focus:outline-none"
                  />
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={aceitar}
                      disabled={!authed || ocupado}
                      className="rounded-sm bg-brand-500 px-3 py-1.5 text-[13px] font-medium text-white transition-colors hover:bg-brand-600 disabled:opacity-40"
                    >
                      Aceitar merge
                    </button>
                    <button
                      type="button"
                      onClick={rejeitar}
                      disabled={!authed || ocupado}
                      className="rounded-sm border border-danger/40 px-3 py-1.5 text-[13px] font-medium text-danger transition-colors hover:bg-danger/10 disabled:opacity-40"
                    >
                      Rejeitar
                    </button>
                    {!authed && (
                      <span className="text-[12px] text-text-3">
                        entrar para decidir
                      </span>
                    )}
                  </div>
                </div>
              </div>
            )}
          </CardBody>
        </Card>
      </div>
    </>
  );
}
