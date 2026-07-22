import type { Metadata } from "next";
import { AppShell } from "@/components/app/app-shell";
import { ExamesView } from "@/components/app/exames-view";

export const metadata: Metadata = {
  title: "Persana — Exames",
};

export default function ExamesPage() {
  return (
    <AppShell active="exames">
      <ExamesView />
    </AppShell>
  );
}
