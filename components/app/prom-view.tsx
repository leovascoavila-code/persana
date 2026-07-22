"use client";

/** PROMs (Onda 4) — aplicar instrumento validado + tendência do desfecho — view Tinta.
 * Deslogado: MOCK. Logado: GET /prom/instrumentos + POST /aplicar (score → tarefa se
 * threshold; PHQ-9 item 9 = crítico) + GET série. Erro: mock + banner (padrão irmãs). */
import * as React from "react";
import { Badge } from "@/components/ui/badge";
import { Card, CardBody, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/components/app/auth";
import { api } from "@/lib/api";
import {
  MOCK_INSTRUMENTOS,
  MOCK_SERIE,
  escalaLegenda,
  faixaBadge,
  fmtDia,
  tendenciaBadge,
  type Instrumento,
  type PromResultado,
  type Serie,
  type SeriePonto,
} from "@/lib/prom";

const inputCls =
  "w-full rounded-md border border-border bg-bg-1 px-3 py-1.5 text-sm text-text-1 placeholder:text-text-3 focus:border-brand-500 focus:outline-none";
const btnPrimary =
  "rounded-sm bg-brand-500 px-3 py-1.5 text-[13px] font-medium text-white transition-colors hover:bg-brand-600 disabled:opacity-40";

function Tendencia({ pts, maxY }: { pts: SeriePonto[]; maxY: number }) {
  const vals = pts.filter((p) => p.score !== null);
  if (vals.length < 2)
    return <p className="text-sm text-text-3">Sem dados suficientes para a tendência.</p>;
  const W = 300, H = 96, PAD = 6;
  const n = vals.length;
  const x = (i: number) => PAD + (i / (n - 1)) * (W - 2 * PAD);
  const y = (s: number) => H - PAD - (s / maxY) * (H - 2 * PAD);
  const d = vals
    .map((p, i) => `${i === 0 ? "M" : "L"} ${x(i).toFixed(1)} ${y(p.score!).toFixed(1)}`)
    .join(" ");
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="h-24 w-full" preserveAspectRatio="none">
      <path d={d} fill="none" stroke="var(--brand-500)" strokeWidth={2} vectorEffect="non-scaling-stroke" />
      {vals.map((p, i) => (
        <circle key={i} cx={x(i)} cy={y(p.score!)} r={2.5} fill="var(--brand-500)" />
      ))}
    </svg>
  );
}

