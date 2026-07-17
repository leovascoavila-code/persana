import type { NextConfig } from "next";
import path from "node:path";

const nextConfig: NextConfig = {
  // Fixa a raiz do workspace neste diretório: há um package-lock.json na pasta
  // pai (Programação) que faz o Next inferir a raiz errada.
  turbopack: {
    root: path.resolve(__dirname),
  },
  // Proxy server-side pro backend do POC (FastAPI no VPS): evita mixed content
  // (persana.com.br é HTTPS, o POC é http://IP) e CORS de uma vez. É o mesmo
  // caminho "rewrite" avaliado pra pendência MEMED /consulta.
  async rewrites() {
    return [
      { source: "/api/poc/:path*", destination: "http://2.25.162.171/:path*" },
    ];
  },
};

export default nextConfig;
