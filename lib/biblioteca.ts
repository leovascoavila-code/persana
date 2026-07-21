/**
 * Contrato da Biblioteca Clínica — curadoria assistida de merge (Onda 2 Sakana).
 *
 * Espelha o router `/biblioteca` (saas-clinico, modules/curadoria.py):
 *   GET  /biblioteca/fila                     -> FilaCluster[]  (view content_curation_queue + proposta aberta)
 *   GET  /biblioteca/propostas?status_filtro= -> PropostaResumo[]
 *   GET  /biblioteca/propostas/{id}           -> PropostaDetalhe (golden + membros p/ o diff)
 *   POST /biblioteca/propostas/{id}/aceitar   -> aceite HUMANO: golden vira content_item approved
 *   POST /biblioteca/propostas/{id}/rejeitar  -> {motivo?}
 *
 * Doutrina 021: fundir e' ato de curadoria humana. O pipeline (scripts/
 * curadoria_batch.py) so PROPOE; o merge so acontece com aceite do medico.
 * Deslogado renderiza MOCK_*; logado busca o real via /api/poc.
 */

export type ContentType = "active_description" | "formulation" | "protocol" | string;
export type MergeDecision = "identical" | "merge_variants" | "distinct" | "needs_human";
export type PropostaStatus = "proposed" | "accepted" | "rejected";
export type ProposedBy = "deterministic" | "llm_batch";

export interface FilaCluster {
  content_key: string;
  content_type: ContentType;
  n_itens: number;
  n_fontes: number;
  fontes: string[] | null;
  titulo_exemplo: string | null;
  tem_terceiro: boolean | null;
  proposta_id: string | null;
  decision: MergeDecision | null;
  confidence: number | null;
  proposed_by: ProposedBy | null;
}

export interface MembroProposta {
  id: string;
  canonical_title: string;
  status: string;
  payload: Record<string, unknown> | null;
  fonte: string | null;
}

export interface PropostaDetalhe {
  id: string;
  content_key: string;
  content_type: ContentType;
  member_ids: string[];
  golden_title: string;
  golden_payload: Record<string, unknown>;
  decision: MergeDecision;
  conflicts: string[];
  confidence: number | null;
  proposed_by: ProposedBy;
  model_ref: string | null;
  status: PropostaStatus;
  golden_item_id: string | null;
  notas: string | null;
  criado_em: string;
  membros: MembroProposta[];
}

export const DECISION_LABEL: Record<MergeDecision, string> = {
  identical: "idêntico",
  merge_variants: "fundir variantes",
  distinct: "distintos",
  needs_human: "requer análise",
};

/** cor do badge de decisão: idêntico = alta confiança (accent), variantes =
 *  neutro, distintos/requer-análise = warn (atenção humana). Vermelho nunca —
 *  reservado a danger (regra de cor Tinta). */
export function decisionBadge(d: MergeDecision): "accent" | "warn" | "neutral" {
  if (d === "identical") return "accent";
  if (d === "needs_human" || d === "distinct") return "warn";
  return "neutral";
}

export const CONTENT_TYPE_LABEL: Record<string, string> = {
  active_description: "descrição de ativo",
  formulation: "formulação",
  protocol: "protocolo",
};

export function tipoLabel(ct: ContentType): string {
  return CONTENT_TYPE_LABEL[ct] ?? ct;
}

/** 0..1 -> "100%" (sem casas quando redondo). null -> "—". */
export function confiancaPct(c: number | null | undefined): string {
  if (c === null || c === undefined) return "—";
  const p = c * 100;
  return `${Number.isInteger(p) ? p : p.toFixed(0)}%`;
}

/** pares escalares do payload p/ o diff — genérico entre content_types.
 *  Ignora arrays/objetos (mostra "[…]"), prioriza campos clínicos conhecidos. */
export function paresPayload(
  payload: Record<string, unknown> | null | undefined,
  max = 5
): [string, string][] {
  if (!payload) return [];
  const PRIOR = ["principio_ativo", "apresentacao", "nome", "titulo", "dose", "via", "classe"];
  const chaves = Object.keys(payload).sort((a, b) => {
    const ia = PRIOR.indexOf(a);
    const ib = PRIOR.indexOf(b);
    return (ia === -1 ? 99 : ia) - (ib === -1 ? 99 : ib);
  });
  const out: [string, string][] = [];
  for (const k of chaves) {
    if (out.length >= max) break;
    const v = payload[k];
    if (v === null || v === undefined) continue;
    if (Array.isArray(v)) out.push([k, `[${v.length}]`]);
    else if (typeof v === "object") out.push([k, "[…]"]);
    else out.push([k, String(v)]);
  }
  return out;
}

// ---------------------------------------------------------------------------
// MOCK ilustrativo (só deslogado; datas fixas — nada de Date() no render SSR)
// ---------------------------------------------------------------------------

