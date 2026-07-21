/**
 * Contrato da ficha longitudinal — Patient 360 (Onda 1 parte 2).
 *
 * Espelha `GET /patients/{pid}/ficha` (saas-clinico, modules/patients.py).
 * Deslogado renderiza MOCK_FICHA; logado busca o real — o shape é este.
 * Instrumental NÃO vem na ficha (quarentena): bloco separado via
 * GET /instrumento/paciente/{pid}/scans.
 */

export interface FichaPaciente {
  paciente: {
    id: string;
    nome: string;
    nascimento: string | null;
    sexo: string | null;
    criado_em: string;
  };
  contadores: {
    exames: number;
    analitos_pendentes: number;
    documentos: number;
    documentos_rascunho: number;
    planos_ativos: number;
    consultas_realizadas: number;
    proxima_consulta: string | null;
  };
  timeline: { tipo: string; titulo: string; quando: string | null }[];
  exames: {
    id: string;
    data_coleta: string | null;
    laboratorio: string | null;
    status: string;
    analitos: number;
    pendentes: number;
  }[];
  planos: { id: string; status: string; versao: number; criado_em: string }[];
  documentos: {
    id: string;
    tipo: string;
    titulo: string | null;
    status: string;
    criado_em: string;
  }[];
}

export const TIMELINE_ICONE: Record<string, string> = {
  consulta: "◆",
  prontuario: "✎",
  exame: "◈",
  documento: "▤",
  plano: "▣",
};

/** "1984-03-12" + hoje ISO -> idade em anos (sem Date/locale no SSR) */
export function idadeAnos(nasc: string | null, hojeIso?: string): number | null {
  if (!nasc) return null;
  const hoje = hojeIso ?? "2026-07-21";
  const [ny, nm, nd] = nasc.slice(0, 10).split("-").map(Number);
  const [hy, hm, hd] = hoje.slice(0, 10).split("-").map(Number);
  let anos = hy - ny;
  if (hm < nm || (hm === nm && hd < nd)) anos -= 1;
  return anos;
}

/** "2026-07-21T13:00:00Z" -> "21/07/2026" (split por string) */
export function fmtDataCurta(iso: string | null): string {
  if (!iso) return "—";
  const [y, m, d] = iso.slice(0, 10).split("-");
  return `${d}/${m}/${y}`;
}

export const MOCK_FICHA: FichaPaciente = {
  paciente: {
    id: "mock-p1",
    nome: "Ana Lúcia Ferreira",
    nascimento: "1984-03-12",
    sexo: "F",
    criado_em: "2026-05-02T10:00:00Z",
  },
  contadores: {
    exames: 4,
    analitos_pendentes: 3,
    documentos: 5,
    documentos_rascunho: 1,
    planos_ativos: 1,
    consultas_realizadas: 6,
    proxima_consulta: "2026-08-04T13:00:00Z",
  },
  timeline: [
    { tipo: "exame", titulo: "Exame - Lab São Lucas", quando: "2026-07-18T09:00:00Z" },
    { tipo: "consulta", titulo: "Consulta realizado", quando: "2026-07-10T13:00:00Z" },
    { tipo: "prontuario", titulo: "Prontuário assinado v6", quando: "2026-07-10T14:05:00Z" },
    { tipo: "plano", titulo: "Plano de tratamento ativo", quando: "2026-07-10T14:10:00Z" },
    { tipo: "documento", titulo: "Orientações de sono", quando: "2026-07-10T14:12:00Z" },
  ],
  exames: [
    {
      id: "mock-e1",
      data_coleta: "2026-07-18",
      laboratorio: "Lab São Lucas",
      status: "recebido",
      analitos: 24,
      pendentes: 3,
    },
    {
      id: "mock-e2",
      data_coleta: "2026-04-02",
      laboratorio: "Lab São Lucas",
      status: "confirmado",
      analitos: 22,
      pendentes: 0,
    },
  ],
  planos: [
    { id: "mock-t1", status: "ativo", versao: 2, criado_em: "2026-07-10T14:10:00Z" },
  ],
  documentos: [
    {
      id: "mock-d1",
      tipo: "orientacao",
      titulo: "Orientações de sono",
      status: "aprovado",
      criado_em: "2026-07-10T14:12:00Z",
    },
    {
      id: "mock-d2",
      tipo: "relatorio",
      titulo: null,
      status: "rascunho",
      criado_em: "2026-07-19T11:00:00Z",
    },
  ],
};
