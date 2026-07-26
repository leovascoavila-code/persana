"use client";

/** Material de apresentação ao paciente (S.16.2) — Tinta.
 * Deslogado: MOCK. Logado: busca paciente → lista materiais → preview leigo branded
 * + Aprovar (rascunho→aprovado) + Baixar PDF. Erro: mock + banner. A IA gera
 * rascunho; o médico aprova (invariante). Nunca preço/receita de farmácia (S.16.3). */
import * as React from "react";
import { Card, CardBody, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/components/app/auth";
import { api } from "@/lib/api";
import {
  MOCK_LISTA,
  MOCK_MATERIAL,
  SECOES,
  STATUS_BADGE,
  type MaterialItem,
  type MaterialRendered,
  type ProtocoloPaciente,
} from "@/lib/material";

const inputCls =
  "w-full rounded-md border border-border bg-bg-1 px-3 py-1.5 text-sm text-text-1 placeholder:text-text-3 focus:border-brand-500 focus:outline-none";
const btn =
  "rounded-sm bg-brand-500 px-3 py-1.5 text-[13px] font-medium text-white transition-colors hover:bg-brand-600 disabled:opacity-40";
const btnGhost =
  "rounded-sm border border-border px-3 py-1.5 text-[13px] text-text-2 transition-colors hover:text-text-1 disabled:opacity-40";

export function MaterialView() {
  const { authed } = useAuth();
  const [q, setQ] = React.useState("");
  const [pacientes, setPacientes] = React.useState<{ id: string; nome: string }[]>([]);
  const [lista, setLista] = React.useState<MaterialItem[]>(MOCK_LISTA);
  const [mat, setMat] = React.useState<MaterialRendered>(MOCK_MATERIAL);
  const [matId, setMatId] = React.useState<string | null>(null);
  const [pidAtual, setPidAtual] = React.useState<string | null>(null);
  const [protocolos, setProtocolos] = React.useState<ProtocoloPaciente[]>([]);
  const [protoSel, setProtoSel] = React.useState("");
  const [gerando, setGerando] = React.useState(false);
  const [mock, setMock] = React.useState(true);
  const [erro, setErro] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (!authed) {
      setMock(true);
      setLista(MOCK_LISTA);
      setMat(MOCK_MATERIAL);
    }
  }, [authed]);

  async function buscar() {
    if (!authed) return;
    try {
      setPacientes(await api.patients(q));
    } catch (e) {
      setErro(e instanceof Error ? e.message : "falha na busca");
    }
  }

  async function abrirPaciente(pid: string) {
    setPidAtual(pid);
    try {
      const [mats, protos] = await Promise.all([
        api.materiaisPaciente(pid),
        api.protocolosPaciente(pid).catch(() => []),
      ]);
      setLista(mats);
      setProtocolos(protos);
      setProtoSel("");
      setMock(false);
      setErro(null);
    } catch (e) {
      setErro(e instanceof Error ? e.message : "falha ao listar materiais");
    }
  }

  async function gerar() {
    if (mock || !protoSel || !pidAtual) return;
    setGerando(true);
    try {
      const novo = await api.materialGerar(protoSel);
      setLista(await api.materiaisPaciente(pidAtual));
      await abrirMaterial(novo.id);
      setErro(null);
    } catch (e) {
      setErro(e instanceof Error ? e.message : "falha ao gerar material");
    } finally {
      setGerando(false);
    }
  }

  async function abrirMaterial(mid: string) {
    try {
      setMat(await api.material(mid));
      setMatId(mid);
      setMock(false);
    } catch (e) {
      setErro(e instanceof Error ? e.message : "falha ao abrir material");
    }
  }

  async function aprovar() {
    if (mock || !matId) return;
    try {
      await api.materialAprovar(matId);
      setMat({ ...mat, status: "aprovado" });
      setLista((ls) => ls.map((m) => (m.id === matId ? { ...m, status: "aprovado" } : m)));
    } catch (e) {
      setErro(e instanceof Error ? e.message : "falha ao aprovar");
    }
  }

  async function baixarPdf() {
    if (mock || !matId) return;
    try {
      const blob = await api.materialPdf(matId);
      const url = URL.createObjectURL(blob);
      window.open(url, "_blank");
      setTimeout(() => URL.revokeObjectURL(url), 15000);
    } catch (e) {
      setErro(e instanceof Error ? e.message : "falha ao baixar PDF");
    }
  }

  const cor = mat.branding?.cor_primaria || "var(--brand-500)";

  return (
    <>
      <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-[11px] uppercase tracking-[0.14em] text-accent-300">
            Apresentação ao paciente
          </p>
          <h1 className="mt-1 font-serif text-[26px] font-semibold tracking-[-0.01em] text-text-1">
            Material do paciente
          </h1>
          <p className="mt-1 text-[13px] text-text-3">
            Linguagem leiga, com a identidade da clínica — a IA rascunha, você aprova.
          </p>
        </div>
        {(mock || erro) && (
          <Badge variant="warn">{erro ? `sem conexão — ${erro}` : "prévia (deslogado)"}</Badge>
        )}
      </div>

      {authed && (
        <div className="mb-4 flex flex-wrap gap-2">
          <input
            className={inputCls + " max-w-xs"}
            placeholder="Buscar paciente…"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && buscar()}
          />
          {pacientes.length > 0 && (
            <select className={inputCls + " max-w-xs"} onChange={(e) => e.target.value && abrirPaciente(e.target.value)}>
              <option value="">selecione o paciente…</option>
              {pacientes.map((p) => (
                <option key={p.id} value={p.id}>{p.nome}</option>
              ))}
            </select>
          )}
          {protocolos.length > 0 && (
            <>
              <select
                className={inputCls + " max-w-xs"}
                value={protoSel}
                onChange={(e) => setProtoSel(e.target.value)}
              >
                <option value="">gerar de um protocolo…</option>
                {protocolos.map((pp) => (
                  <option key={pp.id} value={pp.id}>
                    {pp.nome} ({pp.status})
                  </option>
                ))}
              </select>
              <button className={btn} onClick={gerar} disabled={!protoSel || gerando}>
                {gerando ? "Gerando…" : "Gerar material"}
              </button>
            </>
          )}
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[300px_1fr]">
        {/* lista de materiais */}
        <Card>
          <CardHeader>
            <CardTitle>Materiais</CardTitle>
          </CardHeader>
          <CardBody>
            <div className="space-y-1">
              {lista.map((m) => (
                <button
                  key={m.id}
                  onClick={() => abrirMaterial(m.id)}
                  className={
                    "flex w-full items-center justify-between gap-2 rounded-md px-2.5 py-2 text-left text-[13px] transition-colors " +
                    (m.id === matId ? "bg-bg-2 text-text-1" : "text-text-2 hover:bg-bg-2")
                  }
                >
                  <span className="min-w-0 truncate">{m.titulo || "Material"}</span>
                  <Badge variant={STATUS_BADGE[m.status]}>{m.status}</Badge>
                </button>
              ))}
              {lista.length === 0 && <p className="text-[13px] text-text-3">Sem materiais.</p>}
            </div>
          </CardBody>
        </Card>

        {/* preview leigo branded */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between gap-3">
              <CardTitle>
                Prévia do paciente <Badge variant={STATUS_BADGE[mat.status]}>{mat.status}</Badge>
              </CardTitle>
              <div className="flex gap-2">
                {mat.status === "rascunho" && (
                  <button className={btn} onClick={aprovar} disabled={mock}>Aprovar</button>
                )}
                <button className={btnGhost} onClick={baixarPdf} disabled={mock}>Baixar PDF</button>
              </div>
            </div>
          </CardHeader>
          <CardBody>
            <div className="rounded-md border border-border bg-bg-1 p-5">
              {mat.branding?.nome_exibicao && (
                <p className="text-[12px] uppercase tracking-[0.12em] text-text-3">
                  {mat.branding.nome_exibicao}
                </p>
              )}
              <h2 className="mt-1 font-serif text-[22px] font-semibold" style={{ color: cor }}>
                {mat.titulo}
              </h2>
              {mat.status !== "aprovado" && (
                <p className="mt-2 text-[12px] text-[var(--warning)]">
                  Pré-visualização — pendente de aprovação; não é a versão final.
                </p>
              )}
              <div className="mt-4 space-y-4">
                {SECOES.map(([chave, rotulo]) => {
                  const txt = mat.conteudo?.[chave];
                  if (!txt) return null;
                  return (
                    <div key={chave}>
                      <h3 className="text-[13px] font-semibold" style={{ color: cor }}>{rotulo}</h3>
                      <p className="mt-1 text-[13.5px] leading-relaxed text-text-2">{txt}</p>
                    </div>
                  );
                })}
              </div>
              {mat.disclaimer && (
                <p className="mt-6 border-t border-border pt-3 text-[11.5px] text-text-3">
                  {mat.disclaimer}
                </p>
              )}
            </div>
          </CardBody>
        </Card>
      </div>
    </>
  );
}