export const MOCK_FILA: FilaCluster[] = [
  {
    content_key: "mock-ck-1",
    content_type: "active_description",
    n_itens: 4,
    n_fontes: 2,
    fontes: ["catalogo_a", "catalogo_b"],
    titulo_exemplo: "Sulfametoxazol + Trimetoprima",
    tem_terceiro: false,
    proposta_id: "mock-pr1",
    decision: "identical",
    confidence: 1.0,
    proposed_by: "deterministic",
  },
  {
    content_key: "mock-ck-2",
    content_type: "formulation",
    n_itens: 3,
    n_fontes: 2,
    fontes: ["farmacia_amy", "maria_rocha"],
    titulo_exemplo: "Minoxidil 5% + Finasterida 0,1%",
    tem_terceiro: true,
    proposta_id: "mock-pr2",
    decision: "merge_variants",
    confidence: 0.82,
    proposed_by: "llm_batch",
  },
  {
    content_key: "mock-ck-3",
    content_type: "protocol",
    n_itens: 2,
    n_fontes: 2,
    fontes: ["protocolos_modelo", "medint"],
    titulo_exemplo: "Protocolo de higiene do sono",
    tem_terceiro: false,
    proposta_id: "mock-pr3",
    decision: "needs_human",
    confidence: 0.41,
    proposed_by: "llm_batch",
  },
  {
    content_key: "mock-ck-4",
    content_type: "active_description",
    n_itens: 3,
    n_fontes: 1,
    fontes: ["catalogo_a"],
    titulo_exemplo: "Colecalciferol (Vitamina D3)",
    tem_terceiro: false,
    proposta_id: null,
    decision: null,
    confidence: null,
    proposed_by: null,
  },
];

export const MOCK_PROPOSTAS: Record<string, PropostaDetalhe> = {
  "mock-pr1": {
    id: "mock-pr1",
    content_key: "mock-ck-1",
    content_type: "active_description",
    member_ids: ["mock-m1", "mock-m2"],
    golden_title: "Sulfametoxazol + Trimetoprima",
    golden_payload: {
      principio_ativo: "Sulfametoxazol+Trimetoprima",
      apresentacao: "400+80mg/mL",
      classe: "Associações de trimetoprima",
    },
    decision: "identical",
    conflicts: [],
    confidence: 1.0,
    proposed_by: "deterministic",
    model_ref: null,
    status: "proposed",
    golden_item_id: null,
    notas: null,
    criado_em: "2026-07-21T10:00:00Z",
    membros: [
      {
        id: "mock-m1",
        canonical_title: "Sulfametoxazol + Trimetoprima",
        status: "normalized",
        fonte: "catalogo_a",
        payload: {
          principio_ativo: "Sulfametoxazol+Trimetoprima",
          apresentacao: "400+80mg/mL",
          classe: "Associações de trimetoprima",
        },
      },
      {
        id: "mock-m2",
        canonical_title: "Sulfametoxazol + Trimetoprima",
        status: "raw_extracted",
        fonte: "catalogo_b",
        payload: {
          principio_ativo: "Sulfametoxazol+Trimetoprima",
          apresentacao: "400+80mg/mL",
          classe: "Associações de trimetoprima",
        },
      },
    ],
  },
  "mock-pr2": {
    id: "mock-pr2",
    content_key: "mock-ck-2",
    content_type: "formulation",
    member_ids: ["mock-m3", "mock-m4"],
    golden_title: "Minoxidil 5% + Finasterida 0,1% (loção capilar)",
    golden_payload: {
      nome: "Minoxidil 5% + Finasterida 0,1%",
      via: "tópica",
      apresentacao: "loção capilar 60mL",
    },
    decision: "merge_variants",
    conflicts: ["veículo divergente (loção alcoólica × propilenoglicol)"],
    confidence: 0.82,
    proposed_by: "llm_batch",
    model_ref: "claude-sonnet-5",
    status: "proposed",
    golden_item_id: null,
    notas: null,
    criado_em: "2026-07-21T10:05:00Z",
    membros: [
      {
        id: "mock-m3",
        canonical_title: "Minoxidil 5% Finasterida 0,1% loção",
        status: "normalized",
        fonte: "farmacia_amy",
        payload: { nome: "Minoxidil 5% + Finasterida 0,1%", via: "tópica", veiculo: "loção alcoólica" },
      },
      {
        id: "mock-m4",
        canonical_title: "Minox 5 + Fina 0,1 cap",
        status: "raw_extracted",
        fonte: "maria_rocha",
        payload: { nome: "Minoxidil 5 Finasterida 0,1", via: "tópica", veiculo: "propilenoglicol" },
      },
    ],
  },
  "mock-pr3": {
    id: "mock-pr3",
    content_key: "mock-ck-3",
    content_type: "protocol",
    member_ids: ["mock-m5", "mock-m6"],
    golden_title: "Protocolo de higiene do sono",
    golden_payload: { titulo: "Higiene do sono", secoes: ["ambiente", "rotina", "estimulantes"] },
    decision: "needs_human",
    conflicts: ["escopo divergente: um inclui melatonina, o outro é só comportamental"],
    confidence: 0.41,
    proposed_by: "llm_batch",
    model_ref: "claude-sonnet-5",
    status: "proposed",
    golden_item_id: null,
    notas: null,
    criado_em: "2026-07-21T10:10:00Z",
    membros: [
      {
        id: "mock-m5",
        canonical_title: "Higiene do sono (comportamental)",
        status: "normalized",
        fonte: "protocolos_modelo",
        payload: { titulo: "Higiene do sono", secoes: ["ambiente", "rotina"] },
      },
      {
        id: "mock-m6",
        canonical_title: "Protocolo sono + melatonina",
        status: "raw_extracted",
        fonte: "medint",
        payload: { titulo: "Sono e melatonina", secoes: ["rotina", "suplementação"] },
      },
    ],
  },
};
