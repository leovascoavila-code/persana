"use client";

/** Pacientes + Ficha longitudinal (Patient 360, Onda 1 parte 2) — view Tinta.
 * Deslogado: MOCK_FICHA. Logado: busca (GET /patients?q=) + ficha real
 * (GET /patients/{pid}/ficha, 1 chamada BFF). Instrumental = bloco SEPARADO
 * e rotulado, fetch próprio (GET /instrumento/paciente/{pid}/scans); some
 * sem entitlement (403) — quarentena. Erro: mock + banner (padrão irmãs). */
import * as React from "react";
import { Badge } from "@/components/ui/badge";
import { Card, CardBody, CardHeader, CardTitle } from "@/components/ui/card";
import { StatTile } from "@/components/ui/stat-tile";
import { useAuth } from "@/components/app/auth";
import { api, ApiError } from "@/lib/api";
import type { ScanResumo } from "@/lib/instrumento";
import {
  MOCK_FICHA,
  TIMELINE_ICONE,
  fmtDataCurta,
  idadeAnos,
  type FichaPaciente,
} from "@/lib/ficha";

function Secao({ titulo, children }: { titulo: string; children: React.ReactNode }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{titulo}</CardTitle>
      </CardHeader>
      <CardBody>{children}</CardBody>
    </Card>
  );
}

