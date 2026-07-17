"use client";

/** Agenda (CRM-1) — view Tinta.
 * Deslogado: MOCK do contrato (dia ilustrativo 17/07).
 * Logado: GET /agenda/dia (hoje) + /agenda/ocupacao (semana corrente) +
 * /agenda/recursos via proxy /api/poc — mesmo shape, só a fonte muda. */
import * as React from "react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Card, CardBody, CardHeader, CardTitle } from "@/components/ui/card";
import { StatTile } from "@/components/ui/stat-tile";
import { useAuth } from "@/components/app/auth";
import { api } from "@/lib/api";
import {
  MOCK_DIA,
  MOCK_OCUPACAO_MEDICOS,
  RECURSOS,
  horaLabel,
  minutosDoDia,
  ocupacaoPorHora,
  type AgendaAppointment,
  type AgendaStatus,
  type OcupacaoMedico,
  type RecursoClinica,
} from "@/lib/agenda";

const STATUS_META: Record<
  AgendaStatus,
  { label: string; variant: "ok" | "warn" | "accent" | "neutral" | "danger" | "brand" }
> = {
  marcado: { label: "marcado", variant: "neutral" },
  confirmado: { label: "✓ confirmado", variant: "accent" },
  realizado: { label: "✓ realizado", variant: "ok" },
  faltou: { label: "✕ faltou", variant: "danger" },
  cancelado: { label: "cancelado", variant: "neutral" },
  remarcado: { label: "→ remarcado", variant: "warn" },
};

const TIPO_LABEL: Record<AgendaAppointment["tipo"], string> = {
  consulta: "Consulta",
  retorno: "Retorno",
  procedimento: "Procedimento",
  exame: "Exame",
  bloqueio: "Bloqueio",
};

const DIAS_SEMANA = [
  "Domingo",
  "Segunda-feira",
  "Terça-feira",
  "Quarta-feira",
  "Quinta-feira",
  "Sexta-feira",
  "Sábado",
];
const MESES = [
  "janeiro", "fevereiro", "março", "abril", "maio", "junho",
  "julho", "agosto", "setembro", "outubro", "novembro", "dezembro",
];

// Janela do dia renderizada na timeline.
const H_INI = 8;
const H_FIM = 18;
const MIN_TOTAL = (H_FIM - H_INI) * 60;

function posicao(a: AgendaAppointment): { top: string; height: string } {
  const ini = Math.max(minutosDoDia(a.inicio) - H_INI * 60, 0);
  const dur = minutosDoDia(a.fim) - minutosDoDia(a.inicio);
  return {
    top: `${(ini / MIN_TOTAL) * 100}%`,
    height: `${(dur / MIN_TOTAL) * 100}%`,
  };
}

function BlocoAppointment({
  a,
  recursos,
}: {
  a: AgendaAppointment;
  recursos: RecursoClinica[];
}) {
  const meta = STATUS_META[a.status];
  const recurso = recursos.find((r) => r.id === a.resource_id)?.nome;
  const bloqueio = a.tipo === "bloqueio";
  return (
    <div
      className={
        "absolute left-14 right-1 overflow-hidden rounded-md border px-3 py-1.5 " +
        (bloqueio
          ? "border-dashed border-border bg-transparent"
          : "border-border bg-bg-2") +
        (a.status === "realizado" || a.status === "faltou" ? " opacity-75" : "")
      }
      style={posicao(a)}
      title={`${horaLabel(a.inicio)}–${horaLabel(a.fim)} · ${
        a.paciente ?? a.observacao ?? "Bloqueio"
      } · ${TIPO_LABEL[a.tipo]}${recurso ? ` · ${recurso}` : ""} · ${a.status}`}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="truncate text-[12.5px] font-medium text-text-1">
            <span className="tabular text-text-3">{horaLabel(a.inicio)}</span>{" "}
            {bloqueio ? `Bloqueio · ${a.observacao ?? ""}` : a.paciente}
          </p>
          <p className="truncate text-[11px] text-text-3">
            {TIPO_LABEL[a.tipo]}
            {recurso ? ` · ${recurso}` : ""}
          </p>
        </div>
        {!bloqueio && (
          <Badge variant={meta.variant} className="shrink-0 whitespace-nowrap">
            {meta.label}
          </Badge>
        )}
      </div>
    </div>
  );
}

function iso(d: Date): string {
  return d.toISOString().slice(0, 10);
}

