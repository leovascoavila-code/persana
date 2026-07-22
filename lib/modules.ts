/**
 * Registro canônico dos módulos do Persana (SaaS Clínico).
 *
 * Fonte da auditoria: STATUS SaaS Clínico (memória) + routers reais do backend
 * FastAPI (`PycharmProjects\saas-clinico\src\app\modules\*.py`, main.py com 22 routers).
 * Este arquivo é a "auditoria como dado": as páginas /modulos são geradas dele.
 *
 * Ao evoluir um módulo (deploy, UI portada, lacuna fechada), atualizar AQUI —
 * o site reflete na hora.
 */

export type ModuleStatus = "live" | "pronto" | "parcial" | "planejado";

export const STATUS_META: Record<
  ModuleStatus,
  { label: string; badge: "ok" | "accent" | "warn" | "neutral" }
> = {
  live: { label: "Live no VPS", badge: "ok" },
  pronto: { label: "Código pronto — não deployado", badge: "accent" },
  parcial: { label: "Live com lacuna estrutural", badge: "warn" },
  planejado: { label: "Planejado — sem código", badge: "neutral" },
};

/** POC atual (box Hostinger, dado fake, HTTP). Substituído por persana.com.br na F6. */
export const POC_BASE = "http://2.25.162.171";

export interface PersanaModule {
  slug: string;
  nome: string;
  grupo: string;
  resumo: string;
  status: ModuleStatus;
  /** Arquivo(s) do router no backend, para rastreio. */
  backend?: string;
  /** Rotas/capacidades principais já existentes na API. */
  entregue: string[];
  /** O que falta para o módulo ser "produto". */
  faltas: string[];
  /** UI atual (POC inline no FastAPI), se houver. */
  pocPath?: string;
  /** Estado do front no Persana (mundo Tinta). */
  frontPersana: "nenhum" | "parcial" | "pronto";
}

export const GRUPOS = [
  "Jornada clínica",
  "Exames & dados",
  "Motor terapêutico",
  "Prescrição & farmácia",
  "Plataforma",
  "CRM (design 07/2026)",
  "Comercial (Onda 3)",
  "Planejados (spec v3)",
] as const;

