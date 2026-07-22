/**
 * Cliente da API do POC (FastAPI no VPS, via rewrite /api/poc do next.config).
 *
 * Token JWT vive SÓ EM MEMÓRIA (mesma decisão do POC /consulta: nada em
 * localStorage/sessionStorage) — reload da página encerra a sessão e pede
 * re-login. Aceitável no POC; sessão persistente = falta declarada no módulo.
 */
import type { BriefingPayload } from "@/lib/briefing";
import type {
  AgendaAppointment,
  OcupacaoMedico,
  RecursoClinica,
} from "@/lib/agenda";
import type {
  EntitlementMe,
  ScanDetail,
  ScanResumo,
  SeriePonto,
} from "@/lib/instrumento";
import type { InstrumentoPendente, WorkspaceToday } from "@/lib/workspace";
import type { FichaPaciente } from "@/lib/ficha";
import type { FilaCluster, PropostaDetalhe } from "@/lib/biblioteca";
import type {
  Matricula,
  Oferta,
  Programa,
  ProgramaDetalhe,
} from "@/lib/planos";
import type {
  Invoice,
  InvoiceDetalhe,
  ProviderConfig,
} from "@/lib/billing";
import type { Pipeline, RiscoPaciente } from "@/lib/crm";
import type {
  Adesao,
  CheckinResultado,
  DispatchResultado,
  MsgProvider,
  Pendente,
} from "@/lib/cadencia";
import type { Instrumento, PromResultado, Serie } from "@/lib/prom";
import type { Encounter, Workspace } from "@/lib/consulta";

const BASE = "/api/poc";

let _token: string | null = null;

export class ApiError extends Error {
  constructor(
    public status: number,
    detail: string
  ) {
    super(detail);
    this.name = "ApiError";
  }
}

async function req<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
      ...(_token ? { Authorization: `Bearer ${_token}` } : {}),
    },
  });
  if (!res.ok) {
    let detail = `HTTP ${res.status}`;
    try {
      const j = await res.json();
      if (j?.detail) {
        detail = typeof j.detail === "string" ? j.detail : JSON.stringify(j.detail);
      }
    } catch {
      // corpo não-JSON (ex.: 502 do proxy) — mantém o detail genérico
    }
    if (res.status === 401) _token = null;
    throw new ApiError(res.status, detail);
  }
  return res.json() as Promise<T>;
}

export interface LoginIn {
  tenant_slug: string;
  email: string;
  password: string;
  totp_code?: string;
}

export async function apiLogin(input: LoginIn): Promise<void> {
  const out = await req<{ access_token: string }>("/auth/login", {
    method: "POST",
    body: JSON.stringify(input),
  });
  _token = out.access_token;
}

export function apiLogout(): void {
  _token = null;
}

export function temToken(): boolean {
  return _token !== null;
}

export interface AgendaDiaOut {
  data: string;
  appointments: AgendaAppointment[];
}

export interface OcupacaoOut {
  de: string;
  ate: string;
  por_medico: OcupacaoMedico[];
  por_recurso: {
    resource_id: string;
    recurso: string;
    tipo: string;
    total: number;
    horas_ocupadas: number | null;
  }[];
}

