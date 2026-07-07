import type { Metadata } from "next"
import { Inter, Poppins } from "next/font/google"
import { LOGO_PATH } from "@/lib/constants"
import "./globals.css"

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
})

const poppins = Poppins({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["700", "800"],
})

const TITULO = "Corre Conça — Corrida Solidária | 16 de Agosto em Conceição da Feira"
const DESCRICAO =
  "Participe da 1ª Corrida Solidária Corre Conça! Caminhada 3KM e Corrida 6KM no dia 16 de agosto em Conceição da Feira – BA. Inscreva-se agora!"

export const metadata: Metadata = {
  // Domínio da Vercel; trocar quando um domínio próprio for configurado (ver HANDOFF.md).
  metadataBase: new URL("https://landing-page-corre-conca.vercel.app"),
  title: TITULO,
  description: DESCRICAO,
  openGraph: {
    title: TITULO,
    description: DESCRICAO,
    type: "website",
    locale: "pt_BR",
    images: [{ url: LOGO_PATH }],
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="pt-BR"
      className={`${inter.variable} ${poppins.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col font-sans">{children}</body>
    </html>
  )
}