export const MODULES: PersanaModule[] = [
  // ───────────────────────────── Jornada clínica ─────────────────────────────
  {
    slug: "pacientes",
    nome: "Pacientes",
    grupo: "Jornada clínica",
    resumo: "Cadastro de pacientes multi-tenant (RLS FORCE por clínica).",
    status: "live",
    backend: "modules/patients.py",
    entregue: ["CRUD de pacientes sob RLS", "CPF cifrado (migration 019, Fernet)"],
    faltas: ["UI de gestão de pacientes no Persana", "Busca/listagem com filtros"],
    frontPersana: "nenhum",
  },
  {
    slug: "consentimentos",
    nome: "Consentimentos",
    grupo: "Jornada clínica",
    resumo:
      "Consentimentos LGPD (foto biométrica, gravação de áudio) com hash sha256.",
    status: "live",
    backend: "modules/consents.py",
    entregue: ["Registro e verificação de consentimento", "Gates 403 nos módulos que exigem"],
    faltas: ["UI de coleta/gestão de consentimentos"],
    frontPersana: "nenhum",
  },
  {
    slug: "anamnese",
    nome: "Anamnese modular",
    grupo: "Jornada clínica",
    resumo:
      "Anamnese FHIR R4 por objetivos terapêuticos: 64 objetivos, instrumentos validados, red flags.",
    status: "live",
    backend: "modules/anamnese.py",
    entregue: [
      "Catálogo de 64 objetivos + 50 perguntas + 83 vínculos",
      "Instrumentos PHQ-9 / GAD-7 / AUDIT / SCOFF com scoring",
      "Red flag crítica PHQ-9 item 9 (hardcoded por design)",
      "Questionário composto FHIR + export clínico (RBAC)",
    ],
    faltas: [
      "Red flags do seed detalhado ainda em prosa (condição jsonb placeholder)",
      "UI de preenchimento da anamnese no Persana",
    ],
    frontPersana: "nenhum",
  },
  {
    slug: "atendimento",
    nome: "Atendimento (consulta gravada)",
    grupo: "Jornada clínica",
    resumo:
      "Encounter completo: gravação com consentimento, transcrição Whisper, extração SOAP/CID-10 por IA, assinatura do médico.",
    status: "live",
    backend: "modules/atendimento.py",
    entregue: [
      "Gate de consentimento de gravação (retenção 90d)",
      "STT real via Whisper (pt-BR) + rotulação médico/paciente",
      "Extração IA: queixas, CID-10 sugerido, follow-ups, SOAP de apoio",
      "Assinatura do médico → prontuário oficial versionado + hash",
    ],
    faltas: ["Diarização real (Deepgram)", "UI de atendimento no Persana"],
    frontPersana: "nenhum",
  },
  {
    slug: "prontuario",
    nome: "Prontuário & evolução",
    grupo: "Jornada clínica",
    resumo:
      "Prontuário oficial versionado com hash + evolução clínica. Escrita oficial só por ato assinado do médico.",
    status: "live",
    backend: "modules/prontuario.py · modules/evolucao.py",
    entregue: ["medical_records versionado + hash", "Evolução clínica por paciente"],
    faltas: ["UI de leitura/navegação do prontuário no Persana"],
    frontPersana: "nenhum",
  },
  {
    slug: "documentos",
    nome: "Documentos clínicos",
    grupo: "Jornada clínica",
    resumo: "Atestados, relatórios e encaminhamentos (migration 010_docs).",
    status: "live",
    backend: "modules/documentos.py",
    entregue: ["Emissão de atestado / relatório / encaminhamento via API"],
    faltas: ["Render PDF com branding", "UI de emissão no Persana"],
    frontPersana: "nenhum",
  },
  {
    slug: "consulta",
    nome: "Tela de consulta (embed MEMED)",
    grupo: "Jornada clínica",
    resumo:
      "Página /consulta/{paciente}: embed MEMED tela cheia, login+MFA, captura de eventos de prescrição, CPF decifrado transiente.",
    status: "live",
    backend: "modules/consulta.py",
    entregue: [
      "Embed MEMED tela cheia (featureToggle + forceSign ICP-Brasil)",
      "Captura de eventos → verificação server-side",
      "CPF cifrado em repouso; payload-set-paciente transiente",
    ],
    faltas: [
      "Portar do React inline para o Persana (mundo Tinta)",
      "Decidir alvo do /consulta sob o domínio (clinico.persana.com.br → VPS ou rewrite na Vercel)",
    ],
    pocPath: "/consulta",
    frontPersana: "nenhum",
  },

  // ───────────────────────────── Exames & dados ─────────────────────────────
  {
    slug: "exames",
    nome: "Exames laboratoriais",
    grupo: "Exames & dados",
    resumo:
      "Upload de PDF/imagem, extração por IA, histórico longitudinal, LOINC + 604 marcadores com faixa funcional.",
    status: "live",
    backend: "modules/exames.py",
    entregue: [
      "Extração IA validada em golden set: recall 100%, valor 100%, unidade 95%",
      "Histórico longitudinal por analito",
      "LOINC 2.82 (1.519 exames) + 604 marcadores (90% de mapeamento)",
      "Flag funcional ideal/subótimo/fora por sexo",
      "Confirmação médica obrigatória (invariante de ouro)",
    ],
    faltas: [
      "Faixa de referência ausente em ~27% (resgate por sexo/idade)",
      "Normalização/conversão de unidades",
      "UI definitiva de exames no Persana (viewer é POC)",
    ],
    frontPersana: "nenhum",
  },
  {
    slug: "viewer",
    nome: "Visualizador de tendências",
    grupo: "Exames & dados",
    resumo:
      "POC de gráfico de tendência por analito (valor × data, faixa de referência, flags coloridas).",
    status: "live",
    backend: "modules/viewer.py",
    entregue: ["Página única live: login → paciente → analito → gráfico + tabela"],
    faltas: [
      "Portar para o Persana como componente Tinta (substitui o Chart.js CDN)",
      "É o candidato natural a 1º módulo lapidado no novo front",
    ],
    pocPath: "/viewer",
    frontPersana: "nenhum",
  },
  {
    slug: "questionarios",
    nome: "Questionários",
    grupo: "Exames & dados",
    resumo:
      "Respostas de questionários com foto + timestamp + hash sha256 (comprovação de autoria).",
    status: "live",
    backend: "modules/questionarios.py",
    entregue: ["Registro com não-repúdio", "Gate de consentimento foto_biometrica"],
    faltas: ["UI de aplicação de questionários"],
    frontPersana: "nenhum",
  },
  {
    slug: "memoria",
    nome: "Memory Engine (rapport)",
    grupo: "Exames & dados",
    resumo:
      "Memória do paciente em 7 categorias (família, trabalho, objetivos…) extraída por IA e aprovada pelo médico.",
    status: "live",
    backend: "modules/memory.py",
    entregue: [
      "Extração de rapport via IA → pendente → aprovação do médico",
      "Exclusão LGPD",
    ],
    faltas: ["UI de rapport integrada à tela de consulta"],
    frontPersana: "nenhum",
  },
  {
    slug: "fhir",
    nome: "API FHIR",
    grupo: "Exames & dados",
    resumo: "Interface FHIR R4 sobre prontuário e documentos (interoperabilidade).",
    status: "live",
    backend: "modules/fhir_api.py",
    entregue: ["Endpoints FHIR sobre os recursos clínicos"],
    faltas: ["Mapear cobertura real de recursos (construído por sessão paralela)"],
    frontPersana: "nenhum",
  },

  // ──────────────────────────── Motor terapêutico ────────────────────────────
  {
    slug: "protocolos",
    nome: "Protocol Engine",
    grupo: "Motor terapêutico",
    resumo:
      "Protocolos clínicos como produto do médico: sugestão só da biblioteca curada, máquina de estados, métrica N2.",
    status: "parcial",
    backend: "modules/protocolo.py",
    entregue: [
      "Máquina de estados sugerido→ativo→concluído (aprovação médica obrigatória)",
      "Agente seleciona SÓ da biblioteca (anti-alucinação, 422 sem match)",
      "N2 instrumentado (eventos de jornada)",
    ],
    faltas: [
      "25 candidatos SEMEADOS (020 live 17/07) aguardando aprovação médica — /protocolo/sugerir segue 409 até ≥1 aprovado via /protocolos/{slug}/aprovar",
      "UI de protocolos no Persana",
    ],
    frontPersana: "nenhum",
  },
  {
    slug: "formulas",
    nome: "Formula Engine",
    grupo: "Motor terapêutico",
    resumo:
      "Sugestão de formulação magistral ancorada em achados reais (analitos fora de faixa + objetivos + anamnese), com checagem de interações.",
    status: "parcial",
    backend: "modules/formula.py",
    entregue: [
      "Sugerir → aprovar (médico) → prescrever em 1 clique",
      "Gate farmacêutico exige interações checadas",
    ],
    faltas: [
      "suggest_formulas (ponte protocolo→fórmula) = NotImplementedError (Slice 3)",
      "Assinatura da receita: resolvida via MEMED — depende do deploy F6",
      "UI no Persana",
    ],
    frontPersana: "nenhum",
  },
  {
    slug: "dietas",
    nome: "Motor de dietas",
    grupo: "Motor terapêutico",
    resumo:
      "24 modelos de dieta ancorados em literatura (DOI/PMID) + camada comportamental (10 perfis, 180 mensagens) + personalização por regras.",
    status: "live",
    backend: "modules/dieta.py · modules/diet_templates.py",
    entregue: [
      "24 templates (64 objetivos), status rascunho + REVISAR",
      "10 perfis comportamentais + questionário TTM + 180 mensagens",
      "Personalização com 10 regras auditáveis (regras_disparadas)",
      "Render por audiência: médico / nutricionista / paciente (sem vazar técnica)",
      "5 gates build-failing (completude, publicação, pediátrico, termos proibidos)",
    ],
    faltas: [
      "Curadoria profissional dos [FUNDAMENTAR] antes de publicar",
      "UI de dietas no Persana",
    ],
    frontPersana: "nenhum",
  },
  {
    slug: "materiais",
    nome: "Materiais do paciente (white-label)",
    grupo: "Motor terapêutico",
    resumo:
      "Material leigo de apresentação com branding em 2 níveis (clínica → médico), validado pelo ComplianceGate.",
    status: "live",
    backend: "modules/material.py",
    entregue: [
      "Branding clínica + override por médico (resolve_branding)",
      "Gerar → compliance (termos proibidos) → aprovar → render com identidade",
    ],
    faltas: ["Render PDF (hoje devolve JSON + branding)", "UI no Persana"],
    frontPersana: "nenhum",
  },

  // ─────────────────────────── Prescrição & farmácia ───────────────────────────
  {
    slug: "memed",
    nome: "Prescrição digital (MEMED)",
    grupo: "Prescrição & farmácia",
    resumo:
      "Integração MEMED completa: prescritores espelho, verificação server-side anti-forjadura, reconciliação, assinatura ICP-Brasil.",
    status: "live",
    backend: "modules/memed.py",
    entregue: [
      "F1–F5 completas: client, migrations 018, captura verificada, ponte farmácia",
      "Payload real capturado em homolog + schema congelado (8 golden tests)",
      "Suite 258 passed — único ponto que flipa status='assinada' é verificação na API",
      "F6 deployado 08/07: 018+019 live, 9 rotas /memed/* + RLS runtime provado",
    ],
    faltas: [
      "Usuário avaliacao.memed + paciente demo + vídeo do fluxo → completar e ENVIAR o form parceiro",
    ],
    frontPersana: "nenhum",
  },
  {
    slug: "farmacia",
    nome: "Ponte farmácia (pedidos)",
    grupo: "Prescrição & farmácia",
    resumo:
      "pharmacy_orders: criado → enviado → em produção → pronto → dispensado. Fulfillment na Minas Pharma.",
    status: "parcial",
    backend: "modules/farmacia.py",
    entregue: [
      "Máquina de estados de fulfillment (FK prescriptions)",
      "Auto-sugestão de pedido ao verificar Rx com manipulado (F5, idempotente)",
    ],
    faltas: [
      "Hook auto-sugerido sem teste de DB real (exercitar no smoke F6)",
      "Integração real cotação→pagamento→produção→tracking (toca LR↔FF — protocolo próprio)",
      "UI de acompanhamento no Persana",
    ],
    frontPersana: "nenhum",
  },

  // ───────────────────────────────── Plataforma ─────────────────────────────────
  {
    slug: "auth",
    nome: "Auth & RBAC",
    grupo: "Plataforma",
    resumo: "OAuth2/JWT + MFA TOTP + 6 perfis. App conecta NOSUPERUSER; tenant por transação.",
    status: "live",
    backend: "modules/auth.py",
    entregue: [
      "Login JWT + MFA",
      "RBAC 6 perfis provado (403 em rota clínica)",
      "Tela /login Tinta no Persana (clínica+email+senha+TOTP; token só em memória)",
    ],
    faltas: [
      "Sessão persistente (refresh token) — reload encerra a sessão por design do POC",
    ],
    frontPersana: "parcial",
  },
  {
    slug: "console-medico",
    nome: "Console do médico (POC)",
    grupo: "Plataforma",
    resumo:
      "SPA POC live: pendências (exames + memória), rascunho SOAP, editar e assinar. Destino: ser absorvido pelo app Persana.",
    status: "live",
    backend: "modules/medico.py",
    entregue: ["Fluxo completo login MFA → paciente → rascunho → assinar"],
    faltas: [
      "Substituir pelo app Persana (mundo Tinta) — este POC é o mapa do que portar",
    ],
    pocPath: "/medico",
    frontPersana: "nenhum",
  },
  {
    slug: "content-registry",
    nome: "Content Registry",
    grupo: "Plataforma",
    resumo:
      "Base de conhecimento global (sem RLS): 9.010 itens ingeridos (fórmulas, protocolos, substâncias, dietas).",
    status: "live",
    backend: "migrations 016/017 + platform/content/",
    entregue: [
      "9.010 itens SC/medint ingeridos, idempotência provada",
      "Fingerprint + matcher + scrub de PII",
    ],
    faltas: [
      "Extrator LLM vivo (Farmácia Amy 55MB, Maria Rocha 3 fascículos)",
      "Adaptadores incrementais (protocolos_modelo, medicines 15.800, curso injetáveis)",
      "Curadoria de slugs duplicados (dedup por fingerprint + supersedes)",
    ],
    frontPersana: "nenhum",
  },

  {
    slug: "biblioteca",
    nome: "Biblioteca clínica (curadoria de merge)",
    grupo: "Plataforma",
    resumo:
      "Onda 2 do plano Sakana: fila de dedup do Content Registry (10.9k+ clusters) com aceite HUMANO do registro canônico. O pipeline propõe; o médico funde (doutrina 021, anti-colapso automático).",
    status: "live",
    backend: "modules/curadoria.py · migration 027 · scripts/curadoria_batch.py",
    entregue: [
      "Migration 027 (deploy 21/07): content_merge_proposals + protocol_formula_links (globais) + content_item.merged_into_id; UNIQUE parcial impede 2 propostas abertas por cluster",
      "Batch determinístico (assinatura de composição idêntica → proposta 'identical' 1-clique) + fase --llm opcional (JSON rígido, teto 50 clusters)",
      "GET /biblioteca/fila + /propostas/{id} (diff golden × membros) + aceite/rejeição humanos (CHECK aceite_exige_humano); preço nunca gravado aqui (motor 5012 é fonte única)",
      "Tela Tinta /biblioteca no Persana (contrato lib/biblioteca.ts + mock; ações reais quando logado)",
    ],
    faltas: [
      "Fase determinística resolve 0/3500 na fila atual (dominada por variantes, não duplicatas exatas) — trabalho real é a fase --llm + curadoria médica",
      "protocol_formula_links sem UI (link protocolo→fórmula via API)",
      "Curadoria humana do 1º lote (meta: 50 protocolos + 100 fórmulas aprovados para tirar /protocolo/sugerir do 409)",
    ],
    frontPersana: "parcial",
  },

  // ─────────────────────────── CRM (design 07/2026) ───────────────────────────
  {
    slug: "instrumento",
    nome: "Análise instrumental (BIO)",
    grupo: "CRM (design 07/2026)",
    resumo:
      "Laudos de instrumento (bioressonância QRMA, body-scan) como dado longitudinal — módulo DESACOPLADO de exames, ativado por profissional. Leitura não-diagnóstica, intra-paciente.",
    status: "live",
    backend: "modules/instrumento.py + core/features.py",
    entregue: [
      "Migration 023: instrument_scans + instrument_readings + tenant_features + professional_features (RLS FORCE)",
      "Entitlement por profissional (require_feature): a clínica assina + o admin liga por pessoa; sem ele, 403",
      "Ingestão de laudo (POST /scans): parser determinístico QRMA-PDF / body-scan-XLSX → rascunho pendente + SAVEPOINT por item",
      "Revisão médica (pendente → confirmado) + série histórica intra-paciente (GET /paciente/{pid}/serie)",
      "Desacoplado: zero JOIN com lab_* — não alimenta care-gap/sugestão/briefing-de-analitos (CFM)",
      "Tela Tinta /instrumento (BIO-2): viewer da análise individual + heatmap de grau + rótulo não-diagnóstico",
      "Série histórica no front (BIO-3): sparkline do marcador ao longo das sessões + faixa de referência + delta",
    ],
    faltas: [
      "Comparador de 2 sessões lado a lado + seção no briefing (§8)",
      "UI de ingestão (upload) e de concessão de entitlement (hoje via API)",
      "Bioimpedância por device/API (BIO-4)",
    ],
    frontPersana: "parcial",
  },
  {
    slug: "workspace",
    nome: "Workspace Hoje (inbox clínico)",
    grupo: "CRM (design 07/2026)",
    resumo:
      "Onda 1 do plano Sakana: agenda do dia + fila única de pendências (work_items, decisão D-6) em 1 chamada — exames a confirmar, documentos em rascunho, red flags, pacientes sem retorno.",
    status: "pronto",
    backend: "modules/workspace.py",
    entregue: [
      "Migration 026 work_items (fila única clinical/crm/financeiro, RLS FORCE, UNIQUE anti-duplicação)",
      "Projeção on-demand de 4 fontes + sweep de auto-resolução (item resolvido nunca reabre)",
      "GET /workspace/today (BFF: agenda + inbox em 1 resposta) + transições guarded done/snooze/dismiss (409 em corrida)",
      "Quarentena preservada: instrumental fica FORA de work_items (bloco separado via GET /instrumento/pendentes)",
      "Tela Tinta /hoje no Persana (contrato lib/workspace.ts + mock; ações reais quando logado)",
    ],
    faltas: [
      "Deploy da 025+026 no VPS (pacote gated)",
      "Badges de contagem no app shell (/app/navigation)",
    ],
    frontPersana: "parcial",
  },
  {
    slug: "briefing",
    nome: "Briefing pré-consulta",
    grupo: "CRM (design 07/2026)",
    resumo:
      "CRM-0: o contexto do paciente em 1 chamada — rapport, última consulta assinada, delta de exames desde ela, protocolos/dietas em curso.",
    status: "live",
    backend: "modules/briefing.py",
    entregue: [
      "GET /pacientes/{pid}/briefing (role médico) — composição read-only",
      "Delta desde a última consulta assinada: exames novos, analitos alterados, pendências de confirmação",
      "Rapport aprovado (Memory Engine) + red flags abertas + protocolos/dietas em curso",
      "Seções futuras declaradas no contrato (adesão/oportunidades); próxima consulta já ligada à agenda (022)",
      "Evento briefing.visualizado (audit) — métrica de adoção instrumentada (S.15)",
      "Tela Tinta /briefing no Persana (contrato tipado em lib/briefing.ts + mock)",
      "Ligada ao endpoint real quando logado (proxy /api/poc + seletor de paciente; deslogado = mock)",
    ],
    faltas: [
      "Smoke e2e com credenciais demo (criar usuário médico de avaliação no POC)",
    ],
    frontPersana: "parcial",
  },
  {
    slug: "agenda",
    nome: "Agenda & ocupação",
    grupo: "CRM (design 07/2026)",
    resumo:
      "CRM-1: agenda médico+paciente com salas/equipamentos como recurso de 1ª classe + máquina de estados + dashboard de ocupação.",
    status: "live",
    backend: "modules/agenda.py",
    entregue: [
      "Migration 022: clinic_resources + physician_schedules + appointments (RLS FORCE)",
      "Máquina de estados marcado → confirmado → realizado | faltou | cancelado | remarcado (CHECK no banco + lógica pura)",
      "Conflito de janela por médico e por sala/equipamento (409); slots vizinhos não colidem",
      "Remarcação cria appointment novo linkado (remarcado_para); bloqueio de agenda sem paciente",
      "Ocupação: read-model por médico e por recurso (horas ocupadas, faltas, cancelamentos)",
      "Briefing ligado: proxima_consulta agora é viva no GET /briefing",
      "Eventos audit appointment.* (comparecimento alimenta metas CRM-5)",
      "Tela Tinta /agenda (timeline do dia + heatmap de ocupação por recurso + semana por médico)",
      "Ligada ao endpoint real quando logado (dia + ocupação + recursos via proxy /api/poc)",
    ],
    faltas: [
      "Marcação/remarcação interativa na tela (escrita já existe via API)",
      "Smoke e2e com credenciais demo (criar usuário médico de avaliação no POC)",
    ],
    frontPersana: "parcial",
  },
  {
    slug: "adesao",
    nome: "Adesão & real × esperado",
    grupo: "CRM (design 07/2026)",
    resumo:
      "CRM-3: planos de adesão com metas snapshotadas + check-ins + comparação do resultado real (exames/bioimpedância/PROMs) × esperado.",
    status: "planejado",
    entregue: [],
    faltas: ["Todo o módulo (migration 023) — ver DESIGN_CRM_PERSANA.md §3.4 e §6.5"],
    frontPersana: "nenhum",
  },
  {
    slug: "relacionamento",
    nome: "Relacionamento (CRM por eventos)",
    grupo: "CRM (design 07/2026)",
    resumo:
      "Onda 4 Slice 1: ciclo de vida do paciente + score de risco por regras EXPLICÁVEIS (sem ML) sobre a espinha única (audit_log/work_items). Risco alto vira tarefa na fila (D-6). Cadências WhatsApp/PROMs nas fatias seguintes.",
    status: "parcial",
    backend: "modules/crm.py · migration 030",
    entregue: [
      "Migration 030 (deploy 21/07): crm_contacts, crm_patient_state (PK tenant+patient, lifecycle 10 estágios), crm_segments, patient_channel_consents (canal×finalidade) — RLS FORCE",
      "avaliar-risco: regras legíveis (sem consulta 60d / plano ativo sem retorno / receita vencida / sem consentimento) → risco ALTO gera work_item domain='crm' com dono+prazo (D-6), não reabre resolvido",
      "Consentimento canal×finalidade = gate regulatório de cadência; segmentos por regra JSON; contatos (lead)",
      "Cadências (031) + dispatch WhatsApp per-tenant (032/033, Meta Graph, template aprovado + deep-link) + check-in (4 perguntas → escalona) + adesão real×esperado",
      "Telas Tinta /crm (funil + fila de risco) e /cadencias (fila de disparo + check-in + adesão) no Persana",
    ],
    faltas: [
      "Ativar dispatch real: cada clínica cria WABA própria + templates aprovados pela Meta (docs/WHATSAPP_CADENCIA_ATIVACAO.md)",
      "PROMs validados (scoring PHQ-9/GAD-7 estendendo questionarios 008) + webhook Meta inbound",
      "Timeline unificada + care-gap engine (§6.2, pós-curadoria da biblioteca)",
    ],
    frontPersana: "parcial",
  },

  // ─────────────────────────── Comercial (Onda 3) ───────────────────────────
  {
    slug: "comercial",
    nome: "Programas & Ofertas",
    grupo: "Comercial (Onda 3)",
    resumo:
      "Onda 3 Slice 1: plano COMERCIAL (serviço do consultório) separado do clínico. Programa vende serviço; fórmula/exame/medicamento ficam FORA (separação regulatória). Oferta com snapshot imutável + aceite guarded cria matrícula.",
    status: "live",
    backend: "modules/comercial.py · migration 028",
    entregue: [
      "Migration 028 (deploy 21/07): 6 tabelas care_* RLS FORCE (templates/prices/offers/enrollments/service_items/clinical_links)",
      "RBAC D-5: care_coordinator, assistente_clinico, financeiro_clinica",
      "Ciclo do programa draft→ativo→retirado; oferta com snapshot imutável + terms_hash + accepted_evidence; aceite guarded (409) cria matrícula",
      "care_plan_clinical_links = M:N aponta pro clínico (treatment_plans intacto)",
      "Tela Tinta /planos no Persana (Program/Offer Builder + timeline da oferta)",
    ],
    faltas: [
      "Aceite/pagamento pelo PACIENTE (portal) — hoje o aceite é da equipe (Slice 2c)",
      "Care Plan Timeline completa (adesão, PROMs, renovação)",
    ],
    frontPersana: "parcial",
  },
  {
    slug: "billing",
    nome: "Billing multi-provider (Pix)",
    grupo: "Comercial (Onda 3)",
    resumo:
      "Onda 3 Slice 2a: cobrança do programa desacoplada do provedor. Cada clínica configura o próprio recebedor (Pix padrão BACEN, N bancos; cartão na 2b). Dinheiro/NF na entidade da clínica, nunca a farmácia (CFM).",
    status: "live",
    backend: "modules/billing.py · platform/billing · migration 029",
    entregue: [
      "Migration 029 (deploy 21/07): 4 tabelas billing_* RLS FORCE (provider_configs [credenciais cifradas Fernet], subscriptions, invoices, events)",
      "Lib PixProvider/CardProvider + SicoobPix portado do racional MP (OAuth2 mTLS→cob→QR), credenciais por tenant + registry config-driven",
      "Webhook verifica com o provider antes de marcar pago → avança ciclo da matrícula; inerte por default (422 sem provider/chave)",
      "GET /billing/invoices (lista) + tela Tinta /cobranca no Persana: config de provedor (financeiro) + fatura/QR Pix + copia-e-cola",
    ],
    faltas: [
      "Setar BILLING_SECRET_KEY no VPS + cada clínica configurar cert/cred Sicoob → Pix LIVE E2E",
      "Cartão (adapter Rede + orquestrador Pagar.me/Malga) = Slice 2b",
      "Pagamento no portal do paciente (Slice 2c)",
    ],
    frontPersana: "parcial",
  },

  // ─────────────────────────── Planejados (spec v3) ───────────────────────────
  {
    slug: "dashboard-roi",
    nome: "Dashboard ROI do médico",
    grupo: "Planejados (spec v3)",
    resumo:
      "S.18: retorno do médico por protocolo/jornada (sem exibir receita da farmácia, sem comissão por prescrição).",
    status: "planejado",
    entregue: [],
    faltas: [
      "Todo o módulo — o dashboard atual do Persana é o esqueleto visual dele",
      "North Star N1–N6 instrumentadas ponta a ponta (N2 já emite eventos)",
    ],
    frontPersana: "parcial",
  },
  {
    slug: "automacoes",
    nome: "Automações da jornada",
    grupo: "Planejados (spec v3)",
    resumo: "S.17: 9 automações auditáveis da jornada do paciente (meta N5 ≥ 80%).",
    status: "planejado",
    entregue: [],
    faltas: ["Todo o módulo (depende de biblioteca de protocolos viva)"],
    frontPersana: "nenhum",
  },
  {
    slug: "whatsapp-clinica",
    nome: "WhatsApp da clínica",
    grupo: "Planejados (spec v3)",
    resumo:
      "R5: stack da Carol reusada como INSTÂNCIA ISOLADA por tenant (credenciais/número/fila próprios).",
    status: "planejado",
    entregue: [],
    faltas: ["Todo o módulo — exige /preflight whatsapp ao codar"],
    frontPersana: "nenhum",
  },
  {
    slug: "digital-twin",
    nome: "Digital Twin / wearables",
    grupo: "Planejados (spec v3)",
    resumo: "Fase 4 da spec — ADIADA por decisão (prioridade é o loop de receita 3A).",
    status: "planejado",
    entregue: [],
    faltas: ["Adiado — não iniciar sem decisão explícita"],
    frontPersana: "nenhum",
  },
];

export function modulesByGroup(): Array<{
  grupo: string;
  modules: PersanaModule[];
}> {
  return GRUPOS.map((grupo) => ({
    grupo,
    modules: MODULES.filter((m) => m.grupo === grupo),
  })).filter((g) => g.modules.length > 0);
}

export function getModule(slug: string): PersanaModule | undefined {
  return MODULES.find((m) => m.slug === slug);
}
