import { AppShell } from "@/components/app/app-shell";
import { CadenciaView } from "@/components/app/cadencia-view";

export default function CadenciasPage() {
  return (
    <AppShell active="cadencias">
      <CadenciaView />
    </AppShell>
  );
}
