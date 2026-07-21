import { AppShell } from "@/components/app/app-shell";
import { BibliotecaView } from "@/components/app/biblioteca-view";

export default function BibliotecaPage() {
  return (
    <AppShell active="biblioteca">
      <BibliotecaView />
    </AppShell>
  );
}
