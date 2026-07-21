import { AppShell } from "@/components/app/app-shell";
import { PacientesView } from "@/components/app/pacientes-view";

export default function PacientesPage() {
  return (
    <AppShell active="pacientes">
      <PacientesView />
    </AppShell>
  );
}
