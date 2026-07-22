"use client";

/** Exames structured-first (Onda 6) — proveniência + roteamento de revisão — Tinta.
 * Deslogado: MOCK. Logado: busca paciente → GET /exames/paciente → /exames/{id}.
 * Erro: mock + banner. Cada resultado mostra DE ONDE veio (fonte + confiança) e a
 * prioridade de revisão; structured entra 'pendente' — o médico confirma (invariante). */
import * as React from "react";
import { Card, CardBody, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, THead, TR, TH, TD } from "@/components/ui/table";
import { useAuth } from "@/components/app/auth";
import { api } from "@/lib/api";
import {
  FONTE_BADGE,
  FONTE_LABEL,
  HIERARQUIA,
  MOCK_EXAME,
  estruturada,
  type ExameDetalhe,
  type Fonte,
} from "@/lib/exames";

const inputCls =
  "w-full rounded-md border border-border bg-bg-1 px-3 py-1.5 text-sm text-text-1 placeholder:text-text-3 focus:border-brand-500 focus:outline-none";

function flagFuncBadge(f: string | null): "ok" | "warn" | "danger" | "neutral" {
  if (f === "ideal") return "ok";
  if (f === "subotimo") return "warn";
  if (f === "fora") return "danger";
  return "neutral";
}

export function ExamesView() {
  const { authed } = useAuth();
  const [exame, setExame] = React.useState<ExameDetalhe>(MOCK_EXAME);
  const [mock, setMock] = React.useState(true);
  const [erro, setErro] = React.useState<string | null>(null);
  const [q, setQ] = React.useState("");
  const [lista, setLista] = React.useState<{ id: string; nome: string }[]>([]);

  React.useEffect(() => {
    if (!authed) {
      setMock(true);
      setExame(MOCK_EXAME);
    }
  }, [authed]);

  async function buscar() {
    if (!authed) return;
    try {
      const ps = await api.patients(q);
      setLista(ps);
    } catch (e) {
      setErro(e instanceof Error ? e.message : "falha na busca");
    }
  }

  async function abrir(pid: string) {
    try {
      const exs = await api.exames(pid);
      if (!exs.length) {
        setErro("paciente sem exames");
        return;
      }
      const det = await api.exameDetalhe(exs[0].id);
      setExame(det);
      setMock(false);
      setErro(null);
    } catch (e) {
      setErro(e instanceof Error ? e.message : "falha ao abrir exame");
      setExame(MOCK_EXAME);
      setMock(true);
    }
  }

  return (
    <>
      <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-[11px] uppercase tracking-[0.14em] text-accent-300">
            Structured-first
          </p>
          <h1 className="mt-1 font-serif text-[26px] font-semibold tracking-[-0.01em] text-text-1">
            Exames
          </h1>
          <p className="mt-1 text-[13px] text-text-3">
            Prefira a fonte estruturada; cada resultado rastreia de onde veio e quanto revisar.
          </p>
        </div>
        {(mock || erro) && (
          <Badge variant="warn">{erro ? `sem conexão — ${erro}` : "prévia (deslogado)"}</Badge>
        )}
      </div>

      {authed && (
        <div className="mb-4 flex gap-2">
          <input
            className={inputCls}
            placeholder="Buscar paciente…"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && buscar()}
          />
          {lista.length > 0 && (
            <select className={inputCls} onChange={(e) => e.target.value && abrir(e.target.value)}>
              <option value="">selecione…</option>
              {lista.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.nome}
                </option>
              ))}
            </select>
          )}
        </div>
      )}

      {/* legenda: hierarquia de fontes */}
      <Card className="mb-4">
        <CardHeader>
          <CardTitle>Hierarquia de fontes</CardTitle>
        </CardHeader>
        <CardBody>
          <div className="flex flex-wrap items-center gap-2 text-[12px] text-text-3">
            {HIERARQUIA.map((f, i) => (
              <React.Fragment key={f}>
                <Badge variant={FONTE_BADGE[f]}>{FONTE_LABEL[f]}</Badge>
                {i < HIERARQUIA.length - 1 && <span className="text-text-3">›</span>}
              </React.Fragment>
            ))}
          </div>
          <p className="mt-2 text-[12px] text-text-3">
            Estruturada (API/QR/template) entra sem OCR. Toda fonte entra{" "}
            <strong className="text-text-2">pendente</strong> — o médico confirma o uso oficial; a
            confiança só decide a prioridade de revisão.
          </p>
        </CardBody>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>
            {exame.laboratorio || "Exame"} · {exame.data_coleta || "—"}{" "}
            <Badge variant={FONTE_BADGE[exame.fonte as Fonte]}>{FONTE_LABEL[exame.fonte as Fonte]}</Badge>
          </CardTitle>
        </CardHeader>
        <CardBody>
          <div className="overflow-x-auto">
            <Table>
              <THead>
                <TR>
                  <TH>Analito</TH>
                  <TH>Valor</TH>
                  <TH>Funcional</TH>
                  <TH>Fonte</TH>
                  <TH>Confiança</TH>
                  <TH>Revisão</TH>
                </TR>
              </THead>
              <tbody>
                {exame.resultados.map((r) => (
                  <TR key={r.id}>
                    <TD>{r.analito}</TD>
                    <TD>
                      {r.valor}
                      {r.unidade ? ` ${r.unidade}` : ""}
                    </TD>
                    <TD>
                      {r.flag_funcional ? (
                        <Badge variant={flagFuncBadge(r.flag_funcional)}>{r.flag_funcional}</Badge>
                      ) : (
                        "—"
                      )}
                    </TD>
                    <TD>
                      <Badge variant={FONTE_BADGE[r.fonte]}>{r.fonte}</Badge>
                      {!estruturada(r.fonte) && r.origem_ia && (
                        <span className="ml-1 text-[11px] text-text-3">IA</span>
                      )}
                    </TD>
                    <TD>{r.confianca === null ? "—" : `${Math.round(r.confianca * 100)}%`}</TD>
                    <TD>
                      <Badge variant={r.prioridade_revisao === "baixa" ? "ok" : "warn"}>
                        {r.prioridade_revisao}
                      </Badge>
                    </TD>
                  </TR>
                ))}
              </tbody>
            </Table>
          </div>
        </CardBody>
      </Card>
    </>
  );
}
