"use client"

import Link from "next/link"
import { motion } from "framer-motion"

// Altura prevista deste componente: ~90px (botão + link "Verificar inscrição" + safe-area).
// Quem montar o layout final deve reservar `padding-bottom` equivalente
// (`pb-28 md:pb-0` no <main>, ver app/page.tsx) para que este CTA fixo
// não sobreponha conteúdo no final da página em mobile.
export default function StickyMobileCTA() {
  return (
    <motion.div
      initial={{ y: 80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.3, delay: 0.4 }}
      className="fixed inset-x-0 bottom-0 z-40 block border-t border-white/10 bg-roxo-dark/95 px-4 py-3 shadow-lg backdrop-blur-sm md:hidden"
    >
      <a
        href="#formulario"
        className="flex min-h-[44px] w-full items-center justify-center rounded-lg bg-white px-4 text-base font-bold text-roxo-dark transition-transform active:scale-95"
      >
        Quero me Inscrever &rarr;
      </a>
      <Link
        href="/acompanhar"
        className="mt-1.5 block text-center text-xs text-purple-200 transition-colors hover:text-white"
      >
        Verificar inscrição
      </Link>
    </motion.div>
  )
}
