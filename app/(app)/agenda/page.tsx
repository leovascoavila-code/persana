import type { Metadata } from "next";
import { AppShell } from "@/components/app/app-shell";
import { Badge } from "@/components/ui/badge";
import { Card, CardBody, CardHeader, CardTitle } from "@/components/ui/card";
import { StatTile } from "@/components/ui/stat-tile";
import {
  MOCK_DIA,
  MOCK_OCUPACAO_MEDICOS,
  RECURSOS,
  horaLabel,
  minutosDoDia,
  ocupacaoPorHora,
  type AgendaAppointment,
  type AgendaStatus,
} from "@/lib/agenda";

export const metadata: Metadata = {
  title: "Persana — Agenda",
};

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

function BlocoAppointment({ a }: { a: AgendaAppointment }) {
  const meta = STATUS_META[a.status];
  const recurso = RECURSOS.find((r) => r.id === a.resource_id)?.nome;
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

export default function AgendaPage() {
  const dia = MOCK_DIA;
  const consultas = dia.filter((a) => a.tipo !== "bloqueio");
  const confirmadas = consultas.filter((a) => a.status === "confirmado").length;
  const faltasSemana = MOCK_OCUPACAO_MEDICOS.reduce((s, m) => s + m.faltas, 0);
  const horas = Array.from({ length: H_FIM - H_INI }, (_, i) => H_INI + i);
  const maxHoras = Math.max(...MOCK_OCUPACAO_MEDICOS.map((m) => m.horas_ocupadas));

  return (
    <AppShell active="agenda">
      {/* cabeçalho */}
      <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-[12px] font-medium uppercase tracking-[0.08em] text-accent-300">
            Agenda · CRM-1
          </p>
          <h1 className="mt-1 font-serif text-[28px] font-semibold tracking-[-0.01em] text-text-1">
            Quinta-feira, 17 de julho
          </h1>
          <p className="mt-1 text-sm text-text-3">
            Dra. Helena Costa · dados ilustrativos · contrato do GET /agenda/dia
            + /agenda/ocupacao
          </p>
        </div>
        <Badge variant="neutral">CRM-1 · backend live no VPS</Badge>
      </div>

      {/* números do dia/semana */}
      <div className="mb-4 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <StatTile
          label="Consultas hoje"
          value={String(consultas.length)}
          delta="1 bloqueio de agenda"
          trend="flat"
        />
        <StatTile
          label="Confirmadas"
          value={String(confirmadas)}
          delta={`aguardando: ${consultas.filter((a) => a.status === "marcado").length} marcada(s)`}
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
          value="57"
          delta="3 médicos · 3 recursos"
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
              {dia.map((a) => (
                <BlocoAppointment key={a.id} a={a} />
              ))}
            </div>
          </CardBody>
        </Card>

        {/* ocupação */}
        <div className="flex flex-col gap-4 lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>
                Ocupação por recurso
                <span className="ml-2 font-normal text-text-3">· hoje, por hora</span>
              </CardTitle>
            </CardHeader>
            <CardBody>
              <div className="flex flex-col gap-1.5">
                {RECURSOS.map((r) => {
                  const fracoes = ocupacaoPorHora(dia, r.id, H_INI, H_FIM);
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
                <span className="ml-2 font-normal text-text-3">· horas ocupadas</span>
              </CardTitle>
            </CardHeader>
            <CardBody className="flex flex-col gap-3">
              {MOCK_OCUPACAO_MEDICOS.map((m) => (
                <div key={m.medico_id}>
                  <div className="flex items-baseline justify-between gap-2">
                    <p className="truncate text-[12.5px] text-text-1">{m.medico}</p>
                    <p className="tabular shrink-0 text-[12px] text-text-2">
                      {m.horas_ocupadas.toFixed(1).replace(".", ",")} h
                    </p>
                  </div>
                  <div className="mt-1.5 h-1 overflow-hidden rounded-full bg-bg-3">
                    <div
                      className="h-full rounded-full bg-accent-500"
                      style={{ width: `${(m.horas_ocupadas / maxHoras) * 100}%` }}
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
                ["Risco de no-show + fila de espera", "CRM-1.5 — precisa da agenda viva acumulando dado"],
                ["Marcação interativa na tela", "hoje a UI é leitura; escrita via API live"],
                ["Ligar ao endpoint real", "auth + fetch — o shape já é o do contrato"],
              ].map(([titulo, motivo]) => (
                <div key={titulo} className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-[13px] text-text-2">{titulo}</p>
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
