/**
 * Contrato de Cobranca (Onda 3 Slice 2a) — config de provider + fatura/QR Pix.
 *
 * Espelha o router /billing (029): provider-configs (config do recebedor por
 * clinica, credenciais cifradas no servidor), invoices (cobranca Pix com
 * copia-e-cola + QR). Cartao = 2b. Inerte por default (sem BILLING_SECRET_KEY +
 * provider -> 422). Deslogado = MOCK_*; medico ve 403/422 (RBAC financeiro).
 */
import { fmtDia, valorBRL } from "@/lib/planos";

export { fmtDia, valorBRL };

export type InvoiceStatus = "pendente" | "pago" | "expirado" | "cancelado" | "falhou";

export interface ProviderConfig {
  id: string;
  kind: string; // pix | card
  provider: string; // sicoob | ...
  display_nome: string | null;
  cert_ref: string | null;
  is_default: boolean;
  sandbox: boolean;
  ativo: boolean;
  criado_em: string;
}

export interface Invoice {
  id: string;
  metodo: string;
  provider: string | null;
  valor_centavos: number;
  status: InvoiceStatus;
  provider_ref: string | null;
  vencimento: string | null;
  pago_em: string | null;
  criado_em: string;
}

export interface InvoiceDetalhe extends Invoice {
  pix_copia_cola: string | null;
  pix_qr_b64: string | null;
}

export const INVOICE_STATUS_LABEL: Record<InvoiceStatus, string> = {
  pendente: "pendente",
  pago: "pago",
  expirado: "expirado",
  cancelado: "cancelado",
  falhou: "falhou",
};

export function invoiceBadge(s: InvoiceStatus): "ok" | "neutral" | "warn" | "danger" {
  if (s === "pago") return "ok";
  if (s === "falhou" || s === "cancelado") return "danger";
  if (s === "expirado") return "warn";
  return "neutral";
}

// ---------------------------------------------------------------------------
// MOCK ilustrativo (só deslogado; datas fixas — nada de Date() no render SSR)
// ---------------------------------------------------------------------------

export const MOCK_PROVIDER_CONFIGS: ProviderConfig[] = [
  {
    id: "mock-cfg1",
    kind: "pix",
    provider: "sicoob",
    display_nome: "Sicoob — Clínica",
    cert_ref: "/data/certs/clinica_sicoob.pfx",
    is_default: true,
    sandbox: true,
    ativo: true,
    criado_em: "2026-07-21T10:00:00Z",
  },
];

export const MOCK_INVOICES: Invoice[] = [
  {
    id: "mock-inv1",
    metodo: "pix",
    provider: "sicoob",
    valor_centavos: 49700,
    status: "pendente",
    provider_ref: "a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6",
    vencimento: null,
    pago_em: null,
    criado_em: "2026-07-21T11:00:00Z",
  },
  {
    id: "mock-inv2",
    metodo: "pix",
    provider: "sicoob",
    valor_centavos: 49700,
    status: "pago",
    provider_ref: "f0e1d2c3b4a5968778695a4b3c2d1e0f",
    vencimento: null,
    pago_em: "2026-07-20T09:30:00Z",
    criado_em: "2026-07-20T09:12:00Z",
  },
];

export const MOCK_INVOICE_DETALHE: InvoiceDetalhe = {
  ...MOCK_INVOICES[0],
  pix_copia_cola:
    "00020126580014br.gov.bcb.pix0136clinica@exemplo.com.br520400005303986540549.705802BR5913Clinica Demo6009SAO PAULO62070503***6304ABCD",
  pix_qr_b64: null, // gerado pelo provider ao criar a fatura real
};
