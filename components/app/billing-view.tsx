"use client";

/** Cobrança (Onda 3 Slice 2a) — config de provider + fatura/QR Pix — view Tinta.
 * Deslogado: MOCK. Logado: /billing (provider-configs [gated financeiro],
 * invoices Pix). Inerte por default: sem BILLING_SECRET_KEY + provider -> 422;
 * médico -> 403 no config. Erro de API: mock + banner (padrão irmãs). */
import * as React from "react";
import { Badge } from "@/components/ui/badge";
import { Card, CardBody, CardHeader, CardTitle } from "@/components/ui/card";
import { StatTile } from "@/components/ui/stat-tile";
import { useAuth } from "@/components/app/auth";
import { api } from "@/lib/api";
import {
  INVOICE_STATUS_LABEL,
  MOCK_INVOICES,
  MOCK_INVOICE_DETALHE,
  MOCK_PROVIDER_CONFIGS,
  fmtDia,
  invoiceBadge,
  valorBRL,
  type Invoice,
  type InvoiceDetalhe,
  type ProviderConfig,
} from "@/lib/billing";

const inputCls =
  "w-full rounded-md border border-border bg-bg-1 px-3 py-1.5 text-sm text-text-1 placeholder:text-text-3 focus:border-brand-500 focus:outline-none";
const btnPrimary =
  "rounded-sm bg-brand-500 px-3 py-1.5 text-[13px] font-medium text-white transition-colors hover:bg-brand-600 disabled:opacity-40";

function reaisParaCentavos(v: string): number {
  const n = parseFloat(v.replace(/\./g, "").replace(",", "."));
  return Number.isFinite(n) ? Math.round(n * 100) : 0;
}

