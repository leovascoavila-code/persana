import Link from "next/link";
import { Logo } from "@/components/marketing/logo";
import { SessionChip } from "@/components/app/auth";
import { AppNav, type AppTab } from "@/components/app/app-nav";

export type { AppTab };

/** Casca do app (mundo Tinta): topbar + área de conteúdo. */
export function AppShell({
  children,
  active = "dashboard",
}: {
  children: React.ReactNode;
  active?: AppTab;
}) {
  return (
    <div className="flex min-h-screen flex-col bg-bg-0">
      <header className="sticky top-0 z-40 border-b border-border bg-bg-1/90 backdrop-blur-md">
        <div className="mx-auto flex max-w-[1120px] items-center gap-3 px-5 py-3 md:px-8">
          <Link href="/" aria-label="Início">
            <Logo className="text-base" />
          </Link>
          <AppNav active={active} />
          <div className="ml-auto flex items-center gap-3">
            <SessionChip />
            <span className="hidden text-[13px] text-text-3 sm:inline">
              Minas Pharma
            </span>
            <span
              aria-hidden
              className="grid h-8 w-8 place-items-center rounded-full bg-accent-wash font-serif text-[13px] font-semibold text-accent-300"
            >
              MP
            </span>
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-[1120px] flex-1 px-5 py-8 md:px-8">
        {children}
      </main>
    </div>
  );
}
