import type { Metadata } from "next";
import { spectral, manrope } from "./fonts";
import "./globals.css";

export const metadata: Metadata = {
  title: "Persana — o copiloto clínico da medicina personalizada",
  description:
    "O sistema operacional da clínica de medicina personalizada: anamnese, exames, protocolos e prescrição digital num só fluxo. A IA estrutura e sugere — o médico revisa, aprova e assina.",
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