export function BillingView() {
  const { authed } = useAuth();
  const [providers, setProviders] = React.useState<ProviderConfig[] | null>(null);
  const [invoices, setInvoices] = React.useState<Invoice[] | null>(null);
  const [selInv, setSelInv] = React.useState<string | null>(null);
  const [detalhe, setDetalhe] = React.useState<InvoiceDetalhe | null>(null);
  const [erro, setErro] = React.useState<string | null>(null);
  const [msg, setMsg] = React.useState<string | null>(null);
  const [copiado, setCopiado] = React.useState(false);

  const [cfg, setCfg] = React.useState({
    provider: "sicoob", display_nome: "", client_id: "", chave_pix: "",
    cert_ref: "", cert_senha: "", sandbox: true, is_default: true,
  });
  const [fat, setFat] = React.useState({ valor: "", enrollment_id: "", cpf: "", descricao: "" });

  const carregar = React.useCallback(() => {
    if (!authed) return;
    setErro(null);
    api.providerConfigs().then(setProviders).catch((e) => {
      setProviders(null);
      setErro(String(e.message ?? e));
    });
    api.invoices().then(setInvoices).catch(() => setInvoices(null));
  }, [authed]);

  React.useEffect(() => {
    if (!authed) {
      setProviders(null);
      setInvoices(null);
      setSelInv("mock-inv1");
      setErro(null);
      setMsg(null);
      return;
    }
    carregar();
  }, [authed, carregar]);

  React.useEffect(() => {
    setCopiado(false);
    if (!selInv) return setDetalhe(null);
    if (!authed) return setDetalhe(selInv === "mock-inv1" ? MOCK_INVOICE_DETALHE : null);
    api.invoice(selInv).then(setDetalhe).catch(() => setDetalhe(null));
  }, [selInv, authed]);

  const provs = authed ? providers ?? (erro ? MOCK_PROVIDER_CONFIGS : []) : MOCK_PROVIDER_CONFIGS;
  const invs = authed ? invoices ?? (erro ? MOCK_INVOICES : []) : MOCK_INVOICES;
  const det = authed ? detalhe : selInv === "mock-inv1" ? MOCK_INVOICE_DETALHE : null;

  const salvarProvider = () => {
    if (!authed) return;
    setMsg(null);
    setErro(null);
    api
      .criarProviderConfig({
        kind: "pix",
        provider: cfg.provider,
        display_nome: cfg.display_nome || null,
        credenciais: { client_id: cfg.client_id, chave_pix: cfg.chave_pix, cert_senha: cfg.cert_senha },
        cert_ref: cfg.cert_ref || null,
        is_default: cfg.is_default,
        sandbox: cfg.sandbox,
      })
      .then(() => {
        setMsg("Provedor configurado.");
        setCfg({ ...cfg, client_id: "", chave_pix: "", cert_senha: "" });
        carregar();
      })
      .catch((e) => setErro(String(e.message ?? e)));
  };

  const gerarFatura = () => {
    if (!authed || !fat.valor) return;
    setMsg(null);
    setErro(null);
    api
      .criarInvoice({
        valor_centavos: reaisParaCentavos(fat.valor),
        enrollment_id: fat.enrollment_id || null,
        cpf_cnpj: fat.cpf || null,
        descricao: fat.descricao || null,
      })
      .then((r) => {
        setMsg("Cobrança Pix gerada.");
        setSelInv(r.id);
        carregar();
      })
      .catch((e) => setErro(String(e.message ?? e)));
  };

  const copiar = (texto: string) => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(texto).then(() => setCopiado(true)).catch(() => {});
    }
  };

  return (
    <>
      <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-[12px] font-medium uppercase tracking-[0.08em] text-accent-300">
            Comercial
          </p>
          <h1 className="mt-1 font-serif text-[28px] font-semibold tracking-[-0.01em] text-text-1">
            Cobrança
          </h1>
          <p className="mt-1 text-sm text-text-3">
            Pix por clínica (recebedor próprio) · fatura + QR · cartão em breve
          </p>
        </div>
        {!authed && <Badge variant="warn">entrar para dados reais</Badge>}
      </div>

      {erro && (
        <div className="mb-4 rounded-md border border-danger/40 bg-danger/10 px-3 py-2 text-[13px] text-danger">
          API indisponível ({erro}) — exibindo dados ilustrativos.
        </div>
      )}
      {msg && (
        <div className="mb-4 rounded-md border border-[color-mix(in_srgb,var(--brand-500)_35%,transparent)] bg-brand-wash px-3 py-2 text-[13px] text-brand-300">
          {msg}
        </div>
      )}

      <div className="mb-6 grid grid-cols-2 gap-3 md:grid-cols-3">
        <StatTile label="Faturas pendentes" value={String(invs.filter((i) => i.status === "pendente").length)} />
        <StatTile label="Pagas" value={String(invs.filter((i) => i.status === "pago").length)} />
        <StatTile label="Provedores" value={String(provs.length)} />
      </div>

      <div className="grid gap-4 lg:grid-cols-[1fr_1.1fr]">
        {/* ── Provider config ── */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Provedor de pagamento (Pix)</CardTitle>
              <p className="mt-1 text-[12px] text-text-3">
                Recebedor da clínica. Credenciais cifradas no servidor; o certificado
                vive por referência. Só perfil financeiro configura.
              </p>
            </CardHeader>
            <CardBody>
              <div className="space-y-2">
                <div className="flex gap-2">
                  <select
                    className="rounded-md border border-border bg-bg-1 px-2 py-1.5 text-sm text-text-1"
                    value={cfg.provider}
                    onChange={(e) => setCfg({ ...cfg, provider: e.target.value })}
                    disabled={!authed}
                  >
                    <option value="sicoob">Sicoob</option>
                    <option value="bb">Banco do Brasil</option>
                    <option value="itau">Itaú</option>
                    <option value="inter">Inter</option>
                  </select>
                  <input
                    className={inputCls}
                    placeholder="Nome de exibição"
                    value={cfg.display_nome}
                    onChange={(e) => setCfg({ ...cfg, display_nome: e.target.value })}
                    disabled={!authed}
                  />
                </div>
                <input
                  className={inputCls}
                  placeholder="Client ID"
                  value={cfg.client_id}
                  onChange={(e) => setCfg({ ...cfg, client_id: e.target.value })}
                  disabled={!authed}
                />
                <input
                  className={inputCls}
                  placeholder="Chave Pix"
                  value={cfg.chave_pix}
                  onChange={(e) => setCfg({ ...cfg, chave_pix: e.target.value })}
                  disabled={!authed}
                />
                <input
                  className={inputCls}
                  placeholder="Caminho do certificado (.pfx no servidor)"
                  value={cfg.cert_ref}
                  onChange={(e) => setCfg({ ...cfg, cert_ref: e.target.value })}
                  disabled={!authed}
                />
                <input
                  className={inputCls}
                  type="password"
                  placeholder="Senha do certificado"
                  value={cfg.cert_senha}
                  onChange={(e) => setCfg({ ...cfg, cert_senha: e.target.value })}
                  disabled={!authed}
                />
                <label className="flex items-center gap-2 text-[13px] text-text-2">
                  <input
                    type="checkbox"
                    checked={cfg.sandbox}
                    onChange={(e) => setCfg({ ...cfg, sandbox: e.target.checked })}
                    disabled={!authed}
                  />
                  Sandbox (homologação)
                </label>
                <button onClick={salvarProvider} disabled={!authed} className={btnPrimary}>
                  Salvar provedor
                </button>
              </div>
            </CardBody>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Provedores configurados</CardTitle>
            </CardHeader>
            <CardBody>
              {provs.length === 0 ? (
                <p className="text-sm text-text-3">Nenhum provedor configurado.</p>
              ) : (
                provs.map((c) => (
                  <div
                    key={c.id}
                    className="flex items-center justify-between gap-3 border-b border-border py-2.5 last:border-b-0"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-text-1">
                        {c.display_nome ?? c.provider}
                      </p>
                      <p className="text-[12.5px] text-text-3">
                        {c.kind} · {c.provider}
                      </p>
                    </div>
                    <div className="flex shrink-0 items-center gap-1.5">
                      {c.is_default && <Badge variant="brand">padrão</Badge>}
                      {c.sandbox && <Badge variant="warn">sandbox</Badge>}
                    </div>
                  </div>
                ))
              )}
            </CardBody>
          </Card>
        </div>

        {/* ── Fatura + QR ── */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Nova cobrança Pix</CardTitle>
            </CardHeader>
            <CardBody>
              <div className="space-y-2">
                <div className="flex gap-2">
                  <input
                    className={inputCls}
                    placeholder="Valor (497,00)"
                    value={fat.valor}
                    onChange={(e) => setFat({ ...fat, valor: e.target.value })}
                    disabled={!authed}
                  />
                  <input
                    className={inputCls}
                    placeholder="CPF (opcional)"
                    value={fat.cpf}
                    onChange={(e) => setFat({ ...fat, cpf: e.target.value })}
                    disabled={!authed}
                  />
                </div>
                <input
                  className={inputCls}
                  placeholder="ID da matrícula (opcional)"
                  value={fat.enrollment_id}
                  onChange={(e) => setFat({ ...fat, enrollment_id: e.target.value })}
                  disabled={!authed}
                />
                <input
                  className={inputCls}
                  placeholder="Descrição (aparece no Pix)"
                  value={fat.descricao}
                  onChange={(e) => setFat({ ...fat, descricao: e.target.value })}
                  disabled={!authed}
                />
                <button onClick={gerarFatura} disabled={!authed} className={btnPrimary}>
                  Gerar cobrança
                </button>
                {authed && (
                  <p className="text-[12px] text-text-3">
                    Sem provedor + chave configurados, o servidor responde 422 (inerte
                    por segurança).
                  </p>
                )}
              </div>
            </CardBody>
          </Card>

          {det && (
            <Card>
              <CardHeader>
                <CardTitle>Fatura {valorBRL(det.valor_centavos)}</CardTitle>
                <div className="mt-1 flex items-center gap-2">
                  <Badge variant={invoiceBadge(det.status)}>
                    {INVOICE_STATUS_LABEL[det.status]}
                  </Badge>
                  <span className="text-[12px] text-text-3">
                    {det.provider ?? "—"} · {fmtDia(det.criado_em)}
                  </span>
                </div>
              </CardHeader>
              <CardBody>
                {det.pix_qr_b64 ? (
                  <img
                    src={`data:image/png;base64,${det.pix_qr_b64}`}
                    alt="QR Pix"
                    className="mb-3 h-40 w-40 rounded-md bg-white p-1"
                  />
                ) : (
                  <div className="mb-3 grid h-40 w-40 place-items-center rounded-md border border-dashed border-border text-[12px] text-text-3">
                    QR Pix
                    <br />
                    (gerado pelo provedor)
                  </div>
                )}
                {det.pix_copia_cola ? (
                  <div>
                    <p className="text-[12px] font-medium uppercase tracking-[0.06em] text-text-3">
                      Copia e cola
                    </p>
                    <p className="mt-1 break-all rounded-md border border-border bg-bg-1 p-2 font-mono text-[11px] text-text-2">
                      {det.pix_copia_cola}
                    </p>
                    <button
                      onClick={() => copiar(det.pix_copia_cola!)}
                      disabled={!authed && !det.pix_copia_cola}
                      className="mt-2 rounded-sm bg-brand-500/10 px-2.5 py-1 text-[12px] font-medium text-brand-300 transition-colors hover:bg-brand-500/20"
                    >
                      {copiado ? "Copiado" : "Copiar"}
                    </button>
                  </div>
                ) : (
                  <p className="text-sm text-text-3">Sem código Pix nesta fatura.</p>
                )}
              </CardBody>
            </Card>
          )}

          <Card>
            <CardHeader>
              <CardTitle>Faturas</CardTitle>
            </CardHeader>
            <CardBody>
              {invs.length === 0 ? (
                <p className="text-sm text-text-3">Nenhuma fatura ainda.</p>
              ) : (
                invs.map((i) => (
                  <button
                    key={i.id}
                    onClick={() => setSelInv(i.id)}
                    className={
                      "flex w-full items-center justify-between gap-3 border-b border-border py-2.5 text-left last:border-b-0 " +
                      (i.id === selInv ? "bg-bg-2" : "transition-colors hover:bg-bg-1")
                    }
                  >
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-text-1">
                        {valorBRL(i.valor_centavos)}
                      </p>
                      <p className="truncate text-[12px] text-text-3">
                        {i.provider_ref ? `${i.provider_ref.slice(0, 12)}…` : "—"}
                      </p>
                    </div>
                    <div className="flex shrink-0 items-center gap-2">
                      <Badge variant={invoiceBadge(i.status)}>
                        {INVOICE_STATUS_LABEL[i.status]}
                      </Badge>
                      <span className="tabular text-[12px] text-text-3">
                        {fmtDia(i.criado_em)}
                      </span>
                    </div>
                  </button>
                ))
              )}
            </CardBody>
          </Card>
        </div>
      </div>
    </>
  );
}
