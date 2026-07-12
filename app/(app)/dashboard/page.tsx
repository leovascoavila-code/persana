import type { Metadata } from "next";
import { AppShell } from "@/components/app/app-shell";
import { RevenueCard } from "@/components/app/revenue-card";
import { StatTile } from "@/components/ui/stat-tile";
import { Badge } from "@/components/ui/badge";
import { Table, THead, TR, TH, TD } from "@/components/ui/table";

export const metadata: Metadata = {
  title: "Persana — Visão geral",
};

const CLIENTES = [
  { nome: "Clínica Heringer", plano: "Escala", mrr: "R$ 4.200", status: "ok" as const, saude: "Saudável" },
  { nome: "Farmácia Central", plano: "Pro", mrr: "R$ 1.980", status: "ok" as const, saude: "Saudável" },
  { nome: "Lab Vale Verde", plano: "Pro", mrr: "R$ 1.980", status: "warn" as const, saude: "Atenção" },
  { nome: "Studio Norte", plano: "Essencial", mrr: "R$ 690", status: "ok" as const, saude: "Saudável" },
  { nome: "Óptica Manhuaçu", plano: "Essencial", mrr: "R$ 690", status: "danger" as const, saude: "Em risco" },
];

export default function DashboardPage() {
  return (
    <AppShell>
      {/* cabeçalho da página — título em Spectral */}
      <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-serif text-[28px] font-semibold tracking-[-0.01em] text-text-1">
            Visão geral
          </h1>
          <p className="mt-1 text-sm text-text-3">
            Resumo do mês · atualizado há poucos minutos
          </p>
        </div>
        <Badge variant="accent">✦ Relatório automático pronto</Badge>
      </div>

      {/* stat tiles — números-herói em Spectral */}
      <div className="mb-4 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <StatTile label="Receita recorrente" value="R$ 84,2 mil" delta="12,4% vs. mês anterior" />
        <StatTile label="Clientes ativos" value="1.284" delta="3,1% vs. mês anterior" />
        <StatTile label="Satisfação" value="96%" delta="1,2 p.p. vs. mês anterior" />
        <StatTile label="Churn" value="1,8%" delta="0,3 p.p. vs. mês anterior" trend="down" />
      </div>

      {/* gráfico */}
      <div className="mb-4">
        <RevenueCard />
      </div>

      {/* tabela de clientes */}
      <section>
        <h2 className="mb-2.5 text-[13.5px] font-semibold text-text-1">
          Clientes por receita
        </h2>
        <Table>
          <THead>
            <TR>
              <TH>Cliente</TH>
              <TH>Plano</TH>
              <TH className="text-right">MRR</TH>
              <TH>Saúde</TH>
            </TR>
          </THead>
          <tbody>
            {CLIENTES.map((c) => (
              <TR key={c.nome}>
                <TD className="font-medium text-text-1">{c.nome}</TD>
                <TD>{c.plano}</TD>
                <TD className="text-right tabular text-text-1">{c.mrr}</TD>
                <TD>
                  <Badge variant={c.status}>{c.saude}</Badge>
                </TD>
              </TR>
            ))}
          </tbody>
        </Table>
      </section>
    </AppShell>
  );
}
