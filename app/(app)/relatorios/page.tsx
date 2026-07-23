import type { Metadata } from "next";
import { AppShell } from "@/components/app/app-shell";
import { RelatorioView } from "@/components/app/relatorio-view";

export const metadata: Metadata = {
  title: "Persana — Relatório mensal",
};

export default function RelatoriosPage() {
  return (
    <AppShell active="relatorios">
      <RelatorioView />
    </AppShell>
  );
}
