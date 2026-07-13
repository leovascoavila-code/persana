import type { Metadata } from "next";
import { AppShell } from "@/components/app/app-shell";
import { RevenueCard } from "@/components/app/revenue-card";
import { StatTile } from "@/components/ui/stat-tile";
import { Badge } from "@/components/ui/badge";
import { Table, THead, TR, TH, TD } from "@/components/ui/table";

export const metadata: Metadata = {
  title: "Persana — Console do médico",
};

type Situacao = "ativo" | "revisar" | "novo";

const SIT_META: Record<
  Situacao,
  { label: string; variant: "ok" | "warn" | "accent" }
> = {
  ativo: { label: "Protocolo ativo", variant: "ok" },
  revisar: { label: "Aguarda revisão", variant: "warn" },
  novo: { label: "Novo paciente", variant: "accent" },
};

const PACIENTES: {
  nome: string;
  protocolo: string;
  ultima: string;
  sit: Situacao;
}[] = [
  { nome: "Ana L.", protocolo: "Resistência insulínica / pré-diabetes", ultima: "há 3 dias", sit: "ativo" },
  { nome: "Bruno M.", protocolo: "Tireoidite de Hashimoto", ultima: "há 6 dias", sit: "ativo" },
  { nome: "Carla R.", protocolo: "SOP: metabólico + reprodutivo", ultima: "há 1 dia", sit: "revisar" },
  { nome: "Diego S.", protocolo: "Sarcopenia / longevidade muscular", ultima: "há 12 dias", sit: "ativo" },
  { nome: "Elisa V.", protocolo: "— (anamnese em aberto)", ultima: "hoje", sit: "novo" },
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
            Console do médico · dados ilustrativos
          </p>
        </div>
        <Badge variant="accent">✦ Copiloto ativo</Badge>
      </div>

      {/* stat tiles — números-herói em Spectral */}
      <div className="mb-4 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <StatTile label="Pacientes ativos" value="1.284" delta="3,1% vs. mês anterior" />
        <StatTile label="Protocolos em curso" value="342" delta="8 novos esta semana" />
        <StatTile label="Exames a revisar" value="18" delta="aguardam confirmação médica" trend="flat" />
        <StatTile label="Jornadas concluídas (mês)" value="57" delta="12% vs. mês anterior" />
      </div>

      {/* gráfico */}
      <div className="mb-4">
        <RevenueCard />
      </div>

      {/* pacientes em acompanhamento */}
      <section>
        <h2 className="mb-2.5 text-[13.5px] font-semibold text-text-1">
          Pacientes em acompanhamento
        </h2>
        <Table>
          <THead>
            <TR>
              <TH>Paciente</TH>
              <TH>Protocolo</TH>
              <TH>Última consulta</TH>
              <TH>Situação</TH>
            </TR>
          </THead>
          <tbody>
            {PACIENTES.map((p) => {
              const meta = SIT_META[p.sit];
              return (
                <TR key={p.nome}>
                  <TD className="font-medium text-text-1">{p.nome}</TD>
                  <TD>{p.protocolo}</TD>
                  <TD className="tabular">{p.ultima}</TD>
                  <TD>
                    <Badge variant={meta.variant}>{meta.label}</Badge>
                  </TD>
                </TR>
              );
            })}
          </tbody>
        </Table>
      </section>
    </AppShell>
  );
}
