"use client";

/** Cadências (Onda 4 Slice 2) — fila de disparo + check-in + adesão — view Tinta.
 * Deslogado: MOCK. Logado: GET /cadencia/pendentes + POST /dispatch (WhatsApp
 * per-tenant) + POST /checkin (4 perguntas → escalona) + GET adesão. Touchpoint =
 * deep-link only. Erro: mock + banner (padrão irmãs). */
import * as React from "react";
import { Badge } from "@/components/ui/badge";
import { Card, CardBody, CardHeader, CardTitle } from "@/components/ui/card";
import { StatTile } from "@/components/ui/stat-tile";
import { useAuth } from "@/components/app/auth";
import { api } from "@/lib/api";
import {
  ADESAO_LABEL,
  MOCK_ADESAO,
  MOCK_PENDENTES,
  MOCK_PROVIDERS,
  canalBadge,
  fmtDia,
  tipoLabel,
  type Adesao,
  type MsgProvider,
  type Pendente,
} from "@/lib/cadencia";

const inputCls =
  "w-full rounded-md border border-border bg-bg-1 px-3 py-1.5 text-sm text-text-1 placeholder:text-text-3 focus:border-brand-500 focus:outline-none";
const selCls = "rounded-md border border-border bg-bg-1 px-2 py-1.5 text-sm text-text-1";
const btnPrimary =
  "rounded-sm bg-brand-500 px-3 py-1.5 text-[13px] font-medium text-white transition-colors hover:bg-brand-600 disabled:opacity-40";

