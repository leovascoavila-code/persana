import type { NextConfig } from "next";
import path from "node:path";

const nextConfig: NextConfig = {
  // Fixa a raiz do workspace neste diretório: há um package-lock.json na pasta
  // pai (Programação) que faz o Next inferir a raiz errada.
  turbopack: {
    root: path.resolve(__dirname),
  },
};

export default nextConfig;
