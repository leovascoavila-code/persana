/**
 * Contrato da Consulta Copiloto (Onda 5) — canvas de seções + painel.
 *
 * Espelha /copiloto (034) e /atendimentos (004): workspace (BFF: encounter +
 * seções + checklist + cards), init, scribe (extração→seções ai_draft), salvar
 * seção (autosave), assinar seção (reviewed→signed), checklist, finalizar. IA
 * prepara (ai_draft), médico decide (reviewed/signed); escrita oficial fica no
 * assinar do atendimento. Deslogado = MOCK_*.
 */
import { fmtDia } from "@/lib/planos";

export { fmtDia };

export type SecaoStatus = "empty" | "ai_draft" | "reviewed" | "signed";

export interface Secao {
  secao: string;
  ordem: number;
  conteudo: string | null;
  status: SecaoStatus;
}

export interface ChecklistItem {
  item: string;
  status: string; // pendente | ok | nao_aplicavel
  obrigatorio_regulatorio: boolean;
  observacao: string | null;
}

export interface Card {
  content_item_id: string;
  tipo: string;
  titulo: string;
  fonte: string;
  acao: string;
}

export interface Workspace {
  encounter: { id: string; patient_id: string; status: string };
  secoes: Secao[];
  checklist: ChecklistItem[];
  cards: Card[];
}

export interface Encounter {
  id: string;
  status: string;
  criado_em: string;
}

export const SECAO_LABEL: Record<string, string> = {
  queixa: "Queixa",
  historia: "História",
  exame: "Exame",
  hipoteses: "Hipóteses",
  conduta: "Conduta",
  prescricao: "Prescrição",
  orientacoes: "Orientações",
  retorno: "Retorno",
};

export function secaoLabel(s: string): string {
  return SECAO_LABEL[s] ?? s;
}

export const SECAO_STATUS_LABEL: Record<SecaoStatus, string> = {
  empty: "vazio",
  ai_draft: "IA — revisar",
  reviewed: "revisado",
  signed: "assinado",
};

export function secaoBadge(s: SecaoStatus): "neutral" | "warn" | "accent" | "ok" {
  if (s === "signed") return "ok";
  if (s === "reviewed") return "accent";
  if (s === "ai_draft") return "warn";
  return "neutral";
}

export const CHECKLIST_LABEL: Record<string, string> = {
  prontuario: "Prontuário",
  receita: "Receita",
  formula: "Fórmula",
  portal: "Portal",
  retorno: "Retorno",
  tarefas: "Tarefas",
};

export function checklistBadge(status: string): "ok" | "neutral" | "warn" {
  if (status === "ok") return "ok";
  if (status === "nao_aplicavel") return "neutral";
  return "warn";
}

// ---------------------------------------------------------------------------
// MOCK ilustrativo (só deslogado; nada de Date() no render SSR)
// ---------------------------------------------------------------------------

const _SEC = (secao: string, ordem: number, conteudo: string | null, status: SecaoStatus): Secao => ({
  secao, ordem, conteudo, status,
});

export const MOCK_WORKSPACE: Workspace = {
  encounter: { id: "mock-e1", patient_id: "mock-p1", status: "aberto" },
  secoes: [
    _SEC("queixa", 0, "Cefaleia há 3 dias, sem febre.", "ai_draft"),
    _SEC("historia", 1, "Relata estresse no trabalho; sono irregular.", "ai_draft"),
    _SEC("exame", 2, "PA 120x80; sem sinais focais.", "reviewed"),
    _SEC("hipoteses", 3, "Cefaleia tensional provável.", "ai_draft"),
    _SEC("conduta", 4, "Orientar hidratação e higiene do sono.", "reviewed"),
    _SEC("prescricao", 5, null, "empty"),
    _SEC("orientacoes", 6, null, "empty"),
    _SEC("retorno", 7, "Retorno em 30 dias.", "signed"),
  ],
  checklist: [
    { item: "prontuario", status: "pendente", obrigatorio_regulatorio: true, observacao: null },
    { item: "receita", status: "nao_aplicavel", obrigatorio_regulatorio: false, observacao: null },
    { item: "formula", status: "nao_aplicavel", obrigatorio_regulatorio: false, observacao: null },
    { item: "portal", status: "pendente", obrigatorio_regulatorio: false, observacao: null },
    { item: "retorno", status: "ok", obrigatorio_regulatorio: false, observacao: null },
    { item: "tarefas", status: "pendente", obrigatorio_regulatorio: false, observacao: null },
  ],
  cards: [
    {
      content_item_id: "mock-c1",
      tipo: "protocol",
      titulo: "Protocolo de higiene do sono",
      fonte: "biblioteca aprovada",
      acao: "inserir na conduta",
    },
  ],
};
