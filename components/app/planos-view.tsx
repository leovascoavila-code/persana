"use client";

/** Planos comerciais (Onda 3 Slices 1/2a) — Program/Offer Builder + Care Plan
 * Timeline — view Tinta. Deslogado: MOCK. Logado: /comercial (programas, precos,
 * ofertas, matriculas). O programa vende SERVICO; formula/exame/medicamento ficam
 * FORA (exclusoes). Erro de API: mock + banner (padrao hoje/pacientes/biblioteca). */
import * as React from "react";
import { Badge } from "@/components/ui/badge";
import { Card, CardBody, CardHeader, CardTitle } from "@/components/ui/card";
import { StatTile } from "@/components/ui/stat-tile";
import { useAuth } from "@/components/app/auth";
import { api } from "@/lib/api";
import {
  MOCK_OFERTAS,
  MOCK_PROGRAMA_DETALHE,
  MOCK_PROGRAMAS,
  OFERTA_STATUS_LABEL,
  PROGRAMA_STATUS_LABEL,
  fmtDia,
  ofertaBadge,
  precoLabel,
  programaBadge,
  valorBRL,
  type Oferta,
  type Programa,
  type ProgramaDetalhe,
} from "@/lib/planos";

function reaisParaCentavos(v: string): number {
  const n = parseFloat(v.replace(/\./g, "").replace(",", "."));
  return Number.isFinite(n) ? Math.round(n * 100) : 0;
}

const inputCls =
  "w-full rounded-md border border-border bg-bg-1 px-3 py-1.5 text-sm text-text-1 placeholder:text-text-3 focus:border-brand-500 focus:outline-none";
const btnPrimary =
  "rounded-sm bg-brand-500 px-3 py-1.5 text-[13px] font-medium text-white transition-colors hover:bg-brand-600 disabled:opacity-40";
const btnGhost =
  "rounded-sm px-2.5 py-1 text-[12px] text-text-3 transition-colors hover:text-text-1 disabled:opacity-40";

