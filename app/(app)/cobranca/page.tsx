import { AppShell } from "@/components/app/app-shell";
import { BillingView } from "@/components/app/billing-view";

export default function CobrancaPage() {
  return (
    <AppShell active="cobranca">
      <BillingView />
    </AppShell>
  );
}
