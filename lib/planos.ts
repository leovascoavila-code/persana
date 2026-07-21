/**
 * Contrato de Planos comerciais (Onda 3 Slices 1/2a) — Program/Offer Builder +
 * Care Plan Timeline.
 *
 * Espelha os routers /comercial (028) e /billing (029) do saas-clinico:
 *   GET  /comercial/programas                     -> Programa[]
 *   GET  /comercial/programas/{tid}               -> ProgramaDetalhe (+precos)
 *   POST /comercial/programas · /{tid}/ativar · /{tid}/precos
 *   POST /comercial/pacientes/{pid}/ofertas  · GET (lista)
 *   POST /comercial/ofertas/{oid}/aceitar · /recusar
 *   GET  /comercial/matriculas/{eid}              -> Matricula (snapshot imutavel)
 *
 * O programa vende SERVICO; formula/exame/medicamento ficam FORA (exclusoes).
 * Preco e' de servico proprio (nunca o motor de formula). Deslogado = MOCK_*.
 */

export type ProgramaStatus = "draft" | "ativo" | "retirado";
export type Modalidade = "a_vista" | "parcelado" | "recorrente";
export type OfertaStatus = "proposto" | "aceito" | "recusado" | "expirado";

export interface Programa {
  id: string;
  nome: string;
  descricao: string | null;
  duracao_dias: number | null;
  status: ProgramaStatus;
  versao: number;
  criado_em: string;
}

export interface Preco {
  id: string;
  modalidade: Modalidade;
  valor_centavos: number;
  moeda: string;
  parcelas: number | null;
  periodicidade: string | null;
  ativo: boolean;
}

export interface ProgramaDetalhe extends Programa {
  inclusoes: string[];
  exclusoes: string[];
  termos: string | null;
  precos: Preco[];
}

export interface Oferta {
  id: string;
  template_id: string;
  price_id: string | null;
  status: OfertaStatus;
  terms_hash: string;
  criado_em: string;
  decidido_em: string | null;
  expira_em: string | null;
}

export interface Matricula {
  id: string;
  status: string;
  inicio: string;
  fim: string | null;
  ciclo_atual: number;
  snapshot_programa: Record<string, unknown>;
  service_items: { id: string; tipo: string; descricao: string }[];
  clinical_links: { id: string; recurso_tipo: string; recurso_id: string }[];
}

export const PROGRAMA_STATUS_LABEL: Record<ProgramaStatus, string> = {
  draft: "rascunho",
  ativo: "ativo",
  retirado: "retirado",
};

export function programaBadge(s: ProgramaStatus): "ok" | "neutral" | "warn" {
  if (s === "ativo") return "ok";
  if (s === "retirado") return "warn";
  return "neutral";
}

export const OFERTA_STATUS_LABEL: Record<OfertaStatus, string> = {
  proposto: "proposta",
  aceito: "aceita",
  recusado: "recusada",
  expirado: "expirada",
};

export function ofertaBadge(s: OfertaStatus): "ok" | "neutral" | "warn" | "danger" {
  if (s === "aceito") return "ok";
  if (s === "recusado") return "danger";
  if (s === "expirado") return "warn";
  return "neutral";
}

export const MODALIDADE_LABEL: Record<Modalidade, string> = {
  a_vista: "à vista",
  parcelado: "parcelado",
  recorrente: "recorrente",
};

/** centavos -> "R$ 497,00" (sem Intl no SSR; monta na mao). */
export function valorBRL(centavos: number): string {
  const reais = Math.floor(centavos / 100);
  const cents = String(centavos % 100).padStart(2, "0");
  const milhar = String(reais).replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  return `R$ ${milhar},${cents}`;
}

export function precoLabel(p: Preco): string {
  const base = `${valorBRL(p.valor_centavos)} ${MODALIDADE_LABEL[p.modalidade]}`;
  if (p.modalidade === "parcelado" && p.parcelas) return `${base} ${p.parcelas}x`;
  if (p.modalidade === "recorrente" && p.periodicidade) return `${base}/${p.periodicidade}`;
  return base;
}

/** "2026-07-21T..." -> "21/07" (split; sem Date/locale no SSR). */
export function fmtDia(iso: string | null): string {
  if (!iso) return "—";
  const [, m, d] = iso.slice(0, 10).split("-");
  return `${d}/${m}`;
}

// ---------------------------------------------------------------------------
// MOCK ilustrativo (só deslogado; datas fixas — nada de Date() no render SSR)
// ---------------------------------------------------------------------------

export const MOCK_PROGRAMAS: Programa[] = [
  {
    id: "mock-pg1",
    nome: "Longevidade 90 dias",
    descricao: "Acompanhamento trimestral com metas de biomarcadores",
    duracao_dias: 90,
    status: "ativo",
    versao: 1,
    criado_em: "2026-07-18T10:00:00Z",
  },
  {
    id: "mock-pg2",
    nome: "Emagrecimento assistido",
    descricao: "12 semanas, check-ins quinzenais",
    duracao_dias: 84,
    status: "draft",
    versao: 1,
    criado_em: "2026-07-20T14:00:00Z",
  },
];

export const MOCK_PROGRAMA_DETALHE: ProgramaDetalhe = {
  ...MOCK_PROGRAMAS[0],
  inclusoes: ["3 consultas", "check-ins quinzenais", "PROMs de qualidade de vida"],
  exclusoes: ["fórmulas", "exames", "medicamentos"],
  termos: "Serviço de acompanhamento clínico. Sem promessa de resultado.",
  precos: [
    {
      id: "mock-pr1",
      modalidade: "recorrente",
      valor_centavos: 49700,
      moeda: "BRL",
      parcelas: null,
      periodicidade: "mensal",
      ativo: true,
    },
    {
      id: "mock-pr2",
      modalidade: "a_vista",
      valor_centavos: 129700,
      moeda: "BRL",
      parcelas: null,
      periodicidade: null,
      ativo: true,
    },
  ],
};

export const MOCK_OFERTAS: Oferta[] = [
  {
    id: "mock-of1",
    template_id: "mock-pg1",
    price_id: "mock-pr1",
    status: "aceito",
    terms_hash: "e625945256b6a1f0",
    criado_em: "2026-07-20T09:00:00Z",
    decidido_em: "2026-07-20T09:12:00Z",
    expira_em: null,
  },
  {
    id: "mock-of2",
    template_id: "mock-pg1",
    price_id: "mock-pr2",
    status: "proposto",
    terms_hash: "b71c0f9ad2e34455",
    criado_em: "2026-07-21T11:00:00Z",
    decidido_em: null,
    expira_em: "2026-07-28T11:00:00Z",
  },
];

export const MOCK_MATRICULA: Matricula = {
  id: "mock-en1",
  status: "ativo",
  inicio: "2026-07-20",
  fim: null,
  ciclo_atual: 1,
  snapshot_programa: {
    nome: "Longevidade 90 dias",
    duracao_dias: 90,
    exclusoes: ["fórmulas", "exames", "medicamentos"],
  },
  service_items: [],
  clinical_links: [],
};
