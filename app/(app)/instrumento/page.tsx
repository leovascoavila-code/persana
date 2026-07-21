import type { Metadata } from "next";
import { AppShell } from "@/components/app/app-shell";
import { InstrumentoView } from "@/components/app/instrumento-view";

export const metadata: Metadata = {
  title: "Persana — Análise Instrumental",
};

export default function InstrumentoPage() {
  return (
    <AppShell active="instrumento">
      <InstrumentoView />
    </AppShell>
  );
}
