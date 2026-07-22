"use client";

/** Consulta Copiloto (Onda 5) — canvas de seções + painel — view Tinta.
 * 2 colunas: canvas de blocos estruturados (autosave, chip "IA — revisar",
 * assinar por seção) + painel (Copiloto=cards da biblioteca aprovada · Plano=
 * checklist de saída + finalizar). IA prepara (ai_draft), médico decide. Escrita
 * oficial fica no assinar do atendimento. Deslogado: MOCK. Erro: mock + banner. */
import * as React from "react";
import { Badge } from "@/components/ui/badge";
import { Card, CardBody, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/components/app/auth";
import { api } from "@/lib/api";
import {
  CHECKLIST_LABEL,
  MOCK_WORKSPACE,
  checklistBadge,
  secaoBadge,
  secaoLabel,
  SECAO_STATUS_LABEL,
  type Workspace,
} from "@/lib/consulta";

const btnPrimary =
  "rounded-sm bg-brand-500 px-3 py-1.5 text-[13px] font-medium text-white transition-colors hover:bg-brand-600 disabled:opacity-40";
const btnGhost =
  "rounded-sm bg-brand-500/10 px-2.5 py-1 text-[12px] font-medium text-brand-300 transition-colors hover:bg-brand-500/20 disabled:opacity-40";

export function ConsultaView() {
  const { authed } = useAuth();
  const [q, setQ] = React.useState("");
  const [lista, setLista] = React.useState<{ id: string; nome: string }[]>([]);
  const [pid, setPid] = React.useState<string | null>(null);
  const [eid, setEid] = React.useState<string | null>(null);
  const [ws, setWs] = React.useState<Workspace | null>(null);
  const [edits, setEdits] = React.useState<Record<string, string>>({});
  const [tab, setTab] = React.useState<"copiloto" | "plano">("copiloto");
  const [erro, setErro] = React.useState<string | null>(null);
  const [msg, setMsg] = React.useState<string | null>(null);

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

  // ao escolher paciente: pega/cria atendimento + init + workspace
  React.useEffect(() => {
    if (!authed || !pid) return;
    setErro(null);
    api.atendimentos(pid)
      .then(async (encs) => {
        const e = encs[0]?.id ?? (await api.criarAtendimento(pid)).id;
        setEid(e);
      })
      .catch((e) => setErro(String(e.message ?? e)));
  }, [authed, pid]);

  const carregarWs = React.useCallback(() => {
    if (!authed || !eid) return;
    api.copilotoInit(eid)
      .then(() => api.copilotoWorkspace(eid))
      .then((w) => {
        setWs(w);
        setEdits({});
      })
      .catch((e) => setErro(String(e.message ?? e)));
  }, [authed, eid]);

  React.useEffect(() => {
    carregarWs();
  }, [carregarWs]);

  const w = authed ? ws : MOCK_WORKSPACE;

  const salvar = (secao: string) => {
    if (!authed || !eid || edits[secao] === undefined) return;
    api.copilotoSalvarSecao(eid, secao, edits[secao])
      .then(carregarWs)
      .catch((e) => setErro(String(e.message ?? e)));
  };

  const assinar = (secao: string) => {
    if (!authed || !eid) return;
    api.copilotoAssinarSecao(eid, secao).then(carregarWs).catch((e) => setErro(String(e.message ?? e)));
  };

  const scribe = () => {
    if (!authed || !eid) return;
    setMsg(null);
    api.copilotoScribe(eid).then((r) => {
      setMsg(`Scribe: ${r.secoes_preenchidas} seção(ões) pré-preenchidas (IA — revisar).`);
      carregarWs();
    }).catch((e) => setErro(String(e.message ?? e)));
  };

  const inserirCard = (titulo: string) => {
    if (!authed || !eid || !w) return;
    const conduta = w.secoes.find((s) => s.secao === "conduta");
    const atual = edits["conduta"] ?? conduta?.conteudo ?? "";
    const novo = (atual ? atual + "\n" : "") + titulo;
    setEdits({ ...edits, conduta: novo });
    api.copilotoSalvarSecao(eid, "conduta", novo).then(carregarWs).catch(() => {});
  };

  const marcarChecklist = (item: string, status: string) => {
    if (!authed || !eid) return;
    api.copilotoChecklist(eid, item, status).then(carregarWs).catch((e) => setErro(String(e.message ?? e)));
  };

  const finalizar = () => {
    if (!authed || !eid) return;
    setMsg(null);
    setErro(null);
    api.copilotoFinalizar(eid).then((r) => {
      setMsg("Pode finalizar." + (r.avisos.length ? ` Pendências (aviso): ${r.avisos.join(", ")}.` : ""));
    }).catch((e) => setErro(String(e.message ?? e)));
  };

  return (
    <>
      <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-[12px] font-medium uppercase tracking-[0.08em] text-accent-300">
            Copiloto
          </p>
          <h1 className="mt-1 font-serif text-[28px] font-semibold tracking-[-0.01em] text-text-1">
            Consulta
          </h1>
          <p className="mt-1 text-sm text-text-3">
            Canvas de blocos · IA prepara, você revisa e assina · escrita oficial só no seu ato
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {authed ? (
            <>
              <input
                className="w-48 rounded-md border border-border bg-bg-1 px-3 py-1.5 text-sm text-text-1 placeholder:text-text-3 focus:border-brand-500 focus:outline-none"
                placeholder="Buscar paciente…"
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
                    <option key={x.id} value={x.id}>{x.nome}</option>
                  ))}
                </select>
              )}
              <button onClick={scribe} disabled={!eid} className={btnGhost}>
                Scribe (pré-preencher)
              </button>
            </>
          ) : (
            <Badge variant="warn">entrar para dados reais</Badge>
          )}
        </div>
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

      {!w ? (
        <p className="text-sm text-text-3">Selecione um paciente para abrir a consulta.</p>
      ) : (
        <div className="grid gap-4 lg:grid-cols-[1.5fr_1fr]">
          {/* ── Canvas de seções ── */}
          <div className="space-y-3">
            {w.secoes.map((s) => {
              const valor = edits[s.secao] ?? s.conteudo ?? "";
              const signed = s.status === "signed";
              return (
                <Card key={s.secao}>
                  <CardHeader>
                    <div className="flex items-center justify-between gap-2">
                      <CardTitle>{secaoLabel(s.secao)}</CardTitle>
                      <div className="flex items-center gap-2">
                        <Badge variant={secaoBadge(s.status)}>{SECAO_STATUS_LABEL[s.status]}</Badge>
                        {s.status === "reviewed" && (
                          <button onClick={() => assinar(s.secao)} disabled={!authed} className={btnGhost}>
                            Assinar
                          </button>
                        )}
                      </div>
                    </div>
                  </CardHeader>
                  <CardBody>
                    <textarea
                      value={valor}
                      onChange={(e) => setEdits({ ...edits, [s.secao]: e.target.value })}
                      onBlur={() => salvar(s.secao)}
                      disabled={!authed || signed}
                      rows={valor.split("\n").length + 1}
                      placeholder={signed ? "" : "Escreva ou edite…"}
                      className="w-full resize-y rounded-md border border-border bg-bg-1 px-3 py-2 text-sm text-text-1 placeholder:text-text-3 focus:border-brand-500 focus:outline-none disabled:opacity-70"
                    />
                  </CardBody>
                </Card>
              );
            })}
          </div>

          {/* ── Painel ── */}
          <Card className="lg:sticky lg:top-20 h-fit">
            <CardHeader>
              <div className="flex gap-1">
                {(["copiloto", "plano"] as const).map((t) => (
                  <button
                    key={t}
                    onClick={() => setTab(t)}
                    className={
                      "rounded-sm px-2.5 py-1 text-[12.5px] transition-colors " +
                      (tab === t ? "bg-bg-2 text-text-1" : "text-text-3 hover:text-text-1")
                    }
                  >
                    {t === "copiloto" ? "Copiloto" : "Plano"}
                  </button>
                ))}
              </div>
            </CardHeader>
            <CardBody>
              {tab === "copiloto" ? (
                <>
                  <p className="mb-2 text-[12px] text-text-3">
                    Sugestões SÓ da biblioteca aprovada (nunca chatbot). Fonte clicável.
                  </p>
                  {w.cards.length === 0 ? (
                    <p className="text-sm text-text-3">
                      Sem cards — a biblioteca curada ainda não tem itens aprovados.
                    </p>
                  ) : (
                    w.cards.map((c) => (
                      <div
                        key={c.content_item_id}
                        className="border-b border-border py-2.5 last:border-b-0"
                      >
                        <div className="flex items-center gap-2">
                          <Badge variant="neutral">{c.tipo}</Badge>
                          <span className="truncate text-sm font-medium text-text-1">{c.titulo}</span>
                        </div>
                        <div className="mt-1 flex items-center justify-between gap-2">
                          <span className="text-[12px] text-text-3">{c.fonte}</span>
                          <button onClick={() => inserirCard(c.titulo)} disabled={!authed} className={btnGhost}>
                            {c.acao}
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </>
              ) : (
                <>
                  <p className="mb-2 text-[12px] text-text-3">
                    Pendência avisa; só item regulatório bloqueia.
                  </p>
                  {w.checklist.map((it) => (
                    <div
                      key={it.item}
                      className="flex items-center justify-between gap-2 border-b border-border py-2 last:border-b-0"
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-text-1">{CHECKLIST_LABEL[it.item] ?? it.item}</span>
                        {it.obrigatorio_regulatorio && (
                          <span className="text-[11px] text-danger">obrigatório</span>
                        )}
                      </div>
                      <div className="flex items-center gap-1">
                        <Badge variant={checklistBadge(it.status)}>{it.status}</Badge>
                        <button onClick={() => marcarChecklist(it.item, "ok")} disabled={!authed} className={btnGhost}>
                          ok
                        </button>
                        <button
                          onClick={() => marcarChecklist(it.item, "nao_aplicavel")}
                          disabled={!authed}
                          className="rounded-sm px-2 py-1 text-[12px] text-text-3 transition-colors hover:text-text-1 disabled:opacity-40"
                        >
                          n/a
                        </button>
                      </div>
                    </div>
                  ))}
                  <button onClick={finalizar} disabled={!authed} className={btnPrimary + " mt-3 w-full"}>
                    Finalizar consulta
                  </button>
                </>
              )}
            </CardBody>
          </Card>
        </div>
      )}
    </>
  );
}
