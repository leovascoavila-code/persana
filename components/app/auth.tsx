"use client";

/** Sessão do app (mundo Tinta): contexto fino sobre lib/api.
 * Token em memória (lib/api) — este contexto só espelha quem está logado
 * para a UI reagir; reload = sessão encerrada (decisão POC). */
import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { apiLogin, apiLogout, type LoginIn } from "@/lib/api";

interface AuthCtx {
  authed: boolean;
  email: string | null;
  entrar: (input: LoginIn) => Promise<void>;
  sair: () => void;
}

const Ctx = React.createContext<AuthCtx>({
  authed: false,
  email: null,
  entrar: async () => {},
  sair: () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [email, setEmail] = React.useState<string | null>(null);

  const entrar = React.useCallback(async (input: LoginIn) => {
    await apiLogin(input);
    setEmail(input.email);
  }, []);

  const sair = React.useCallback(() => {
    apiLogout();
    setEmail(null);
  }, []);

  return (
    <Ctx.Provider value={{ authed: email !== null, email, entrar, sair }}>
      {children}
    </Ctx.Provider>
  );
}

export function useAuth(): AuthCtx {
  return React.useContext(Ctx);
}

/** Chip de sessão do topbar: Entrar (deslogado) ou email + Sair. */
export function SessionChip() {
  const { authed, email, sair } = useAuth();
  const router = useRouter();
  if (!authed) {
    return (
      <Button asChild variant="secondary" size="sm">
        <Link href="/login">Entrar</Link>
      </Button>
    );
  }
  return (
    <span className="flex items-center gap-2">
      <span className="hidden max-w-[180px] truncate text-[12.5px] text-text-2 sm:inline">
        {email}
      </span>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => {
          sair();
          router.push("/dashboard");
        }}
      >
        Sair
      </Button>
    </span>
  );
}
