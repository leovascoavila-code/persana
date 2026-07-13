import Link from "next/link";
import { Logo } from "./logo";
import { Button } from "@/components/ui/button";

const LINKS = [
  { label: "Módulos", href: "/modulos" },
  { label: "Como funciona", href: "#jornada" },
  { label: "Segurança", href: "#seguranca" },
];

export function Nav() {
  return (
    <header className="sticky top-0 z-40 border-b border-border bg-bg-0/80 backdrop-blur-md">
      <nav className="mx-auto flex max-w-[1120px] items-center gap-7 px-6 py-[18px] md:px-10">
        <Logo className="text-[23px]" />
        <div className="ml-2 hidden items-center gap-7 md:flex">
          {LINKS.map((l) => (
            <Link
              key={l.label}
              href={l.href}
              className="text-sm text-text-2 transition-colors hover:text-text-1"
            >
              {l.label}
            </Link>
          ))}
        </div>
        <div className="ml-auto flex items-center gap-3">
          <Link
            href="/dashboard"
            className="hidden text-sm text-text-2 transition-colors hover:text-text-1 sm:inline"
          >
            Entrar
          </Link>
          <Button asChild size="sm">
            <Link href="/modulos">Ver os módulos</Link>
          </Button>
        </div>
      </nav>
    </header>
  );
}