export function PromView() {
  const { authed } = useAuth();
  const [instrs, setInstrs] = React.useState<Instrumento[] | null>(null);
  const [slug, setSlug] = React.useState("phq9");
  const [q, setQ] = React.useState("");
  const [lista, setLista] = React.useState<{ id: string; nome: string }[]>([]);
  const [pid, setPid] = React.useState<string | null>(null);
  const [resp, setResp] = React.useState<Record<string, number>>({});
  const [res, setRes] = React.useState<PromResultado | null>(null);
  const [serie, setSerie] = React.useState<Serie | null>(null);
  const [erro, setErro] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (!authed) {
      setInstrs(null);
      setErro(null);
      return;
    }
    api.promInstrumentos().then(setInstrs).catch((e) => {
      setInstrs(null);
      setErro(String(e.message ?? e));
    });
  }, [authed]);

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

  const instrumentos = authed ? instrs ?? (erro ? MOCK_INSTRUMENTOS : []) : MOCK_INSTRUMENTOS;
  const inst = instrumentos.find((i) => i.slug === slug) ?? instrumentos[0];
  const maxY = inst ? inst.itens.length * inst.item_max : 27;

  const carregarSerie = React.useCallback(() => {
    if (!authed || !pid || !inst) return;
    api.promSerie(pid, inst.slug).then(setSerie).catch(() => setSerie(null));
  }, [authed, pid, inst]);

  React.useEffect(() => {
    setResp({});
    setRes(null);
    carregarSerie();
  }, [carregarSerie, slug]);

  const serieView = authed ? serie ?? (erro ? MOCK_SERIE : null) : MOCK_SERIE;

  const aplicar = () => {
    if (!authed || !pid || !inst) return;
    setErro(null);
    api.promAplicar({ patient_id: pid, instrumento: inst.slug, respostas: resp })
      .then((r) => {
        setRes(r);
        carregarSerie();
      })
      .catch((e) => setErro(String(e.message ?? e)));
  };

  return (
    <>
      <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-[12px] font-medium uppercase tracking-[0.08em] text-accent-300">
            Desfechos
          </p>
          <h1 className="mt-1 font-serif text-[28px] font-semibold tracking-[-0.01em] text-text-1">
            PROMs
          </h1>
          <p className="mt-1 text-sm text-text-3">
            Instrumentos validados · score → tarefa se limiar · tendência do desfecho
          </p>
        </div>
        {!authed && <Badge variant="warn">entrar para dados reais</Badge>}
      </div>

      {erro && (
        <div className="mb-4 rounded-md border border-danger/40 bg-danger/10 px-3 py-2 text-[13px] text-danger">
          API indisponível ({erro}) — exibindo dados ilustrativos.
        </div>
      )}

      <div className="mb-4 flex flex-wrap items-center gap-2">
        {authed && (
          <input
            className={inputCls + " max-w-56"}
            placeholder="Buscar paciente…"
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
        )}
        {authed && lista.length > 0 && (
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
        <select
          className="rounded-md border border-border bg-bg-1 px-2 py-1.5 text-sm text-text-1"
          value={slug}
          onChange={(e) => setSlug(e.target.value)}
        >
          {instrumentos.map((i) => (
            <option key={i.slug} value={i.slug}>{i.nome}</option>
          ))}
        </select>
      </div>

      <div className="grid gap-4 lg:grid-cols-[1.1fr_1fr]">
        {/* ── Aplicar instrumento ── */}
        <Card>
          <CardHeader>
            <CardTitle>Aplicar {inst?.nome}</CardTitle>
            <p className="mt-1 text-[12px] text-text-3">{inst ? escalaLegenda(inst.item_max) : ""}</p>
          </CardHeader>
          <CardBody>
            <div className="space-y-2">
              {inst?.itens.map((lid, idx) => (
                <div key={lid} className="flex items-center justify-between gap-3">
                  <span className="text-[13px] text-text-2">Item {idx + 1}</span>
                  <div className="flex gap-1">
                    {Array.from({ length: inst.item_max + 1 }, (_, v) => (
                      <button
                        key={v}
                        onClick={() => setResp({ ...resp, [lid]: v })}
                        disabled={!authed}
                        className={
                          "h-7 w-7 rounded-sm text-[12px] tabular transition-colors disabled:opacity-40 " +
                          (resp[lid] === v
                            ? "bg-brand-500 text-white"
                            : "bg-bg-2 text-text-2 hover:bg-bg-1")
                        }
                      >
                        {v}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
              <button
                onClick={aplicar}
                disabled={!authed || Object.keys(resp).length === 0}
                className={btnPrimary + " mt-2"}
              >
                Registrar {inst?.nome}
              </button>
            </div>

            {res && (
              <div className="mt-4 rounded-md border border-border bg-bg-1 p-3">
                <div className="flex items-baseline gap-2">
                  <span className="font-serif text-[26px] font-semibold text-text-1">{res.score}</span>
                  <Badge variant={faixaBadge(res.faixa)}>{res.faixa}</Badge>
                  {res.critico && <Badge variant="danger">▲ crítico</Badge>}
                </div>
                <p className="mt-1 text-[13px] text-text-2">{res.interpretacao}</p>
                {res.escalado && (
                  <p className="mt-1 text-[12px] text-warning">
                    ▲ Limiar atingido — tarefa criada na fila (care coordinator).
                  </p>
                )}
              </div>
            )}
          </CardBody>
        </Card>

        {/* ── Tendência do desfecho ── */}
        <Card>
          <CardHeader>
            <CardTitle>Tendência — {inst?.nome}</CardTitle>
            {serieView && (
              <div className="mt-1">
                <Badge variant={tendenciaBadge(serieView.tendencia)}>{serieView.tendencia}</Badge>
              </div>
            )}
          </CardHeader>
          <CardBody>
            {serieView && serieView.serie.length > 0 ? (
              <>
                <Tendencia pts={serieView.serie} maxY={maxY} />
                <ul className="mt-3 space-y-0">
                  {serieView.serie.slice().reverse().map((p) => (
                    <li
                      key={p.id}
                      className="flex items-center justify-between gap-3 border-b border-border py-2 last:border-b-0"
                    >
                      <div className="flex items-center gap-2">
                        <span className="tabular text-sm font-medium text-text-1">{p.score}</span>
                        {p.faixa && <Badge variant={faixaBadge(p.faixa)}>{p.faixa}</Badge>}
                      </div>
                      <span className="tabular text-[12px] text-text-3">{fmtDia(p.quando)}</span>
                    </li>
                  ))}
                </ul>
              </>
            ) : (
              <p className="text-sm text-text-3">Nenhuma aplicação ainda para este instrumento.</p>
            )}
          </CardBody>
        </Card>
      </div>
    </>
  );
}
