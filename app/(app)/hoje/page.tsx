import { AppShell } from "@/components/app/app-shell";
import { HojeView } from "@/components/app/hoje-view";

export default function HojePage() {
  return (
    <AppShell active="hoje">
      <HojeView />
    </AppShell>
  );
}
