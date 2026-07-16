/**
 * Contrato do briefing pré-consulta (CRM-0).
 *
 * Espelha 1:1 o payload de `GET /pacientes/{pid}/briefing` do backend
 * (saas-clinico, modules/briefing.py — docs/DESIGN_CRM_PERSANA.md §3.3).
 * Enquanto o endpoint não está deployado, a tela consome MOCK_BRIEFING;
 * ao ligar no backend, só o fetch muda — o shape é este.
 */

export interface BriefingPaciente {
  id: string;
  nome: string;
  nascimento: string | null; // ISO date
  sexo: string | null;
}

export interface BriefingUltimaConsulta {
  id: string;
  versao: number;
  assinado_em: string; // ISO datetime
  conteudo: {
    queixas?: string[];
    soap?: { s?: string; o?: string; a?: string; p?: string };
    follow_ups?: string[];
  };
}

export interface BriefingExameNovo {
  id: string;
  data_coleta: string | null;
  laboratorio: string | null;
  status: string;
}

export interface BriefingAnalito {
  analito: string;
  valor: string | null;
  unidade: string | null;
  flag: "alto" | "baixo";
  flag_funcional: string | null;
  status_revisao: string;
}

export interface BriefingRedFlag {
  id: string;
  severidade: string;
  mensagem: string;
  criado_em: string;
}

export interface BriefingProtocolo {
  id: string;
  nome: string;
  slug: string;
  status: string;
  fase_atual: number;
  total_fases: number | null;
  inicio: string | null;
  proxima_reavaliacao: string | null;
}

export interface BriefingDieta {
  id: string;
  objetivo: string | null;
  status: string;
  criado_em: string;
}

export interface BriefingProximaConsulta {
  id: string;
  inicio: string;
  fim: string;
  tipo: string;
  status: string;
}

export interface BriefingPayload {
  paciente: BriefingPaciente;
  ultima_consulta: BriefingUltimaConsulta | null;
  desde_ultima_consulta: {
    referencia: string | null;
    exames_novos: BriefingExameNovo[];
    analitos_alterados: BriefingAnalito[];
    resultados_pendentes_confirmacao: number;
  };
  rapport: Record<string, { fato: string; fonte: string }[]>;
  red_flags_abertas: BriefingRedFlag[];
  protocolos_em_curso: BriefingProtocolo[];
  dietas_recentes: BriefingDieta[];
  // Agenda (CRM-1, 022) ligada: próximo appointment vivo do paciente.
  proxima_consulta: BriefingProximaConsulta | null;
  // Seções futuras: sempre presentes no payload, null até o módulo existir.
  adesao: null;
  oportunidades: null;
  secoes_futuras: Record<string, string>;
}

/** dd/mm/aaaa a partir de ISO (sem Date/locale — determinístico no SSR). */
export function fmtData(iso: string | null): string {
  if (!iso) return "—";
  const [data] = iso.split("T");
  const [a, m, d] = data.split("-");
  return `${d}/${m}/${a}`;
}

export function idade(nascimento: string | null, hoje = "2026-07-16"): number | null {
  if (!nascimento) return null;
  const [an, mn, dn] = nascimento.split("-").map(Number);
  const [ah, mh, dh] = hoje.split("-").map(Number);
  let anos = ah - an;
  if (mh < mn || (mh === mn && dh < dn)) anos -= 1;
  return anos;
}

/** Paciente demonstrativa (dados ilustrativos — nenhum dado real). */
export const MOCK_BRIEFING: BriefingPayload = {
  paciente: {
    id: "demo-ana",
    nome: "Ana Lúcia Ferreira",
    nascimento: "1982-03-14",
    sexo: "F",
  },
  ultima_consulta: {
    id: "mr-018",
    versao: 6,
    assinado_em: "2026-06-04T14:30:00Z",
    conteudo: {
      queixas: ["Fadiga vespertina", "Sono fragmentado (2–3 despertares)"],
      soap: {
        s: "Cansaço no fim da tarde há ~2 meses; sono não reparador. Nega alterações de humor relevantes.",
        o: "IMC 27,4 · PA 122×78 · circunferência abdominal 91 cm.",
        a: "Resistência insulínica em investigação; padrão sugestivo de baixa reserva de ferro.",
        p: "Painel metabólico + ferro/ferritina + vitamina D; iniciar caminhada 3×/semana; retorno em 6 semanas.",
      },
      follow_ups: ["Cobrar painel metabólico", "Reavaliar sono na próxima consulta"],
    },
  },
  desde_ultima_consulta: {
    referencia: "2026-06-04T14:30:00Z",
    exames_novos: [
      {
        id: "ex-101",
        data_coleta: "2026-07-08",
        laboratorio: "Hermes Pardini",
        status: "extraido",
      },
    ],
    analitos_alterados: [
      { analito: "Ferritina", valor: "18", unidade: "ng/mL", flag: "baixo", flag_funcional: "fora", status_revisao: "pendente" },
      { analito: "HbA1c", valor: "5,9", unidade: "%", flag: "alto", flag_funcional: "subotimo", status_revisao: "pendente" },
      { analito: "TSH", valor: "3,8", unidade: "µUI/mL", flag: "alto", flag_funcional: "subotimo", status_revisao: "pendente" },
      { analito: "Vitamina D (25-OH)", valor: "24", unidade: "ng/mL", flag: "baixo", flag_funcional: "fora", status_revisao: "confirmado" },
    ],
    resultados_pendentes_confirmacao: 3,
  },
  rapport: {
    familia: [
      { fato: "Filha Marina passou em Medicina (UFMG) — começou em março", fonte: "ia:consulta" },
      { fato: "Marido Ricardo se recuperando de cirurgia no joelho", fonte: "manual" },
    ],
    trabalho: [
      { fato: "Advogada; período de audiências pesado até agosto", fonte: "ia:consulta" },
    ],
    objetivos: [
      { fato: "Voltar a correr 5 km até o fim do ano", fonte: "manual" },
    ],
    preferencias: [
      { fato: "Prefere fitoterápico quando houver alternativa", fonte: "ia:consulta" },
    ],
  },
  red_flags_abertas: [
    {
      id: "rf-31",
      severidade: "warning",
      mensagem: "GAD-7 = 11 (ansiedade moderada) na triagem de 08/07 — reavaliar na consulta",
      criado_em: "2026-07-08T10:15:00Z",
    },
  ],
  protocolos_em_curso: [
    {
      id: "pp-77",
      nome: "Resistência insulínica — protocolo metabólico",
      slug: "resistencia-insulinica",
      status: "ativo",
      fase_atual: 2,
      total_fases: 4,
      inicio: "2026-05-12",
      proxima_reavaliacao: "2026-07-28",
    },
  ],
  dietas_recentes: [
    {
      id: "dp-40",
      objetivo: "Baixa carga glicêmica + reforço proteico",
      status: "aprovada",
      criado_em: "2026-06-10T09:00:00Z",
    },
  ],
  proxima_consulta: null,
  adesao: null,
  oportunidades: null,
  secoes_futuras: {
    adesao: "modelo de adesão (CRM-3) ainda não implementado",
    oportunidades: "care-gap engine (design 6.2) aguarda biblioteca curada",
  },
};
