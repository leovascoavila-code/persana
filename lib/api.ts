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
  patients: () => req<{ id: string; nome: string }[]>("/patients"),
  briefing: (pid: string) => req<BriefingPayload>(`/pacientes/${pid}/briefing`),
  agendaDia: (data: string, medicoId?: string) =>
    req<AgendaDiaOut>(
      `/agenda/dia?data=${data}${medicoId ? `&medico_id=${medicoId}` : ""}`
    ),
  ocupacao: (de: string, ate: string) =>
    req<OcupacaoOut>(`/agenda/ocupacao?de=${de}&ate=${ate}`),
  recursos: () => req<RecursoClinica[]>("/agenda/recursos"),
};
