import type { Metadata } from "next";
import { AppShell } from "@/components/app/app-shell";
import { Badge } from "@/components/ui/badge";
import { Card, CardBody, CardHeader, CardTitle } from "@/components/ui/card";
import { StatTile } from "@/components/ui/stat-tile";
import { Table, THead, TR, TH, TD } from "@/components/ui/table";
import {
  MOCK_BRIEFING,
  fmtData,
  idade,
  type BriefingAnalito,
} from "@/lib/briefing";

export const metadata: Metadata = {
  title: "Persana — Briefing pré-consulta",
};

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
  proxima_consulta: "Próxima consulta",
  adesao: "Adesão ao plano",
  oportunidades: "Oportunidades",
};

function FlagBadge({ a }: { a: BriefingAnalito }) {
  return (
    <Badge variant="warn">
      {a.flag === "alto" ? "▲ alto" : "▼ baixo"}
    </Badge>
  );
}

export default function BriefingPage() {
  const b = MOCK_BRIEFING;
  const anos = idade(b.paciente.nascimento);
  const delta = b.desde_ultima_consulta;

  return (
    <AppShell active="briefing">
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
            </span>{" "}
            · dados ilustrativos
          </p>
        </div>
        <Badge variant="neutral">CRM-0 · contrato do GET /briefing</Badge>
      </div>

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
                    <Badge variant={rf.severidade === "critica" ? "danger" : "warn"}>
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
              <div className="mt-3 flex flex-col gap-1.5">
                {delta.exames_novos.map((e) => (
                  <p key={e.id} className="text-[13px] text-text-2">
                    Exame de <span className="tabular">{fmtData(e.data_coleta)}</span>
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
          <Card>
            <CardHeader>
              <CardTitle>Rapport</CardTitle>
            </CardHeader>
            <CardBody className="flex flex-col gap-3">
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
              {b.protocolos_em_curso.map((p) => (
                <div key={p.id}>
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-[13px] font-medium text-text-1">{p.nome}</p>
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
                <div key={d.id} className="border-t border-border pt-3">
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
    </AppShell>
  );
}