export const api = {
  patients: (q?: string) =>
    req<{ id: string; nome: string }[]>(
      q ? `/patients?q=${encodeURIComponent(q)}` : "/patients"
    ),
  ficha: (pid: string) => req<FichaPaciente>(`/patients/${pid}/ficha`),
  briefing: (pid: string) => req<BriefingPayload>(`/pacientes/${pid}/briefing`),
  agendaDia: (data: string, medicoId?: string) =>
    req<AgendaDiaOut>(
      `/agenda/dia?data=${data}${medicoId ? `&medico_id=${medicoId}` : ""}`
    ),
  ocupacao: (de: string, ate: string) =>
    req<OcupacaoOut>(`/agenda/ocupacao?de=${de}&ate=${ate}`),
  recursos: () => req<RecursoClinica[]>("/agenda/recursos"),
  entitlementMe: () => req<EntitlementMe>("/instrumento/entitlement/me"),
  instrumentoScans: (pid: string) =>
    req<ScanResumo[]>(`/instrumento/paciente/${pid}/scans`),
  instrumentoScan: (scanId: string) =>
    req<ScanDetail>(`/instrumento/scans/${scanId}`),
  instrumentoSerie: (pid: string, item: string) =>
    req<SeriePonto[]>(
      `/instrumento/paciente/${pid}/serie?item=${encodeURIComponent(item)}`
    ),
  workspaceToday: () => req<WorkspaceToday>("/workspace/today"),
  workspaceItemAcao: (id: string, acao: "done" | "dismiss" | "snooze", dias?: number) =>
    req<{ id: string; status: string }>(`/workspace/items/${id}/${acao}`, {
      method: "POST",
      body: acao === "snooze" ? JSON.stringify({ dias: dias ?? 1 }) : undefined,
    }),
  instrumentoPendentes: () => req<InstrumentoPendente[]>("/instrumento/pendentes"),
  // ── Biblioteca clínica (curadoria de merge, Onda 2) ──
  bibliotecaFila: () => req<FilaCluster[]>("/biblioteca/fila"),
  bibliotecaProposta: (id: string) =>
    req<PropostaDetalhe>(`/biblioteca/propostas/${id}`),
  bibliotecaAceitar: (id: string) =>
    req<{ id: string; status: string; golden_item_id: string | null }>(
      `/biblioteca/propostas/${id}/aceitar`,
      { method: "POST" }
    ),
  bibliotecaRejeitar: (id: string, motivo?: string) =>
    req<{ id: string; status: string }>(
      `/biblioteca/propostas/${id}/rejeitar`,
      { method: "POST", body: JSON.stringify({ motivo: motivo ?? null }) }
    ),
  // ── Planos comerciais (Onda 3: /comercial) ──
  programas: () => req<Programa[]>("/comercial/programas"),
  programa: (tid: string) => req<ProgramaDetalhe>(`/comercial/programas/${tid}`),
  criarPrograma: (body: {
    nome: string;
    descricao?: string | null;
    duracao_dias?: number | null;
    cadencia_checkin_dias?: number | null;
    inclusoes?: string[];
    exclusoes?: string[];
    termos?: string | null;
  }) =>
    req<{ id: string }>("/comercial/programas", {
      method: "POST",
      body: JSON.stringify(body),
    }),
  ativarPrograma: (tid: string) =>
    req<{ id: string; status: string }>(`/comercial/programas/${tid}/ativar`, {
      method: "POST",
    }),
  criarPreco: (
    tid: string,
    body: {
      modalidade: string;
      valor_centavos: number;
      moeda?: string;
      parcelas?: number | null;
      periodicidade?: string | null;
    }
  ) =>
    req<{ id: string }>(`/comercial/programas/${tid}/precos`, {
      method: "POST",
      body: JSON.stringify(body),
    }),
  ofertasPaciente: (pid: string) =>
    req<Oferta[]>(`/comercial/pacientes/${pid}/ofertas`),
  criarOferta: (
    pid: string,
    body: { template_id: string; price_id?: string | null; metas?: string[] }
  ) =>
    req<{ id: string; terms_hash: string }>(
      `/comercial/pacientes/${pid}/ofertas`,
      { method: "POST", body: JSON.stringify(body) }
    ),
  aceitarOferta: (oid: string) =>
    req<{ offer_id: string; status: string; enrollment_id: string }>(
      `/comercial/ofertas/${oid}/aceitar`,
      { method: "POST" }
    ),
  recusarOferta: (oid: string, motivo?: string) =>
    req<{ offer_id: string; status: string }>(
      `/comercial/ofertas/${oid}/recusar`,
      { method: "POST", body: JSON.stringify({ motivo: motivo ?? null }) }
    ),
  matricula: (eid: string) => req<Matricula>(`/comercial/matriculas/${eid}`),
  // ── Billing (Onda 3: /billing) ──
  providerConfigs: () => req<ProviderConfig[]>("/billing/provider-configs"),
  criarProviderConfig: (body: {
    kind: string;
    provider: string;
    display_nome?: string | null;
    credenciais?: Record<string, string>;
    cert_ref?: string | null;
    is_default?: boolean;
    sandbox?: boolean;
  }) =>
    req<{ id: string }>("/billing/provider-configs", {
      method: "POST",
      body: JSON.stringify(body),
    }),
  invoices: () => req<Invoice[]>("/billing/invoices"),
  criarInvoice: (body: {
    valor_centavos: number;
    enrollment_id?: string | null;
    subscription_id?: string | null;
    offer_id?: string | null;
    descricao?: string | null;
    cpf_cnpj?: string | null;
    nome?: string | null;
  }) =>
    req<{ id: string; status: string; provider_ref: string; pix_copia_cola: string; pix_qr_b64: string | null }>(
      "/billing/invoices",
      { method: "POST", body: JSON.stringify(body) }
    ),
  invoice: (iid: string) => req<InvoiceDetalhe>(`/billing/invoices/${iid}`),
  // ── CRM (Onda 4: /crm) ──
  crmPipeline: () => req<Pipeline>("/crm/pipeline"),
  crmAvaliarRisco: (pid: string) =>
    req<RiscoPaciente & { work_item_id: string | null }>(
      `/crm/pacientes/${pid}/avaliar-risco`,
      { method: "POST" }
    ),
  // ── Cadências (Onda 4: /cadencia) ──
  cadenciaPendentes: () => req<Pendente[]>("/cadencia/pendentes"),
  cadenciaDispatch: () =>
    req<DispatchResultado>("/cadencia/dispatch", { method: "POST" }),
  cadenciaProviderConfigs: () =>
    req<MsgProvider[]>("/cadencia/provider-configs"),
  cadenciaCheckin: (body: {
    patient_id: string;
    adesao: string;
    delta?: string | null;
    barreira?: string | null;
    quer_contato?: boolean;
  }) =>
    req<CheckinResultado>("/cadencia/checkin", {
      method: "POST",
      body: JSON.stringify(body),
    }),
  cadenciaAdesao: (pid: string) =>
    req<Adesao>(`/cadencia/pacientes/${pid}/adesao`),
  // ── PROMs (Onda 4: /prom) ──
  promInstrumentos: () => req<Instrumento[]>("/prom/instrumentos"),
  promAplicar: (body: { patient_id: string; instrumento: string; respostas: Record<string, number> }) =>
    req<PromResultado>("/prom/aplicar", { method: "POST", body: JSON.stringify(body) }),
  promSerie: (pid: string, instrumento: string) =>
    req<Serie>(`/prom/pacientes/${pid}/serie?instrumento=${encodeURIComponent(instrumento)}`),
  // ── Consulta Copiloto (Onda 5: /atendimentos + /copiloto) ──
  atendimentos: (pid: string) => req<Encounter[]>(`/atendimentos?patient_id=${pid}`),
  criarAtendimento: (pid: string) =>
    req<{ id: string }>("/atendimentos", { method: "POST", body: JSON.stringify({ patient_id: pid }) }),
  copilotoInit: (eid: string) => req<{ encounter_id: string }>(`/copiloto/${eid}/init`, { method: "POST" }),
  copilotoWorkspace: (eid: string) => req<Workspace>(`/copiloto/${eid}/workspace`),
  copilotoScribe: (eid: string) =>
    req<{ secoes_preenchidas: number }>(`/copiloto/${eid}/scribe`, { method: "POST" }),
  copilotoSalvarSecao: (eid: string, secao: string, conteudo: string) =>
    req<{ secao: string; status: string }>(`/copiloto/${eid}/secoes/${secao}`, {
      method: "PUT",
      body: JSON.stringify({ conteudo }),
    }),
  copilotoAssinarSecao: (eid: string, secao: string) =>
    req<{ secao: string; status: string }>(`/copiloto/${eid}/secoes/${secao}/assinar`, { method: "POST" }),
  copilotoChecklist: (eid: string, item: string, status: string) =>
    req<{ item: string; status: string }>(`/copiloto/${eid}/checklist/${item}`, {
      method: "PUT",
      body: JSON.stringify({ status }),
    }),
  copilotoFinalizar: (eid: string) =>
    req<{ pode_finalizar: boolean; avisos: string[] }>(`/copiloto/${eid}/finalizar`, { method: "POST" }),
};
