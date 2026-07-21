"use client";

/** Briefing pré-consulta (CRM-0) — view Tinta.
 * Deslogado: renderiza o MOCK do contrato (dados ilustrativos).
 * Logado: lista pacientes reais do POC e busca GET /pacientes/{pid}/briefing
 * via proxy /api/poc — mesmo shape, só a fonte muda. */
import * as React from "react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Card, CardBody, CardHeader, CardTitle } from "@/components/ui/card";
import { StatTile } from "@/components/ui/stat-tile";
import { Table, THead, TR, TH, TD } from "@/components/ui/table";
import { useAuth } from "@/components/app/auth";
import { BriefingInstrumento } from "@/components/app/instrumento-briefing";
import { api } from "@/lib/api";
import {
  MOCK_BRIEFING,
  fmtData,
  idade,
  type BriefingAnalito,
  type BriefingPayload,
} from "@/lib/briefing";

const CATEGORIA_LABEL: Record<string, string> = {
  familia: "Família",
  trabalho: "Trabalho",
  hobbies: "Hobbies",
  objetivos: "Objetivos",
  queixas: "Queixas",
  objecoes: "Objeções",
  preferencias: "Preferências",
};

const SECAO_FUTURA_LABEL: Record<string, string> = {
  adesao: "Adesão ao plano",
  oportunidades: "Oportunidades",
};

function FlagBadge({ a }: { a: BriefingAnalito }) {
  return (
    <Badge variant="warn">{a.flag === "alto" ? "▲ alto" : "▼ baixo"}</Badge>
  );
}