export function AgendaView() {
  const { authed } = useAuth();
  const [dia, setDia] = React.useState<AgendaAppointment[] | null>(null);
  const [medicos, setMedicos] = React.useState<OcupacaoMedico[] | null>(null);
  const [recursos, setRecursos] = React.useState<RecursoClinica[] | null>(null);
  const [tituloDia, setTituloDia] = React.useState<string | null>(null);
  const [erro, setErro] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (!authed) {
      setDia(null);
      setMedicos(null);
      setRecursos(null);
      setTituloDia(null);
      setErro(null);
      return;
    }
    const hoje = new Date();
    const segunda = new Date(hoje);
    segunda.setDate(hoje.getDate() - ((hoje.getDay() + 6) % 7));
    const domingo = new Date(segunda);
    domingo.setDate(segunda.getDate() + 6);
    setTituloDia(
      `${DIAS_SEMANA[hoje.getDay()]}, ${hoje.getDate()} de ${MESES[hoje.getMonth()]}`
    );
    Promise.all([
      api.agendaDia(iso(hoje)),
      api.ocupacao(iso(segunda), iso(domingo)),
      api.recursos(),
    ])
      .then(([d, o, r]) => {
        setDia(d.appointments);
        setMedicos(o.por_medico);
        setRecursos(r);
        setErro(null);
      })
      .catch((e) => setErro(String(e.message ?? e)));
  }, [authed]);

  const real = dia !== null;
  const diaView = dia ?? MOCK_DIA;
  const medicosView = medicos ?? MOCK_OCUPACAO_MEDICOS;
  const recursosView = recursos && recursos.length > 0 ? recursos : RECURSOS;

  const consultas = diaView.filter((a) => a.tipo !== "bloqueio");
  const confirmadas = consultas.filter((a) => a.status === "confirmado").length;
  const marcadas = consultas.filter((a) => a.status === "marcado").length;
  const faltasSemana = medicosView.reduce((s, m) => s + m.faltas, 0);
  const horasSemana = medicosView.reduce(
    (s, m) => s + Number(m.horas_ocupadas ?? 0),
    0
  );
  const horas = Array.from({ length: H_FIM - H_INI }, (_, i) => H_INI + i);
  const maxHoras = Math.max(
    1,
    ...medicosView.map((m) => Number(m.horas_ocupadas ?? 0))
  );

  return (
    <>
      {/* cabeçalho */}
      <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-[12px] font-medium uppercase tracking-[0.08em] text-accent-300">
            Agenda · CRM-1
          </p>
          <h1 className="mt-1 font-serif text-[28px] font-semibold tracking-[-0.01em] text-text-1">
            {tituloDia ?? "Quinta-feira, 17 de julho"}
          </h1>
          <p className="mt-1 text-sm text-text-3">
            {real
              ? "todos os médicos · semana corrente"
              : "Dra. Helena Costa · dados ilustrativos"}{" "}
            · contrato do GET /agenda/dia + /agenda/ocupacao
          </p>
        </div>
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

      {authed && erro && (
        <p className="mb-4 rounded-sm border border-[color-mix(in_srgb,var(--danger)_35%,transparent)] bg-[color-mix(in_srgb,var(--danger)_12%,transparent)] px-3 py-2 text-[12.5px] text-[var(--danger)]">
          ✕ {erro} — exibindo o mock do contrato.
        </p>
      )}

      {/* números do dia/semana */}
      <div className="mb-4 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <StatTile
          label="Consultas hoje"
          value={String(consultas.length)}
          delta={`${diaView.length - consultas.length} bloqueio(s) de agenda`}
          trend="flat"
        />
        <StatTile
          label="Confirmadas"
          value={String(confirmadas)}
          delta={`aguardando: ${marcadas} marcada(s)`}
          trend="flat"
        />
        <StatTile
          label="Faltas na semana"
          value={String(faltasSemana)}
          delta="todas com follow-up"
          trend="flat"
        />
        <StatTile
          label="Horas ocupadas (semana)"
          value={String(Math.round(horasSemana))}
          delta={`${medicosView.length} médico(s) · ${recursosView.length} recurso(s)`}
          trend="flat"
        />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-5">
        {/* timeline do dia */}
        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle>
              Dia
              <span className="ml-2 font-normal text-text-3">
                · 08h–18h · badges = estado da máquina (marcado → confirmado →
                realizado | faltou)
              </span>
            </CardTitle>
          </CardHeader>
          <CardBody>
            {diaView.length === 0 ? (
              <p className="text-[13px] text-text-3">
                Nenhum appointment hoje — marque via POST /agenda/consultas.
              </p>
            ) : (
              <div className="relative" style={{ height: 640 }}>
                {horas.map((h, i) => (
                  <div
                    key={h}
                    className="absolute left-0 right-0 border-t border-border"
                    style={{ top: `${(i / (H_FIM - H_INI)) * 100}%` }}
                  >
                    <span className="tabular absolute -top-2 left-0 bg-bg-2 pr-2 text-[11px] text-text-3">
                      {String(h).padStart(2, "0")}h
                    </span>
                  </div>
                ))}
                {diaView.map((a) => (
                  <BlocoAppointment key={a.id} a={a} recursos={recursosView} />
                ))}
              </div>
            )}
          </CardBody>
        </Card>

        {/* ocupação */}
        <div className="flex flex-col gap-4 lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>
                Ocupação por recurso
                <span className="ml-2 font-normal text-text-3">
                  · hoje, por hora
                </span>
              </CardTitle>
            </CardHeader>
            <CardBody>
              <div className="flex flex-col gap-1.5">
                {recursosView.map((r) => {
                  const fracoes = ocupacaoPorHora(diaView, r.id, H_INI, H_FIM);
                  return (
                    <div key={r.id} className="flex items-center gap-2">
                      <span className="w-[92px] shrink-0 truncate text-[11.5px] text-text-2">
                        {r.nome}
                      </span>
                      <div className="grid flex-1 grid-cols-10 gap-[2px]">
                        {fracoes.map((f, i) => (
                          <div
                            key={i}
                            className="h-6 rounded-sm"
                            style={{
                              background:
                                f > 0
                                  ? `color-mix(in srgb, var(--accent-500) ${Math.round(
                                      12 + f * 48
                                    )}%, transparent)`
                                  : "var(--bg-3)",
                            }}
                            title={`${r.nome} · ${String(H_INI + i).padStart(2, "0")}h · ${Math.round(f * 100)}% ocupado`}
                          />
                        ))}
                      </div>
                    </div>
                  );
                })}
                <div className="mt-1 flex items-center justify-between pl-[100px]">
                  <span className="tabular text-[10.5px] text-text-3">08h</span>
                  <span className="text-[10.5px] text-text-3">
                    livre → ocupado (azul mais escuro)
                  </span>
                  <span className="tabular text-[10.5px] text-text-3">17h</span>
                </div>
              </div>
            </CardBody>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>
                Semana por médico
                <span className="ml-2 font-normal text-text-3">
                  · horas ocupadas
                </span>
              </CardTitle>
            </CardHeader>
            <CardBody className="flex flex-col gap-3">
              {medicosView.length === 0 && (
                <p className="text-[13px] text-text-3">
                  Sem appointments na semana corrente.
                </p>
              )}
              {medicosView.map((m) => (
                <div key={m.medico_id}>
                  <div className="flex items-baseline justify-between gap-2">
                    <p className="truncate text-[12.5px] text-text-1">
                      {m.medico}
                    </p>
                    <p className="tabular shrink-0 text-[12px] text-text-2">
                      {Number(m.horas_ocupadas ?? 0)
                        .toFixed(1)
                        .replace(".", ",")}{" "}
                      h
                    </p>
                  </div>
                  <div className="mt-1.5 h-1 overflow-hidden rounded-full bg-bg-3">
                    <div
                      className="h-full rounded-full bg-accent-500"
                      style={{
                        width: `${(Number(m.horas_ocupadas ?? 0) / maxHoras) * 100}%`,
                      }}
                    />
                  </div>
                  <p className="mt-1 text-[11px] text-text-3">
                    {m.total} consultas · {m.realizados} realizadas · {m.faltas}{" "}
                    {m.faltas === 1 ? "falta" : "faltas"}
                  </p>
                </div>
              ))}
            </CardBody>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Em breve na agenda</CardTitle>
            </CardHeader>
            <CardBody className="flex flex-col gap-2.5">
              {[
                [
                  "Risco de no-show + fila de espera",
                  "CRM-1.5 — precisa da agenda viva acumulando dado",
                ],
                [
                  "Marcação interativa na tela",
                  "hoje a UI é leitura; escrita via API live",
                ],
              ].map(([titulo, motivo]) => (
                <div
                  key={titulo}
                  className="flex items-start justify-between gap-3"
                >
                  <div>
                    <p className="text-[13px] text-text-2">{titulo}</p>
                    <p className="text-[11.5px] text-text-3">{motivo}</p>
                  </div>
                  <Badge
                    variant="neutral"
                    className="shrink-0 whitespace-nowrap"
                  >
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
