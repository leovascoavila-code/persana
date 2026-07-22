"use client";

/** Dashboard ROI do médico + North Star (S.18) — o principal ativo de venda do
 * SaaS, tela Tinta caprichada. Responde "quanto a plataforma me rende".
 * Deslogado: MOCK. Logado: GET /roi/dashboard + /roi/north-star. Erro: mock +
 * banner (padrão irmãs). GUARDA S.16.3: honorários = serviço próprio da clínica;
 * nunca receita da farmácia, nunca ganho vinculado a volume prescrito. */
import * as React from "react";
import { StatTile } from "@/components/ui/stat-tile";
import { Card, CardBody, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/components/app/auth";
import { api } from "@/lib/api";
import {
  MOCK_DASHBOARD,
  MOCK_NORTH_STAR,
  bateAlvo,
  fmtBRL,
  fmtNum,
  progresso,
  type NorthStarMetric,
  type RoiDashboard,
} from "@/lib/roi";

function fmtValor(m: NorthStarMetric): string {
  if (m.valor === null) return "—";
  if (m.unidade === "R$") return fmtBRL(Math.round(m.valor * 100));
  if (m.unidade === "%") return `${fmtNum(m.valor, 0)}%`;
  return `${fmtNum(m.valor)} ${m.unidade}`;
}

function MetricRow({ m }: { m: NorthStarMetric }) {
  const bate = bateAlvo(m);
  const pct = progresso(m);
  return (
    <div className="border-b border-border py-3 last:border-0">
      <div className="flex items-baseline justify-between gap-3">
        <div className="flex items-baseline gap-2">
          <span className="font-mono text-[11px] text-text-3">{m.id}</span>
          <span className="text-[13px] text-text-1">{m.nome}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="font-serif text-[17px] font-semibold tabular text-text-1">
            {fmtValor(m)}
          </span>
          {m.alvo !== null && (
            <span className="text-[11px] text-text-3">
              alvo {m.sentido === "menor" ? "≤" : "≥"} {fmtNum(m.alvo, 0)}
              {m.unidade === "%" ? "%" : ""}
            </span>
          )}
          {bate !== null && (
            <Badge variant={bate ? "ok" : "warn"}>{bate ? "no alvo" : "abaixo"}</Badge>
          )}
        </div>
      </div>
      {pct !== null && (
        <div className="mt-2 h-1 w-full overflow-hidden rounded-full bg-bg-1">
          <div
            className={bate ? "h-full bg-brand-500" : "h-full bg-[var(--warning)]"}
            style={{ width: `${pct}%` }}
          />
        </div>
      )}
    </div>
  );
}

export function RoiView() {
  const { authed } = useAuth();
  const [d, setD] = React.useState<RoiDashboard>(MOCK_DASHBOARD);
  const [ns, setNs] = React.useState<NorthStarMetric[]>(MOCK_NORTH_STAR);
  const [erro, setErro] = React.useState<string | null>(null);
  const [mock, setMock] = React.useState(true);

  React.useEffect(() => {
    if (!authed) {
      setMock(true);
      setD(MOCK_DASHBOARD);
      setNs(MOCK_NORTH_STAR);
      return;
    }
    let vivo = true;
    (async () => {
      try {
        const [dash, star] = await Promise.all([api.roiDashboard(), api.roiNorthStar()]);
        if (!vivo) return;
        setD(dash);
        setNs(star.metricas);
        setMock(false);
        setErro(null);
      } catch (e) {
        if (!vivo) return;
        setErro(e instanceof Error ? e.message : "falha ao carregar ROI");
        setD(MOCK_DASHBOARD);
        setNs(MOCK_NORTH_STAR);
        setMock(true);
      }
    })();
    return () => {
      vivo = false;
    };
  }, [authed]);

  const cresc = d.crescimento_honorarios_pct;
  const crescLabel =
    cresc === null ? undefined : `${cresc >= 0 ? "+" : ""}${fmtNum(cresc)}% vs. mês anterior`;

  return (
    <>
      <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-[11px] uppercase tracking-[0.14em] text-accent-300">
            Retorno da plataforma
          </p>
          <h1 className="mt-1 font-serif text-[26px] font-semibold tracking-[-0.01em] text-text-1">
            ROI do médico
          </h1>
          <p className="mt-1 text-[13px] text-text-3">
            Quanto a plataforma está rendendo este mês — tempo, protocolos e honorários.
          </p>
        </div>
        {(mock || erro) && (
          <Badge variant="warn">
            {erro ? "sem conexão — dados de exemplo" : "prévia (deslogado)"}
          </Badge>
        )}
      </div>

      {/* Hero — os 4 números que vendem */}
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <StatTile
          label="Horas economizadas/mês"
          value={d.horas_economizadas_mes === null ? "—" : `${fmtNum(d.horas_economizadas_mes)} h`}
          delta={`${d.consultas_mes} consultas · baseline ${d.baseline_pos_consulta_min}min`}
          trend="up"
        />
        <StatTile
          label="Protocolos ativos"
          value={`${d.protocolos_ativos}`}
          delta={`${d.renovacoes_mes} renovações no mês`}
          trend="up"
        />
        <StatTile
          label="Honorários recorrentes/mês"
          value={fmtBRL(d.honorarios_mes_centavos)}
          delta={crescLabel}
          trend={cresc !== null && cresc < 0 ? "down" : "up"}
        />
        <StatTile
          label="Adesão média dos pacientes"
          value={d.adesao_media_pct === null ? "—" : `${fmtNum(d.adesao_media_pct, 0)}%`}
          delta={`${d.pacientes_retidos_crm} retidos pelo CRM`}
          trend="up"
        />
      </div>

      <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-[1.4fr_1fr]">
        {/* North Star */}
        <Card>
          <CardHeader>
            <CardTitle>North Star — indicadores que guiam o produto</CardTitle>
          </CardHeader>
          <CardBody>
            {ns.map((m) => (
              <MetricRow key={m.id} m={m} />
            ))}
          </CardBody>
        </Card>

        {/* Leitura + guarda */}
        <Card>
          <CardHeader>
            <CardTitle>Como ler</CardTitle>
          </CardHeader>
          <CardBody>
            <ul className="space-y-2 text-[13px] text-text-2">
              <li>
                <strong className="text-text-1">Horas economizadas</strong> = consultas do mês ×
                (baseline {d.baseline_pos_consulta_min}min − tempo real de documentação). Premissa
                de baseline declarada, não medida.
              </li>
              <li>
                <strong className="text-text-1">Honorários</strong> vêm apenas do serviço próprio
                da clínica (planos/protocolos cobrados).
              </li>
              <li className="rounded-md border border-border bg-bg-1 px-3 py-2 text-[12px] text-text-3">
                <strong className="text-text-2">Guarda regulatória (S.16.3):</strong> este painel
                nunca exibe receita da farmácia nem vincula o ganho do médico ao volume prescrito.
              </li>
            </ul>
          </CardBody>
        </Card>
      </div>
    </>
  );
}
