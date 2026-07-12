import Link from "next/link";
import { Logo } from "./logo";
import { Button } from "@/components/ui/button";

const LINKS = [
  { label: "Produto", href: "#" },
  { label: "Soluções", href: "#" },
  { label: "Preços", href: "#" },
  { label: "Recursos", href: "#" },
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
            href="#"
            className="hidden text-sm text-text-2 transition-colors hover:text-text-1 sm:inline"
          >
            Entrar
          </Link>
          <Button asChild size="sm">
            <Link href="/dashboard">Começar</Link>
          </Button>
        </div>
      </nav>
    </header>
  );
}
