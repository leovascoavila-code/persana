/**
 * Contrato da agenda (CRM-1).
 *
 * Espelha os payloads de `GET /agenda/dia` e `GET /agenda/ocupacao` do backend
 * (saas-clinico, modules/agenda.py — LIVE no VPS desde 17/07). Enquanto a UI
 * não liga no endpoint real (auth + fetch), renderiza MOCK_* — ao ligar, só o
 * fetch muda, o shape é este.
 */

export type AgendaStatus =
  | "marcado"
  | "confirmado"
  | "realizado"
  | "faltou"
  | "cancelado"
  | "remarcado";

export interface AgendaAppointment {
  id: string;
  patient_id: string | null;
  paciente: string | null; // null em tipo 'bloqueio'
  medico_id: string;
  resource_id: string | null;
  tipo: "consulta" | "retorno" | "procedimento" | "exame" | "bloqueio";
  inicio: string; // ISO
  fim: string;
  status: AgendaStatus;
  observacao: string | null;
}

export interface RecursoClinica {
  id: string;
  nome: string;
  tipo: "sala" | "equipamento" | "cadeira";
  ativo: boolean;
}

export interface OcupacaoMedico {
  medico_id: string;
  medico: string;
  total: number;
  realizados: number;
  faltas: number;
  cancelados: number;
  horas_ocupadas: number;
}

/** "2026-07-17T09:30:00Z" -> minutos desde 00:00 (parse por string; sem Date). */
export function minutosDoDia(iso: string): number {
  const [h, m] = iso.split("T")[1].slice(0, 5).split(":").map(Number);
  return h * 60 + m;
}

export function horaLabel(iso: string): string {
  return iso.split("T")[1].slice(0, 5);
}

/**
 * Fração ocupada (0..1) de cada hora cheia, por recurso — insumo do heatmap.
 * Deriva dos appointments do dia (fonte única); cancelado/faltou/remarcado
 * liberam o slot (mesma regra de STATUS_OCUPAM + realizado, que é passado).
 */
export function ocupacaoPorHora(
  appointments: AgendaAppointment[],
  resourceId: string,
  horaIni: number,
  horaFim: number
): number[] {
  const ocupam = new Set(["marcado", "confirmado", "realizado"]);
  const fracoes: number[] = [];
  for (let h = horaIni; h < horaFim; h++) {
    const celIni = h * 60;
    const celFim = celIni + 60;
    let minutos = 0;
    for (const a of appointments) {
      if (a.resource_id !== resourceId || !ocupam.has(a.status)) continue;
      const ini = Math.max(celIni, minutosDoDia(a.inicio));
      const fim = Math.min(celFim, minutosDoDia(a.fim));
      if (fim > ini) minutos += fim - ini;
    }
    fracoes.push(Math.min(1, minutos / 60));
  }
  return fracoes;
}

export const RECURSOS: RecursoClinica[] = [
  { id: "r-c1", nome: "Consultório 1", tipo: "sala", ativo: true },
  { id: "r-c2", nome: "Consultório 2", tipo: "sala", ativo: true },
  { id: "r-bio", nome: "Bioimpedância", tipo: "equipamento", ativo: true },
];

/** Dia demonstrativo (dados ilustrativos — nenhum dado real). */
export const MOCK_DIA: AgendaAppointment[] = [
  {
    id: "a1", patient_id: "p1", paciente: "Ana Lúcia Ferreira", medico_id: "m1",
    resource_id: "r-c1", tipo: "consulta", inicio: "2026-07-17T08:30:00Z",
    fim: "2026-07-17T09:30:00Z", status: "realizado", observacao: null,
  },
  {
    id: "a2", patient_id: "p2", paciente: "Bruno Martins", medico_id: "m1",
    resource_id: "r-c1", tipo: "retorno", inicio: "2026-07-17T09:30:00Z",
    fim: "2026-07-17T10:00:00Z", status: "realizado", observacao: null,
  },
  {
    id: "a3", patient_id: "p3", paciente: "Carla Ribeiro", medico_id: "m1",
    resource_id: "r-bio", tipo: "exame", inicio: "2026-07-17T10:00:00Z",
    fim: "2026-07-17T10:30:00Z", status: "realizado",
    observacao: "Bioimpedância de controle (protocolo fase 2)",
  },
  {
    id: "a4", patient_id: "p4", paciente: "Diego Santana", medico_id: "m1",
    resource_id: "r-c1", tipo: "consulta", inicio: "2026-07-17T10:30:00Z",
    fim: "2026-07-17T11:30:00Z", status: "faltou", observacao: null,
  },
  {
    id: "a5", patient_id: null, paciente: null, medico_id: "m1",
    resource_id: null, tipo: "bloqueio", inicio: "2026-07-17T12:00:00Z",
    fim: "2026-07-17T13:00:00Z", status: "marcado", observacao: "Almoço",
  },
  {
    id: "a6", patient_id: "p5", paciente: "Elisa Vasconcelos", medico_id: "m1",
    resource_id: "r-c1", tipo: "consulta", inicio: "2026-07-17T13:30:00Z",
    fim: "2026-07-17T14:30:00Z", status: "confirmado", observacao: "1ª consulta",
  },
  {
    id: "a7", patient_id: "p6", paciente: "Fábio Nogueira", medico_id: "m1",
    resource_id: "r-bio", tipo: "exame", inicio: "2026-07-17T14:30:00Z",
    fim: "2026-07-17T15:00:00Z", status: "confirmado", observacao: null,
  },
  {
    id: "a8", patient_id: "p7", paciente: "Gabriela Prado", medico_id: "m1",
    resource_id: "r-c2", tipo: "procedimento", inicio: "2026-07-17T15:00:00Z",
    fim: "2026-07-17T16:00:00Z", status: "confirmado", observacao: null,
  },
  {
    id: "a9", patient_id: "p8", paciente: "Henrique Sales", medico_id: "m1",
    resource_id: "r-c1", tipo: "consulta", inicio: "2026-07-17T16:30:00Z",
    fim: "2026-07-17T17:30:00Z", status: "marcado", observacao: null,
  },
];

/** Semana corrente por médico (espelho de GET /agenda/ocupacao). */
export const MOCK_OCUPACAO_MEDICOS: OcupacaoMedico[] = [
  {
    medico_id: "m1", medico: "Dra. Helena Costa", total: 31, realizados: 22,
    faltas: 2, cancelados: 1, horas_ocupadas: 24.5,
  },
  {
    medico_id: "m2", medico: "Dr. Rafael Pinheiro", total: 26, realizados: 19,
    faltas: 3, cancelados: 2, horas_ocupadas: 19.0,
  },
  {
    medico_id: "m3", medico: "Dra. Marina Duarte", total: 18, realizados: 14,
    faltas: 1, cancelados: 0, horas_ocupadas: 13.5,
  },
];
