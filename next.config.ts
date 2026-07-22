import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,
  serverExternalPackages: ["sharp"],
  // O rastreamento de arquivos da Vercel (@vercel/nft) não detecta o binário nativo do
  // sharp (carregado dinamicamente dentro do próprio pacote), então a Lambda cai no
  // fallback WASM (sem fontconfig/@font-face) em vez de usar o binário nativo instalado.
  outputFileTracingIncludes: {
    "/api/atleta/[token]/bib.png": ["./node_modules/@img/**/*"],
    "/api/atleta/[token]/credencial.png": ["./node_modules/@img/**/*"],
  },
  images: {
    // Necessário para servir a logo placeholder (SVG local em /public/images).
    dangerouslyAllowSVG: true,
    contentDispositionType: "attachment",
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },
};

export default nextConfig;
