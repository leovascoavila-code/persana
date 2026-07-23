"use client";

/** Metas da clínica + alertas de desvio (S.19) — Tinta.
 * Deslogado: MOCK. Logado (admin): definir alvo por métrica (PUT) + verificar
 * desvios real×meta (GET) + gerar alertas (POST → work_item). Erro: mock + banner.
 * Alerta de desvio = tarefa na fila; honorários = serviço próprio (S.16.3). */
import * as React from "react";
import { Card, CardBody, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, THead, TR, TH, TD } from "@/components/ui/table";
import { useAuth } from "@/components/app/auth";
import { api } from "@/lib/api";
import {
  MOCK_CATALOGO,
  MOCK_DESVIOS,
  fmtMetaValor,
  mesAtual,
  type Desvio,
  type MetaCatalogo,
} from "@/lib/metas";

const inputCls =
  "w-24 rounded-md border border-border bg-bg-1 px-2 py-1 text-sm text-text-1 focus:border-brand-500 focus:outline-none";
const btn =
  "rounded-sm bg-brand-500 px-3 py-1.5 text-[13px] font-medium text-white transition-colors hover:bg-brand-600 disabled:opacity-40";
const btnGhost =
  "rounded-sm border border-border px-3 py-1.5 text-[13px] text-text-2 transition-colors hover:text-text-1 disabled:opacity-40";

export function MetasView() {
  const { authed } = useAuth();
  const [cat, setCat] = React.useState<MetaCatalogo[]>(MOCK_CATALOGO);
  const [alvos, setAlvos] = React.useState<Record<string, string>>({});
  const [desvios, setDesvios] = React.useState<Desvio[]>(MOCK_DESVIOS.desvios);
  const [comp, setComp] = React.useState(mesAtual());
  const [mock, setMock] = React.useState(true);
  const [erro, setErro] = React.useState<string | null>(null);
  const [busy, setBusy] = React.useState(false);

  const carregar = React.useCallback(async () => {
    const cs = await api.metas();
    setCat(cs);
    setAlvos(Object.fromEntries(cs.map((c) => [c.metrica, c.alvo != null ? String(c.alvo) : ""])));
    setMock(false);
  }, []);

  React.useEffect(() => {
    if (!authed) {
      setMock(true);
      setCat(MOCK_CATALOGO);
      setAlvos(Object.fromEntries(MOCK_CATALOGO.map((c) => [c.metrica, String(c.alvo ?? "")])));
      setDesvios(MOCK_DESVIOS.desvios);
      return;
    }
    carregar().catch((e) => {
      setErro(e instanceof Error ? e.message : "falha ao carregar");
      setMock(true);
    });
  }, [authed, carregar]);

  async function salvar(m: MetaCatalogo) {
    const v = parseFloat(alvos[m.metrica]);
    if (Number.isNaN(v) || mock) return;
    try {
      await api.metaDefinir(m.metrica, v, m.sentido_definido);
      await carregar();
    } catch (e) {
      setErro(e instanceof Error ? e.message : "falha ao salvar");
    }
  }

  async function verificar(gerarAlertas: boolean) {
    if (mock) return;
    setBusy(true);
    try {
      const r = gerarAlertas ? await api.metasAvaliar(comp) : await api.metasDesvios(comp);
      setDesvios(r.desvios);
      setErro(null);
    } catch (e) {
      setErro(e instanceof Error ? e.message : "falha ao avaliar");
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-[11px] uppercase tracking-[0.14em] text-accent-300">
            Metas & acompanhamento
          </p>
          <h1 className="mt-1 font-serif text-[26px] font-semibold tracking-[-0.01em] text-text-1">
            Metas da clínica
          </h1>
          <p className="mt-1 text-[13px] text-text-3">
            Defina os alvos e o sistema acompanha — desvios viram tarefa na fila.
          </p>
        </div>
        <div className="flex items-center gap-2">
          {(mock || erro) && (
            <Badge variant="warn">{erro ? `sem conexão — ${erro}` : "prévia (deslogado)"}</Badge>
          )}
          <input className={inputCls + " w-auto"} type="month" value={comp} onChange={(e) => setComp(e.target.value)} />
          <button className={btnGhost} onClick={() => verificar(false)} disabled={busy || !authed}>
            {busy ? "…" : "Verificar"}
          </button>
          <button className={btn} onClick={() => verificar(true)} disabled={busy || !authed}>
            Gerar alertas
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {/* definir alvos */}
        <Card>
          <CardHeader>
            <CardTitle>Alvos</CardTitle>
          </CardHeader>
          <CardBody>
            <div className="divide-y divide-border">
              {cat.map((m) => (
                <div key={m.metrica} className="flex items-center gap-2 py-2">
                  <div className="min-w-0 flex-1">
                    <div className="text-[13px] text-text-1">{m.rotulo}</div>
                    <div className="text-[11px] text-text-3">
                      {m.sentido_definido === "maior" ? "piso (≥)" : "teto (≤)"} · {m.unidade}
                    </div>
                  </div>
                  <input
                    className={inputCls}
                    value={alvos[m.metrica] ?? ""}
                    onChange={(e) => setAlvos({ ...alvos, [m.metrica]: e.target.value })}
                    placeholder="alvo"
                  />
                  <button className={btnGhost} onClick={() => salvar(m)} disabled={mock}>
                    Salvar
                  </button>
                </div>
              ))}
            </div>
          </CardBody>
        </Card>

        {/* desvios */}
        <Card>
          <CardHeader>
            <CardTitle>Real × meta ({comp})</CardTitle>
          </CardHeader>
          <CardBody>
            <div className="overflow-x-auto">
              <Table>
                <THead>
                  <TR>
                    <TH>Métrica</TH>
                    <TH>Meta</TH>
                    <TH>Real</TH>
                    <TH>Desvio</TH>
                    <TH>Status</TH>
                  </TR>
                </THead>
                <tbody>
                  {desvios.map((d) => (
                    <TR key={d.metrica}>
                      <TD>{d.rotulo}</TD>
                      <TD>
                        {d.sentido === "maior" ? "≥ " : "≤ "}
                        {fmtMetaValor(d.alvo, d.unidade)}
                      </TD>
                      <TD>{fmtMetaValor(d.real, d.unidade)}</TD>
                      <TD>
                        {d.desvio_pct === null ? "—" : `${d.desvio_pct > 0 ? "+" : ""}${d.desvio_pct}%`}
                      </TD>
                      <TD>
                        <Badge variant={d.no_alvo ? "ok" : "danger"}>
                          {d.no_alvo ? "no alvo" : "desvio"}
                        </Badge>
                      </TD>
                    </TR>
                  ))}
                </tbody>
              </Table>
            </div>
            <p className="mt-3 text-[12px] text-text-3">
              Métrica sem dado no mês fica de fora (não é avaliada como zero). Honorários = serviço
              próprio da clínica (S.16.3).
            </p>
          </CardBody>
        </Card>
      </div>
    </>
  );
}
