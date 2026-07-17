import type { Metadata } from "next";
import { AppShell } from "@/components/app/app-shell";
import { AgendaView } from "@/components/app/agenda-view";

export const metadata: Metadata = {
  title: "Persana — Agenda",
};

export default function AgendaPage() {
  return (
    <AppShell active="agenda">
      <AgendaView />
    </AppShell>
  );
}
