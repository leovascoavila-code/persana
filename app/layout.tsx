import type { Metadata } from "next";
import { spectral, manrope } from "./fonts";
import "./globals.css";

export const metadata: Metadata = {
  title: "Persana — clareza que vira velocidade",
  description:
    "O workspace que a sua equipe abre de manhã e esquece que é software. Menos ruído, mais trabalho feito.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="pt-BR"
      className={`${spectral.variable} ${manrope.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-bg-0 text-text-1">
        {children}
      </body>
    </html>
  );
}
