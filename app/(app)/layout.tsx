import { AuthProvider } from "@/components/app/auth";

/** Layout do grupo (app): provê a sessão (token em memória) pras telas Tinta. */
export default function AppLayout({ children }: { children: React.ReactNode }) {
  return <AuthProvider>{children}</AuthProvider>;
}