export function BriefingView() {
  const { authed } = useAuth();
  const [pacientes, setPacientes] = React.useState<{ id: string; nome: string }[]>([]);
  const [pid, setPid] = React.useState<string | null>(null);
  const [real, setReal] = React.useState<BriefingPayload | null>(null);
  const [erro, setErro] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (!authed) {
      setPacientes([]);
      setPid(null);
      setReal(null);
      setErro(null);
      return;
    }
    api
      .patients()
      .then((ps) => {
        setPacientes(ps);
        setPid(ps[0]?.id ?? null);
        if (!ps.length) setErro("nenhum paciente cadastrado neste tenant");
      })
      .catch((e) => setErro(String(e.message ?? e)));
  }, [authed]);

  React.useEffect(() => {
    if (!authed || !pid) return;
    setErro(null);
    api
      .briefing(pid)
      .then(setReal)
      .catch((e) => {
        setReal(null);
        setErro(String(e.message ?? e));
      });
  }, [authed, pid]);

  const b = real ?? MOCK_BRIEFING;
  const anos = idade(
    b.paciente.nascimento,
    real ? new Date().toISOString().slice(0, 10) : undefined
  );
  const delta = b.desde_ultima_consulta;

  return (
    <>
      {/* cabeçalho — paciente em Spectral, contexto da consulta */}
      <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-[12px] font-medium uppercase tracking-[0.08em] text-accent-300">
            Briefing pré-consulta
          </p>
          <h1 className="mt-1 font-serif text-[28px] font-semibold tracking-[-0.01em] text-text-1">
            {b.paciente.nome}
          </h1>
          <p className="mt-1 text-sm text-text-3">
            {anos !== null ? `${anos} anos` : "idade não informada"}
            {b.paciente.sexo ? ` · sexo ${b.paciente.sexo}` : ""} · última
            consulta assinada em{" "}
            <span className="tabular">
              {b.ultima_consulta ? fmtData(b.ultima_consulta.assinado_em) : "—"}
            </span>
          </p>
        </div>
        <div className="flex items-center gap-2">
          {authed && pacientes.length > 0 && (
            <select
              value={pid ?? ""}
              onChange={(e) => setPid(e.target.value)}
              className="rounded-sm border border-border bg-bg-2 px-2.5 py-1.5 text-[12.5px] text-text-1 focus-visible:border-brand-500 focus-visible:outline-none"
              aria-label="Paciente"
            >
              {pacientes.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.nome}
                </option>
              ))}
            </select>
          )}
          {real ? (
            <Badge variant="brand">dados reais do POC</Badge>
          ) : (
            <Badge variant="neutral">
              dados ilustrativos
              {!authed && (
                <Link href="/login" className="text-accent-300 hover:underline">
                  · entrar
                </Link>
              )}
            </Badge>
          )}
        </div>
      </div>

      {authed && erro && (
        <p className="mb-4 rounded-sm border border-[color-mix(in_srgb,var(--danger)_35%,transparent)] bg-[color-mix(in_srgb,var(--danger)_12%,transparent)] px-3 py-2 text-[12.5px] text-[var(--danger)]">
          ✕ {erro} — exibindo o mock do contrato.
        </p>
      )}

      {/* números do delta desde a última consulta */}
      <div className="mb-4 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <StatTile
          label="Exames novos"
          value={String(delta.exames_novos.length)}
          delta="desde a última consulta"
          trend="flat"
        />
        <StatTile
          label="Analitos alterados"
          value={String(delta.analitos_alterados.length)}
          delta="fora da faixa no período"
          trend="flat"
        />
        <StatTile
          label="Aguardam confirmação"
          value={String(delta.resultados_pendentes_confirmacao)}
          delta="revisão médica pendente"
          trend="flat"
        />
        <StatTile
          label="Red flags abertas"
          value={String(b.red_flags_abertas.length)}
          delta="reavaliar na consulta"
          trend={b.red_flags_abertas.length > 0 ? "down" : "flat"}
        />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-5">
        {/* coluna clínica */}
        <div className="flex flex-col gap-4 lg:col-span-3">
          {b.red_flags_abertas.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Red flags abertas</CardTitle>
              </CardHeader>
              <CardBody className="flex flex-col gap-2">
                {b.red_flags_abertas.map((rf) => (
                  <div key={rf.id} className="flex items-start gap-2.5">
                    <Badge
                      variant={rf.severidade === "critica" ? "danger" : "warn"}
                    >
                      {rf.severidade === "critica" ? "✕ crítica" : "! atenção"}
                    </Badge>
                    <p className="text-[13px] leading-relaxed text-text-2">
                      {rf.mensagem}
                    </p>
                  </div>
                ))}
              </CardBody>
            </Card>
          )}

          <Card>
            <CardHeader>
              <CardTitle>
                Desde a última consulta
                {delta.referencia && (
                  <span className="ml-2 font-normal text-text-3">
                    · referência {fmtData(delta.referencia)}
                  </span>
                )}
              </CardTitle>
            </CardHeader>
            <CardBody>
              {delta.analitos_alterados.length > 0 ? (
                <Table>
                  <THead>
                    <TR>
                      <TH>Analito</TH>
                      <TH>Valor</TH>
                      <TH>Faixa</TH>
                      <TH>Funcional</TH>
                      <TH>Revisão</TH>
                    </TR>
                  </THead>
                  <tbody>
                    {delta.analitos_alterados.map((a) => (
                      <TR key={a.analito}>
                        <TD className="font-medium text-text-1">{a.analito}</TD>
                        <TD className="tabular">
                          {a.valor ?? "—"}
                          {a.unidade ? ` ${a.unidade}` : ""}
                        </TD>
                        <TD>
                          <FlagBadge a={a} />
                        </TD>
                        <TD>{a.flag_funcional ?? "—"}</TD>
                        <TD>
                          {a.status_revisao === "pendente" ? (
                            <Badge variant="warn">! pendente</Badge>
                          ) : (
                            <Badge variant="ok">✓ confirmado</Badge>
                          )}
                        </TD>
                      </TR>
                    ))}
                  </tbody>
                </Table>
              ) : (
                <p className="text-[13px] text-text-3">
                  Nenhum analito alterado no período.
                </p>
              )}
              <div className="mt-3 flex flex-col gap-1.5">
                {delta.exames_novos.map((e) => (
                  <p key={e.id} className="text-[13px] text-text-2">
                    Exame de{" "}
                    <span className="tabular">{fmtData(e.data_coleta)}</span>
                    {e.laboratorio ? ` · ${e.laboratorio}` : ""} ·{" "}
                    <span className="text-text-3">status {e.status}</span>
                  </p>
                ))}
              </div>
            </CardBody>
          </Card>

          {b.ultima_consulta && (
            <Card>
              <CardHeader>
                <CardTitle>
                  Última consulta
                  <span className="ml-2 font-normal text-text-3">
                    · assinada em {fmtData(b.ultima_consulta.assinado_em)} · v
                    {b.ultima_consulta.versao}
                  </span>
                </CardTitle>
              </CardHeader>
              <CardBody className="flex flex-col gap-3">
                {b.ultima_consulta.conteudo.queixas && (
                  <div className="flex flex-wrap gap-1.5">
                    {b.ultima_consulta.conteudo.queixas.map((q) => (
                      <Badge key={q} variant="neutral">
                        {q}
                      </Badge>
                    ))}
                  </div>
                )}
                <dl className="flex flex-col gap-2">
                  {(["s", "o", "a", "p"] as const).map((k) => {
                    const v = b.ultima_consulta?.conteudo.soap?.[k];
                    if (!v) return null;
                    return (
                      <div key={k} className="flex gap-3">
                        <dt className="w-4 shrink-0 font-serif text-[13px] font-semibold uppercase text-text-3">
                          {k}
                        </dt>
                        <dd className="text-[13px] leading-relaxed text-text-2">
                          {v}
                        </dd>
                      </div>
                    );
                  })}
                </dl>
                {b.ultima_consulta.conteudo.follow_ups && (
                  <div>
                    <p className="mb-1 text-[12px] font-medium text-text-3">
                      Combinados da consulta
                    </p>
                    <ul className="flex flex-col gap-1">
                      {b.ultima_consulta.conteudo.follow_ups.map((f) => (
                        <li key={f} className="text-[13px] text-text-2">
                          → {f}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </CardBody>
            </Card>
          )}
        </div>

        {/* coluna de relacionamento */}
        <div className="flex flex-col gap-4 lg:col-span-2">
          {b.proxima_consulta && (
            <Card>
              <CardHeader>
                <CardTitle>Próxima consulta</CardTitle>
              </CardHeader>
              <CardBody>
                <p className="text-[13px] text-text-2">
                  <span className="tabular">
                    {fmtData(b.proxima_consulta.inicio)}
                  </span>{" "}
                  · {b.proxima_consulta.tipo} ·{" "}
                  <Badge variant="accent">{b.proxima_consulta.status}</Badge>
                </p>
              </CardBody>
            </Card>
          )}

          <Card>
            <CardHeader>
              <CardTitle>Rapport</CardTitle>
            </CardHeader>
            <CardBody className="flex flex-col gap-3">
              {Object.keys(b.rapport).length === 0 && (
                <p className="text-[13px] text-text-3">
                  Sem fatos de rapport aprovados ainda.
                </p>
              )}
              {Object.entries(b.rapport).map(([cat, fatos]) => (
                <div key={cat}>
                  <p className="mb-1 text-[12px] font-medium uppercase tracking-[0.06em] text-text-3">
                    {CATEGORIA_LABEL[cat] ?? cat}
                  </p>
                  <ul className="flex flex-col gap-1">
                    {fatos.map((f) => (
                      <li
                        key={f.fato}
                        className="text-[13px] leading-relaxed text-text-2"
                      >
                        {f.fato}
                        {f.fonte.startsWith("ia:") && (
                          <span className="ml-1.5 text-[11px] text-text-3">
                            · extraído por IA, aprovado
                          </span>
                        )}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </CardBody>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Protocolos em curso</CardTitle>
            </CardHeader>
            <CardBody className="flex flex-col gap-3">
              {b.protocolos_em_curso.length === 0 &&
                b.dietas_recentes.length === 0 && (
                  <p className="text-[13px] text-text-3">
                    Nenhum protocolo ou plano alimentar em curso.
                  </p>
                )}
              {b.protocolos_em_curso.map((p) => (
                <div key={p.id}>
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-[13px] font-medium text-text-1">
                      {p.nome}
                    </p>
                    <Badge variant={p.status === "ativo" ? "brand" : "neutral"}>
                      {p.status}
                    </Badge>
                  </div>
                  <p className="mt-1 text-[12px] text-text-3">
                    fase{" "}
                    <span className="tabular">
                      {p.fase_atual}
                      {p.total_fases ? ` de ${p.total_fases}` : ""}
                    </span>
                    {p.proxima_reavaliacao &&
                      ` · reavaliação ${fmtData(p.proxima_reavaliacao)}`}
                  </p>
                  {p.total_fases && (
                    <div className="mt-2 h-1 overflow-hidden rounded-full bg-bg-3">
                      <div
                        className="h-full rounded-full bg-brand-500"
                        style={{
                          width: `${Math.round((p.fase_atual / p.total_fases) * 100)}%`,
                        }}
                      />
                    </div>
                  )}
                </div>
              ))}
              {b.dietas_recentes.map((d) => (
                <div key={d.id} className="border-t border-border pt-3 first:border-t-0 first:pt-0">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-[13px] font-medium text-text-1">
                      Plano alimentar
                    </p>
                    <Badge variant="neutral">{d.status}</Badge>
                  </div>
                  <p className="mt-1 text-[12px] text-text-3">
                    {d.objetivo ?? "—"} · desde {fmtData(d.criado_em)}
                  </p>
                </div>
              ))}
            </CardBody>
          </Card>

          <BriefingInstrumento pid={pid} authed={authed} />

          {/* seções futuras — o payload já as declara com motivo */}
          <Card>
            <CardHeader>
              <CardTitle>Em breve neste briefing</CardTitle>
            </CardHeader>
            <CardBody className="flex flex-col gap-2.5">
              {Object.entries(b.secoes_futuras).map(([k, motivo]) => (
                <div key={k} className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-[13px] text-text-2">
                      {SECAO_FUTURA_LABEL[k] ?? k}
                    </p>
                    <p className="text-[11.5px] text-text-3">{motivo}</p>
                  </div>
                  <Badge variant="neutral" className="shrink-0 whitespace-nowrap">
                    em breve
                  </Badge>
                </div>
              ))}
            </CardBody>
          </Card>
        </div>
      </div>
    </>
  );
}
