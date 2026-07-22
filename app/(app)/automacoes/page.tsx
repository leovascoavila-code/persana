import type { Metadata } from "next";
import { AppShell } from "@/components/app/app-shell";
import { AutomacaoView } from "@/components/app/automacao-view";

export const metadata: Metadata = {
  title: "Persana — Automação da jornada",
};

export default function AutomacoesPage() {
  return (
    <AppShell active="automacoes">
      <AutomacaoView />
    </AppShell>
  );
}