export function PlanosView() {
  const { authed } = useAuth();
  const [programas, setProgramas] = React.useState<Programa[] | null>(null);
  const [selTid, setSelTid] = React.useState<string | null>(null);
  const [detalhe, setDetalhe] = React.useState<ProgramaDetalhe | null>(null);
  const [erro, setErro] = React.useState<string | null>(null);
  const [msg, setMsg] = React.useState<string | null>(null);

  // paciente + ofertas
  const [q, setQ] = React.useState("");
  const [lista, setLista] = React.useState<{ id: string; nome: string }[]>([]);
  const [pid, setPid] = React.useState<string | null>(null);
  const [ofertas, setOfertas] = React.useState<Oferta[] | null>(null);

  // forms
  const [nProg, setNProg] = React.useState({ nome: "", duracao: "", inclusoes: "", exclusoes: "", termos: "" });
  const [nPreco, setNPreco] = React.useState({ modalidade: "recorrente", valor: "", periodicidade: "mensal" });
  const [ofPreco, setOfPreco] = React.useState("");

  const carregarProgramas = React.useCallback(() => {
    if (!authed) return;
    setErro(null);
    api
      .programas()
      .then((ps) => {
        setProgramas(ps);
        setSelTid((cur) => (cur && ps.some((p) => p.id === cur) ? cur : ps[0]?.id ?? null));
      })
      .catch((e) => {
        setProgramas(null);
        setErro(String(e.message ?? e));
      });
  }, [authed]);

  React.useEffect(() => {
    if (!authed) {
      setProgramas(null);
      setSelTid("mock-pg1");
      setErro(null);
      setMsg(null);
      return;
    }
    carregarProgramas();
  }, [authed, carregarProgramas]);

  // detalhe (precos) do programa selecionado
  React.useEffect(() => {
    if (!selTid) return setDetalhe(null);
    if (!authed) return setDetalhe(selTid === "mock-pg1" ? MOCK_PROGRAMA_DETALHE : null);
    api.programa(selTid).then(setDetalhe).catch(() => setDetalhe(null));
  }, [selTid, authed]);

  // busca de paciente (debounce)
  React.useEffect(() => {
    if (!authed) return;
    const t = setTimeout(() => {
      api
        .patients(q || undefined)
        .then((ps) => {
          setLista(ps);
          if (!pid && ps.length) setPid(ps[0].id);
        })
        .catch((e) => setErro(String(e.message ?? e)));
    }, 250);
    return () => clearTimeout(t);
  }, [authed, q, pid]);

  const carregarOfertas = React.useCallback(() => {
    if (!authed || !pid) return;
    api.ofertasPaciente(pid).then(setOfertas).catch(() => setOfertas(null));
  }, [authed, pid]);

  React.useEffect(() => {
    carregarOfertas();
  }, [carregarOfertas]);

  const progs = authed ? programas ?? MOCK_PROGRAMAS : MOCK_PROGRAMAS;
  const det = authed ? detalhe : selTid === "mock-pg1" ? MOCK_PROGRAMA_DETALHE : null;
  const ofs = authed ? ofertas ?? (erro ? MOCK_OFERTAS : []) : MOCK_OFERTAS;
  const ativos = progs.filter((p) => p.status === "ativo");

  const acao = (fn: () => Promise<unknown>, ok: string) => {
    if (!authed) return;
    setMsg(null);
    setErro(null);
    fn()
      .then(() => {
        setMsg(ok);
        carregarProgramas();
        carregarOfertas();
      })
      .catch((e) => setErro(String(e.message ?? e)));
  };

  const criarProg = () => {
    if (!nProg.nome.trim()) return;
    const splitList = (s: string) =>
      s.split(/[\n,]/).map((x) => x.trim()).filter(Boolean);
    acao(
      () =>
        api
          .criarPrograma({
            nome: nProg.nome.trim(),
            duracao_dias: nProg.duracao ? Number(nProg.duracao) : null,
            inclusoes: splitList(nProg.inclusoes),
            exclusoes: splitList(nProg.exclusoes),
            termos: nProg.termos.trim() || null,
          })
          .then(() => setNProg({ nome: "", duracao: "", inclusoes: "", exclusoes: "", termos: "" })),
      "Programa criado (rascunho)."
    );
  };

  const addPreco = () => {
    if (!selTid || !nPreco.valor) return;
    acao(
      () =>
        api
          .criarPreco(selTid, {
            modalidade: nPreco.modalidade,
            valor_centavos: reaisParaCentavos(nPreco.valor),
            periodicidade: nPreco.modalidade === "recorrente" ? nPreco.periodicidade : null,
          })
          .then(() => {
            setNPreco({ ...nPreco, valor: "" });
            if (authed) api.programa(selTid).then(setDetalhe).catch(() => {});
          }),
      "Preço adicionado."
    );
  };

  const criarOf = () => {
    if (!pid || !selTid) return;
    acao(
      () => api.criarOferta(pid, { template_id: selTid, price_id: ofPreco || null }),
      "Oferta enviada ao paciente."
    );
  };

  return (
    <>
      <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-[12px] font-medium uppercase tracking-[0.08em] text-accent-300">
            Comercial
          </p>
          <h1 className="mt-1 font-serif text-[28px] font-semibold tracking-[-0.01em] text-text-1">
            Planos
          </h1>
          <p className="mt-1 text-sm text-text-3">
            Programas de cuidado (serviço) · oferta e aceite · fórmula/exame ficam fora
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
        <StatTile label="Programas ativos" value={String(ativos.length)} />
        <StatTile label="Rascunhos" value={String(progs.filter((p) => p.status === "draft").length)} />
        <StatTile label="Ofertas do paciente" value={String(ofs.length)} />
      </div>

      <div className="grid gap-4 lg:grid-cols-[1fr_1fr]">
        {/* ── Program Builder ── */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Novo programa</CardTitle>
            </CardHeader>
            <CardBody>
              <div className="space-y-2">
                <input
                  className={inputCls}
                  placeholder="Nome do programa"
                  value={nProg.nome}
                  onChange={(e) => setNProg({ ...nProg, nome: e.target.value })}
                  disabled={!authed}
                />
                <input
                  className={inputCls}
                  placeholder="Duração (dias)"
                  value={nProg.duracao}
                  onChange={(e) => setNProg({ ...nProg, duracao: e.target.value.replace(/\D/g, "") })}
                  disabled={!authed}
                />
                <input
                  className={inputCls}
                  placeholder="Inclusões (vírgula): consultas, check-ins…"
                  value={nProg.inclusoes}
                  onChange={(e) => setNProg({ ...nProg, inclusoes: e.target.value })}
                  disabled={!authed}
                />
                <input
                  className={inputCls}
                  placeholder="Exclusões (regulatório): fórmulas, exames…"
                  value={nProg.exclusoes}
                  onChange={(e) => setNProg({ ...nProg, exclusoes: e.target.value })}
                  disabled={!authed}
                />
                <input
                  className={inputCls}
                  placeholder="Termos (sem promessa de resultado)"
                  value={nProg.termos}
                  onChange={(e) => setNProg({ ...nProg, termos: e.target.value })}
                  disabled={!authed}
                />
                <button onClick={criarProg} disabled={!authed} className={btnPrimary}>
                  Criar programa
                </button>
              </div>
            </CardBody>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Programas</CardTitle>
            </CardHeader>
            <CardBody>
              {progs.length === 0 ? (
                <p className="text-sm text-text-3">Nenhum programa ainda.</p>
              ) : (
                progs.map((p) => (
                  <div
                    key={p.id}
                    className={
                      "border-b border-border py-2.5 last:border-b-0 " +
                      (p.id === selTid ? "" : "")
                    }
                  >
                    <div className="flex items-start justify-between gap-3">
                      <button
                        onClick={() => setSelTid(p.id)}
                        className="min-w-0 text-left"
                      >
                        <p className="truncate text-sm font-medium text-text-1">
                          {p.nome}
                        </p>
                        <p className="text-[12.5px] text-text-3">
                          {p.duracao_dias ? `${p.duracao_dias} dias · ` : ""}v{p.versao}
                        </p>
                      </button>
                      <div className="flex shrink-0 items-center gap-2">
                        <Badge variant={programaBadge(p.status)}>
                          {PROGRAMA_STATUS_LABEL[p.status]}
                        </Badge>
                        {p.status === "draft" && (
                          <button
                            onClick={() => acao(() => api.ativarPrograma(p.id), "Programa ativado.")}
                            disabled={!authed}
                            className={btnGhost}
                          >
                            Ativar
                          </button>
                        )}
                      </div>
                    </div>
                    {p.id === selTid && det && (
                      <div className="mt-2 rounded-md border border-border bg-bg-1 p-3">
                        {det.exclusoes?.length > 0 && (
                          <p className="text-[12px] text-text-3">
                            Fora do pacote: {det.exclusoes.join(", ")}
                          </p>
                        )}
                        <p className="mt-1 text-[12px] font-medium uppercase tracking-[0.06em] text-text-3">
                          Preços
                        </p>
                        {det.precos.length === 0 ? (
                          <p className="text-[12px] text-text-3">sem preço</p>
                        ) : (
                          <ul className="mt-1 space-y-0.5">
                            {det.precos.map((pr) => (
                              <li key={pr.id} className="text-[13px] text-text-2">
                                {precoLabel(pr)}
                              </li>
                            ))}
                          </ul>
                        )}
                        <div className="mt-2 flex items-center gap-1.5">
                          <select
                            className="rounded-md border border-border bg-bg-1 px-2 py-1 text-[12px] text-text-1"
                            value={nPreco.modalidade}
                            onChange={(e) => setNPreco({ ...nPreco, modalidade: e.target.value })}
                            disabled={!authed}
                          >
                            <option value="a_vista">à vista</option>
                            <option value="parcelado">parcelado</option>
                            <option value="recorrente">recorrente</option>
                          </select>
                          <input
                            className="w-24 rounded-md border border-border bg-bg-1 px-2 py-1 text-[12px] text-text-1 placeholder:text-text-3 focus:border-brand-500 focus:outline-none"
                            placeholder="497,00"
                            value={nPreco.valor}
                            onChange={(e) => setNPreco({ ...nPreco, valor: e.target.value })}
                            disabled={!authed}
                          />
                          <button onClick={addPreco} disabled={!authed} className={btnGhost}>
                            + preço
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ))
              )}
            </CardBody>
          </Card>
        </div>

        {/* ── Offer Builder + Timeline ── */}
        <Card>
          <CardHeader>
            <CardTitle>Ofertas ao paciente</CardTitle>
          </CardHeader>
          <CardBody>
            {authed ? (
              <div className="mb-3 flex items-center gap-2">
                <input
                  className={inputCls}
                  placeholder="Buscar paciente…"
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                />
                {lista.length > 0 && (
                  <select
                    className="max-w-44 rounded-md border border-border bg-bg-1 px-2 py-1.5 text-sm text-text-1"
                    value={pid ?? ""}
                    onChange={(e) => setPid(e.target.value)}
                  >
                    {lista.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.nome}
                      </option>
                    ))}
                  </select>
                )}
              </div>
            ) : (
              <p className="mb-3 text-[13px] text-text-3">
                Paciente <span className="text-text-1">Ana Lúcia Ferreira</span> (mock)
              </p>
            )}

            {/* nova oferta */}
            <div className="mb-4 rounded-md border border-border bg-bg-1 p-3">
              <p className="text-[12px] font-medium uppercase tracking-[0.06em] text-text-3">
                Nova oferta
              </p>
              <p className="mt-1 text-[12.5px] text-text-2">
                {det ? det.nome : "selecione um programa"}
                {det && det.status !== "ativo" && (
                  <span className="text-warning"> · ative o programa para ofertar</span>
                )}
              </p>
              <div className="mt-2 flex items-center gap-1.5">
                <select
                  className="min-w-0 flex-1 rounded-md border border-border bg-bg-1 px-2 py-1 text-[12px] text-text-1"
                  value={ofPreco}
                  onChange={(e) => setOfPreco(e.target.value)}
                  disabled={!authed || !det}
                >
                  <option value="">preço (opcional)</option>
                  {det?.precos.map((pr) => (
                    <option key={pr.id} value={pr.id}>
                      {precoLabel(pr)}
                    </option>
                  ))}
                </select>
                <button
                  onClick={criarOf}
                  disabled={!authed || !det || det.status !== "ativo"}
                  className={btnPrimary}
                >
                  Ofertar
                </button>
              </div>
            </div>

            {/* timeline das ofertas */}
            {ofs.length === 0 ? (
              <p className="text-sm text-text-3">Nenhuma oferta para este paciente.</p>
            ) : (
              ofs.map((o) => (
                <div
                  key={o.id}
                  className="flex items-start justify-between gap-3 border-b border-border py-2.5 last:border-b-0"
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <Badge variant={ofertaBadge(o.status)}>
                        {OFERTA_STATUS_LABEL[o.status]}
                      </Badge>
                      <span className="text-[12px] text-text-3">
                        {fmtDia(o.criado_em)}
                      </span>
                    </div>
                    <p className="mt-0.5 truncate text-[12px] text-text-3">
                      termos {o.terms_hash.slice(0, 10)}…
                    </p>
                  </div>
                  {o.status === "proposto" && (
                    <div className="flex shrink-0 items-center gap-1.5">
                      <button
                        onClick={() => acao(() => api.aceitarOferta(o.id), "Oferta aceita — matrícula criada.")}
                        disabled={!authed}
                        className="rounded-sm bg-brand-500/10 px-2.5 py-1 text-[12px] font-medium text-brand-300 transition-colors hover:bg-brand-500/20 disabled:opacity-40"
                      >
                        Aceitar
                      </button>
                      <button
                        onClick={() => acao(() => api.recusarOferta(o.id), "Oferta recusada.")}
                        disabled={!authed}
                        className={btnGhost}
                      >
                        Recusar
                      </button>
                    </div>
                  )}
                </div>
              ))
            )}
          </CardBody>
        </Card>
      </div>
    </>
  );
}
