import type { Metadata } from "next";
import { AppShell } from "@/components/app/app-shell";
import { MetasView } from "@/components/app/metas-view";

export const metadata: Metadata = {
  title: "Persana — Metas da clínica",
};

export default function MetasPage() {
  return (
    <AppShell active="metas">
      <MetasView />
    </AppShell>
  );
}
