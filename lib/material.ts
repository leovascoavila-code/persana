/** Material de apresentação ao paciente (S.16.2) — 7 seções leigas + branding. */

export type MaterialStatus = "rascunho" | "aprovado" | "descartado";

export type MaterialItem = {
  id: string;
  titulo: string | null;
  status: MaterialStatus;
  origem_ia: boolean;
  criado_em: string;
};

export type MaterialRendered = {
  titulo: string;
  branding: {
    nome_exibicao?: string | null;
    cor_primaria?: string | null;
    cor_secundaria?: string | null;
    logo_url?: string | null;
  };
  conteudo: Record<string, string | null>;
  disclaimer: string;
  status: MaterialStatus;
};

// ordem + rótulos das 7 seções leigas (espelha o backend material_pdf)
export const SECOES: [string, string][] = [
  ["o_que_e", "O que é"],
  ["por_que_recomendado", "Por que foi recomendado para você"],
  ["como_funciona", "Como funciona"],
  ["duracao_estimada", "Duração estimada"],
  ["o_que_esperar", "O que esperar"],
  ["proximos_passos", "Próximos passos"],
  ["observacoes", "Observações"],
];

export const STATUS_BADGE: Record<MaterialStatus, "ok" | "warn" | "neutral"> = {
  aprovado: "ok",
  rascunho: "warn",
  descartado: "neutral",
};

export const MOCK_LISTA: MaterialItem[] = [
  { id: "mock", titulo: "Plano metabólico — Ana L.", status: "rascunho", origem_ia: true, criado_em: "2026-07-20T10:00:00Z" },
  { id: "m2", titulo: "Longevidade muscular — Diego S.", status: "aprovado", origem_ia: true, criado_em: "2026-07-12T09:00:00Z" },
];

export const MOCK_MATERIAL: MaterialRendered = {
  titulo: "Seu plano de cuidado",
  branding: { nome_exibicao: "Clínica Vitalitá", cor_primaria: "#1F9463", cor_secundaria: "#1C7ED6", logo_url: null },
  status: "rascunho",
  disclaimer: "Material de apresentação em revisão pelo seu médico. Converse com ele(a) antes de iniciar.",
  conteudo: {
    o_que_e: "Um acompanhamento personalizado para organizar seu tratamento em etapas claras, com metas de bem-estar ao longo do caminho.",
    por_que_recomendado: "Foi escolhido a partir da sua avaliação e dos seus objetivos conversados na consulta.",
    como_funciona: "O plano acontece em fases, com pequenos ajustes e retornos programados para acompanhar sua evolução.",
    duracao_estimada: "Cerca de 3 meses, com reavaliação ao final do ciclo.",
    o_que_esperar: "Acompanhamento próximo da equipe, orientações práticas e espaço para tirar dúvidas quando precisar.",
    proximos_passos: "Agendar o primeiro retorno e alinhar os detalhes com a recepção.",
    observacoes: "Qualquer dúvida ou desconforto, fale com seu médico antes de mudar qualquer coisa por conta própria.",
  },
};
