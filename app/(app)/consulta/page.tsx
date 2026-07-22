import { AppShell } from "@/components/app/app-shell";
import { ConsultaView } from "@/components/app/consulta-view";

export default function ConsultaPage() {
  return (
    <AppShell active="consulta">
      <ConsultaView />
    </AppShell>
  );
}