export function CadenciaView() {
  const { authed } = useAuth();
  const [pend, setPend] = React.useState<Pendente[] | null>(null);
  const [provs, setProvs] = React.useState<MsgProvider[] | null>(null);
  const [erro, setErro] = React.useState<string | null>(null);
  const [msg, setMsg] = React.useState<string | null>(null);

  const [q, setQ] = React.useState("");
  const [lista, setLista] = React.useState<{ id: string; nome: string }[]>([]);
  const [pid, setPid] = React.useState<string | null>(null);
  const [adesao, setAdesao] = React.useState<Adesao | null>(null);
  const [ck, setCk] = React.useState({ adesao: "feito", delta: "estavel", quer_contato: false });

  const carregar = React.useCallback(() => {
    if (!authed) return;
    setErro(null);
    api.cadenciaPendentes().then(setPend).catch((e) => {
      setPend(null);
      setErro(String(e.message ?? e));
    });
    api.cadenciaProviderConfigs().then(setProvs).catch(() => setProvs(null));
  }, [authed]);

  React.useEffect(() => {
    if (!authed) {
      setPend(null);
      setProvs(null);
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

  React.useEffect(() => {
    if (!authed || !pid) return;
    api.cadenciaAdesao(pid).then(setAdesao).catch(() => setAdesao(null));
  }, [authed, pid]);

  const fila = authed ? pend ?? (erro ? MOCK_PENDENTES : []) : MOCK_PENDENTES;
  const providers = authed ? provs ?? (erro ? MOCK_PROVIDERS : []) : MOCK_PROVIDERS;
  const ad = authed ? adesao : MOCK_ADESAO;
  const waOk = providers.some((p) => p.canal === "whatsapp" && p.is_default && p.ativo);

  const disparar = () => {
    if (!authed) return;
    setMsg(null);
    setErro(null);
    api.cadenciaDispatch().then((r) => {
      setMsg(
        `Disparo: ${r.enviados} enviado(s), ${r.falhas} falha(s)` +
          (r.sem_destino ? `, ${r.sem_destino} sem telefone` : "") +
          (r.sem_template ? `, ${r.sem_template} sem template` : "")
      );
      carregar();
    }).catch((e) => setErro(String(e.message ?? e)));
  };

  const registrarCheckin = () => {
    if (!authed || !pid) return;
    setMsg(null);
    api.cadenciaCheckin({ patient_id: pid, adesao: ck.adesao, delta: ck.delta,
                          quer_contato: ck.quer_contato }).then((r) => {
      setMsg(r.escalado ? "Check-in registrado — escalado (tarefa criada na fila)." : "Check-in registrado.");
      if (pid) api.cadenciaAdesao(pid).then(setAdesao).catch(() => {});
    }).catch((e) => setErro(String(e.message ?? e)));
  };

  return (
    <>
      <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-[12px] font-medium uppercase tracking-[0.08em] text-accent-300">
            Jornada
          </p>
          <h1 className="mt-1 font-serif text-[28px] font-semibold tracking-[-0.01em] text-text-1">
            Cadências
          </h1>
          <p className="mt-1 text-sm text-text-3">
            Fila de disparo (deep-link, consentido) · check-in de adesão · escala por exceção
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
        <StatTile label="Na fila" value={String(fila.length)} />
        <StatTile label="WhatsApp" value={waOk ? "ok" : "—"} />
        <StatTile label="Check-ins" value={String(ad?.checkins ?? 0)} />
      </div>

      <div className="grid gap-4 lg:grid-cols-[1.1fr_1fr]">
        {/* ── Fila de disparo ── */}
        <Card>
          <CardHeader>
            <CardTitle>Fila de disparo</CardTitle>
            <div className="mt-1 flex items-center justify-between gap-2">
              <p className="text-[12px] text-text-3">
                {waOk ? "WhatsApp configurado" : "sem provedor WhatsApp — configure para disparar"}
              </p>
              <button
                onClick={disparar}
                disabled={!authed || fila.length === 0}
                className={btnPrimary}
              >
                Disparar agora
              </button>
            </div>
          </CardHeader>
          <CardBody>
            {fila.length === 0 ? (
              <p className="text-sm text-text-3">Nada na fila — sem cadências pendentes.</p>
            ) : (
              fila.map((t) => (
                <div
                  key={t.id}
                  className="flex items-center justify-between gap-3 border-b border-border py-2.5 last:border-b-0"
                >
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge variant={canalBadge(t.canal)}>{t.canal}</Badge>
                      <span className="text-sm font-medium text-text-1">
                        {tipoLabel(t.tipo)}
                      </span>
                    </div>
                    <p className="truncate text-[12px] text-text-3">
                      {t.deep_link ?? "—"} · {t.finalidade}
                    </p>
                  </div>
                  <span className="tabular shrink-0 text-[12px] text-text-3">
                    {fmtDia(t.agendado_para)}
                  </span>
                </div>
              ))
            )}
          </CardBody>
        </Card>

        {/* ── Check-in + adesão ── */}
        <Card>
          <CardHeader>
            <CardTitle>Check-in do paciente</CardTitle>
            {authed && (
              <div className="mt-2 flex items-center gap-2">
                <input
                  className={inputCls}
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
                      <option key={x.id} value={x.id}>
                        {x.nome}
                      </option>
                    ))}
                  </select>
                )}
              </div>
            )}
          </CardHeader>
          <CardBody>
            <div className="space-y-2 rounded-md border border-border bg-bg-1 p-3">
              <div className="flex flex-wrap items-center gap-2">
                <label className="text-[12px] text-text-3">Adesão</label>
                <select
                  className={selCls}
                  value={ck.adesao}
                  onChange={(e) => setCk({ ...ck, adesao: e.target.value })}
                  disabled={!authed}
                >
                  <option value="feito">fez</option>
                  <option value="parcial">parcial</option>
                  <option value="nao_feito">não fez</option>
                </select>
                <label className="text-[12px] text-text-3">Evolução</label>
                <select
                  className={selCls}
                  value={ck.delta}
                  onChange={(e) => setCk({ ...ck, delta: e.target.value })}
                  disabled={!authed}
                >
                  <option value="melhora">melhora</option>
                  <option value="estavel">estável</option>
                  <option value="piora">piora</option>
                </select>
              </div>
              <label className="flex items-center gap-2 text-[13px] text-text-2">
                <input
                  type="checkbox"
                  checked={ck.quer_contato}
                  onChange={(e) => setCk({ ...ck, quer_contato: e.target.checked })}
                  disabled={!authed}
                />
                Paciente quer contato
              </label>
              <button onClick={registrarCheckin} disabled={!authed} className={btnPrimary}>
                Registrar check-in
              </button>
              <p className="text-[12px] text-text-3">
                Não-adesão, piora ou pedido de contato geram tarefa na fila (escala por exceção).
              </p>
            </div>

            {ad && (
              <div className="mt-4">
                <p className="mb-1 text-[12px] font-medium uppercase tracking-[0.06em] text-text-3">
                  Adesão real × esperado
                </p>
                <div className="flex items-baseline gap-2">
                  <span className="font-serif text-[26px] font-semibold text-text-1">
                    {ad.taxa_adesao !== null ? `${Math.round(ad.taxa_adesao * 100)}%` : "—"}
                  </span>
                  <span className="text-[12px] text-text-3">
                    de {ad.checkins} check-in(s)
                  </span>
                </div>
                <div className="mt-2 flex gap-2">
                  {(["feito", "parcial", "nao_feito"] as const).map((k) => (
                    <div
                      key={k}
                      className="flex-1 rounded-md border border-border bg-bg-1 px-2 py-1.5 text-center"
                    >
                      <p className="tabular text-sm font-medium text-text-1">{ad.real[k]}</p>
                      <p className="text-[11px] text-text-3">{ADESAO_LABEL[k]}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardBody>
        </Card>
      </div>
    </>
  );
}