export function PacientesView() {
  const { authed } = useAuth();
  const [q, setQ] = React.useState("");
  const [lista, setLista] = React.useState<{ id: string; nome: string }[]>([]);
  const [pid, setPid] = React.useState<string | null>(null);
  const [real, setReal] = React.useState<FichaPaciente | null>(null);
  const [scans, setScans] = React.useState<ScanResumo[] | null>(null);
  const [erro, setErro] = React.useState<string | null>(null);

  // busca (debounce curto) — meta: achar paciente em <=2s
  React.useEffect(() => {
    if (!authed) {
      setLista([]);
      setPid(null);
      setReal(null);
      setScans(null);
      setErro(null);
      return;
    }
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

  React.useEffect(() => {
    if (!authed || !pid) return;
    setErro(null);
    api
      .ficha(pid)
      .then(setReal)
      .catch((e) => {
        setReal(null);
        setErro(String(e.message ?? e));
      });
    api
      .instrumentoScans(pid)
      .then(setScans)
      .catch((e) => {
        setScans(null);
        void (e instanceof ApiError && e.status === 403); // sem feature -> some
      });
  }, [authed, pid]);

  const f = real ?? MOCK_FICHA;
  const anos = idadeAnos(
    f.paciente.nascimento,
    real ? new Date().toISOString().slice(0, 10) : undefined
  );

  return (
    <>
      <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-[12px] font-medium uppercase tracking-[0.08em] text-accent-300">
            Ficha longitudinal
          </p>
          <h1 className="mt-1 font-serif text-[28px] font-semibold tracking-[-0.01em] text-text-1">
            {f.paciente.nome}
          </h1>
          <p className="mt-1 text-sm text-text-3">
            {anos !== null ? `${anos} anos` : "idade não informada"}
            {f.paciente.sexo ? ` · sexo ${f.paciente.sexo}` : ""} · próxima
            consulta{" "}
            <span className="tabular">
              {fmtDataCurta(f.contadores.proxima_consulta)}
            </span>
          </p>
        </div>
        <div className="flex items-center gap-2">
          {authed ? (
            <>
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Buscar paciente…"
                className="w-56 rounded-md border border-border bg-bg-1 px-3 py-1.5 text-sm text-text-1 placeholder:text-text-3 focus:border-brand-500 focus:outline-none"
              />
              {lista.length > 0 && (
                <select
                  value={pid ?? ""}
                  onChange={(e) => setPid(e.target.value)}
                  className="max-w-52 rounded-md border border-border bg-bg-1 px-2 py-1.5 text-sm text-text-1"
                >
                  {lista.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.nome}
                    </option>
                  ))}
                </select>
              )}
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

      <div className="mb-6 grid grid-cols-2 gap-3 md:grid-cols-4">
        <StatTile
          label="Consultas realizadas"
          value={String(f.contadores.consultas_realizadas)}
        />
        <StatTile label="Exames" value={String(f.contadores.exames)} />
        <StatTile
          label="Analitos pendentes"
          value={String(f.contadores.analitos_pendentes)}
        />
        <StatTile
          label="Planos ativos"
          value={String(f.contadores.planos_ativos)}
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-[1.1fr_1fr]">
        <div className="space-y-4">
          <Secao titulo="Timeline">
            {f.timeline.length === 0 ? (
              <p className="text-sm text-text-3">Sem eventos ainda.</p>
            ) : (
              <ul className="space-y-0">
                {f.timeline.map((ev, i) => (
                  <li
                    key={i}
                    className="flex items-center justify-between gap-3 border-b border-border py-2.5 last:border-b-0"
                  >
                    <div className="flex min-w-0 items-center gap-2.5">
                      <span aria-hidden className="text-accent-300">
                        {TIMELINE_ICONE[ev.tipo] ?? "•"}
                      </span>
                      <p className="truncate text-sm text-text-1">{ev.titulo}</p>
                    </div>
                    <span className="tabular shrink-0 text-[13px] text-text-3">
                      {fmtDataCurta(ev.quando)}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </Secao>

          <Secao titulo="Exames laboratoriais">
            {f.exames.length === 0 ? (
              <p className="text-sm text-text-3">Nenhum exame.</p>
            ) : (
              <ul className="space-y-0">
                {f.exames.map((e) => (
                  <li
                    key={e.id}
                    className="flex items-center justify-between gap-3 border-b border-border py-2.5 last:border-b-0"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-text-1">
                        {e.laboratorio ?? "Laboratório não informado"}
                      </p>
                      <p className="text-[12.5px] text-text-3">
                        {e.analitos} analito(s)
                        {e.pendentes > 0 ? ` · ${e.pendentes} pendente(s)` : ""}
                      </p>
                    </div>
                    <div className="flex shrink-0 items-center gap-2">
                      {e.pendentes > 0 && (
                        <Badge variant="warn">▲ confirmar</Badge>
                      )}
                      <span className="tabular text-[13px] text-text-3">
                        {fmtDataCurta(e.data_coleta)}
                      </span>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </Secao>
        </div>

        <div className="space-y-4">
          <Secao titulo="Planos e prescrições">
            {f.planos.length === 0 ? (
              <p className="text-sm text-text-3">Nenhum plano.</p>
            ) : (
              <ul className="space-y-0">
                {f.planos.map((t) => (
                  <li
                    key={t.id}
                    className="flex items-center justify-between gap-3 border-b border-border py-2.5 last:border-b-0"
                  >
                    <p className="text-sm text-text-1">
                      Plano v{t.versao}
                      <span className="text-text-3"> · {t.status}</span>
                    </p>
                    <span className="tabular shrink-0 text-[13px] text-text-3">
                      {fmtDataCurta(t.criado_em)}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </Secao>

          <Secao titulo="Documentos">
            {f.documentos.length === 0 ? (
              <p className="text-sm text-text-3">Nenhum documento.</p>
            ) : (
              <ul className="space-y-0">
                {f.documentos.map((d) => (
                  <li
                    key={d.id}
                    className="flex items-center justify-between gap-3 border-b border-border py-2.5 last:border-b-0"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-sm text-text-1">
                        {d.titulo ?? d.tipo}
                      </p>
                    </div>
                    <div className="flex shrink-0 items-center gap-2">
                      {d.status === "rascunho" && (
                        <Badge variant="warn">✎ rascunho</Badge>
                      )}
                      <span className="tabular text-[13px] text-text-3">
                        {fmtDataCurta(d.criado_em)}
                      </span>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </Secao>

          {((authed && scans && scans.length > 0) || !authed) && (
            <Card>
              <CardHeader>
                <CardTitle>Instrumentos não diagnósticos</CardTitle>
                <p className="mt-1 text-[12px] text-text-3">
                  Dado de wellness/biofeedback. Uso apenas intra-paciente; não
                  utilizado para diagnóstico, care-gap ou sugestão terapêutica.
                </p>
              </CardHeader>
              <CardBody>
                {authed && scans ? (
                  <ul className="space-y-0">
                    {scans.slice(0, 5).map((s) => (
                      <li
                        key={s.id}
                        className="flex items-center justify-between gap-3 border-b border-border py-2.5 last:border-b-0"
                      >
                        <p className="text-sm text-text-1">{s.metodo}</p>
                        <span className="tabular shrink-0 text-[13px] text-text-3">
                          {fmtDataCurta(s.data_sessao)}
                        </span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-text-3">
                    Série histórica na aba{" "}
                    <span className="text-text-1">Instrumental</span>.
                  </p>
                )}
              </CardBody>
            </Card>
          )}
        </div>
      </div>
    </>
  );
}
