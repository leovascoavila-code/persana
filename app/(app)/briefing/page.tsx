import type { Metadata } from "next";
import { AppShell } from "@/components/app/app-shell";
import { BriefingView } from "@/components/app/briefing-view";

export const metadata: Metadata = {
  title: "Persana — Briefing pré-consulta",
};

export default function BriefingPage() {
  return (
    <AppShell active="briefing">
      <BriefingView />
    </AppShell>
  );
}
