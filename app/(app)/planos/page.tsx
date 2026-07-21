import { AppShell } from "@/components/app/app-shell";
import { PlanosView } from "@/components/app/planos-view";

export default function PlanosPage() {
  return (
    <AppShell active="planos">
      <PlanosView />
    </AppShell>
  );
}
