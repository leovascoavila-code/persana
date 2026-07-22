import type { Metadata } from "next";
import { AppShell } from "@/components/app/app-shell";
import { RoiView } from "@/components/app/roi-view";

export const metadata: Metadata = {
  title: "Persana — ROI do médico",
};

export default function DashboardPage() {
  return (
    <AppShell active="dashboard">
      <RoiView />
    </AppShell>
  );
}
