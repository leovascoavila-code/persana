/** Automação da jornada (S.17) — catálogo de gatilhos + cobertura (N5). */

export type Regra = {
  codigo: string;
  nome: string;
  acao: string;
  canal: string;
  fallback: string;
  interno: boolean;
  wired: boolean;
  habilitado: boolean;
};

export type Cobertura = {
  n5_pct: number | null;
  auto: number;
  elegiveis: number;
  por_outcome: Record<string, number>;
  janela_dias: number;
};

export const OUTCOME_LABEL: Record<string, string> = {
  auto: "automático",
  fallback_human: "fallback humano",
  skip_consent: "sem consentimento",
  skip_disabled: "regra desligada",
};

export const MOCK_REGRAS: Regra[] = [
  { codigo: "exame_sem_resultado", nome: "Exame sem resultado há N dias", acao: "Lembrete ao paciente", canal: "whatsapp", fallback: "Tarefa recepção", interno: false, wired: false, habilitado: true },
  { codigo: "exame_recebido", nome: "Resultado de exame recebido", acao: "OCR + análise + notifica médico", canal: "interno", fallback: "Fila de revisão", interno: true, wired: false, habilitado: true },
  { codigo: "consulta_encerrada", nome: "Consulta encerrada", acao: "Transcrição + rascunho SOAP", canal: "interno", fallback: "Médico revisa (invariante)", interno: true, wired: false, habilitado: true },
  { codigo: "protocolo_aprovado", nome: "Protocolo aprovado", acao: "Material + marcos + receitas rascunho", canal: "interno", fallback: "—", interno: true, wired: false, habilitado: true },
  { codigo: "marco_adesao_vencido", nome: "Marco de adesão vencido", acao: "Lembrete de check-in", canal: "whatsapp", fallback: "Tarefa CRM", interno: false, wired: true, habilitado: true },
  { codigo: "protocolo_fim_30d", nome: "Protocolo a 30 dias do fim", acao: "Sugestão de reavaliação + pré-agenda", canal: "whatsapp", fallback: "Recepção", interno: false, wired: true, habilitado: true },
  { codigo: "risco_churn", nome: "Risco de churn > limiar", acao: "Tarefa de contato com script", canal: "interno", fallback: "Recepção", interno: true, wired: true, habilitado: true },
  { codigo: "rapport_relevante", nome: "Aniversário/fato de rapport", acao: "Mensagem sugerida (médico aprova)", canal: "whatsapp", fallback: "—", interno: false, wired: false, habilitado: true },
  { codigo: "receita_minaspharma", nome: "Receita assinada + optou Minas Pharma", acao: "Cotação → pagamento → tracking", canal: "whatsapp", fallback: "Atendimento farmácia", interno: false, wired: false, habilitado: true },
];

export const MOCK_COBERTURA: Cobertura = {
  n5_pct: 83,
  auto: 25,
  elegiveis: 30,
  por_outcome: { auto: 25, fallback_human: 3, skip_consent: 2, skip_disabled: 4 },
  janela_dias: 30,
};
