import { AppShell } from "@/components/app/app-shell";
import { CrmView } from "@/components/app/crm-view";

export default function CrmPage() {
  return (
    <AppShell active="crm">
      <CrmView />
    </AppShell>
  );
}
