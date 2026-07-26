import type { Metadata } from "next";
import { AppShell } from "@/components/app/app-shell";
import { MaterialView } from "@/components/app/material-view";

export const metadata: Metadata = {
  title: "Persana — Material do paciente",
};

export default function MaterialPage() {
  return (
    <AppShell active="material">
      <MaterialView />
    </AppShell>
  );
}
