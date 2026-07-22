import { AppShell } from "@/components/app/app-shell";
import { PromView } from "@/components/app/prom-view";

export default function PromsPage() {
  return (
    <AppShell active="proms">
      <PromView />
    </AppShell>
  );
}
