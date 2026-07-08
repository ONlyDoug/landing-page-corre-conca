"use client"

import Image from "next/image"
import Link from "next/link"
import { motion } from "framer-motion"
import { Search } from "lucide-react"
import { EVENTO, MODALIDADES, LOGO_PATH, type Modalidade } from "@/lib/constants"
import CountdownTimer from "@/components/ui/CountdownTimer"

const EMOJI_POR_MODALIDADE: Record<Modalidade["slug"], string> = {
  caminhada_3km: "🚶",
  corrida_6km: "🏃",
}

function formatarDataEvento(dataIso: string): string {
  const data = new Date(dataIso)
  const formatado = new Intl.DateTimeFormat("pt-BR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(data)

  // Intl retorna "16 de agosto de 2026" — capitaliza o mês para "Agosto"
  return formatado.replace(/ de (\p{L})/u, (_match, letra: string) => ` de ${letra.toUpperCase()}`)
}

function DotPatternBackground() {
  return (
    <svg
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 h-full w-full opacity-10"
    >
      <defs>
        <pattern
          id="hero-dot-pattern"
          x="0"
          y="0"
          width="24"
          height="24"
          patternUnits="userSpaceOnUse"
        >
          <circle cx="2" cy="2" r="1.5" fill="white" />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#hero-dot-pattern)" />
    </svg>
  )
}

export default function Hero() {
  const dataFormatada = formatarDataEvento(EVENTO.dataEvento)

  return (
    <section
      id="inicio"
      className="relative overflow-hidden bg-gradient-to-b from-roxo-dark to-roxo px-4 py-20 md:py-32"
    >
      <DotPatternBackground />

      <div className="relative z-10 mx-auto flex max-w-3xl flex-col items-center gap-6 text-center">
        <Image
          src={LOGO_PATH}
          alt={EVENTO.nome}
          width={240}
          height={175}
          priority
          className="h-auto w-[180px] md:w-[240px]"
        />

        <div className="flex flex-col gap-2">
          <h1 className="text-5xl font-extrabold text-white md:text-7xl">
            Corre Conça
          </h1>
          <p className="text-xl font-medium text-white/90 md:text-2xl">
            Corrida Solidária
          </p>
        </div>

        <p className="text-base font-semibold text-white/90 md:text-lg">
          {dataFormatada} &bull; {EVENTO.local}
        </p>

        <div className="flex flex-wrap items-center justify-center gap-3">
          {MODALIDADES.map((modalidade) => (
            <span
              key={modalidade.slug}
              className="flex items-center gap-2 rounded-full border border-white/30 bg-white/10 px-4 py-2 text-sm font-semibold text-white backdrop-blur-sm"
            >
              <span aria-hidden="true">{EMOJI_POR_MODALIDADE[modalidade.slug]}</span>
              {modalidade.nome} {modalidade.distancia}
            </span>
          ))}
        </div>

        <motion.a
          href="#formulario"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.98 }}
          className="mt-2 rounded-full bg-white px-8 py-4 text-lg font-bold text-roxo-dark shadow-xl transition-shadow hover:shadow-2xl"
        >
          Quero me Inscrever &rarr;
        </motion.a>

        <Link
          href="/acompanhar"
          className="flex items-center justify-center gap-1 text-sm text-white/80 underline transition-colors hover:text-white"
        >
          <Search size={14} aria-hidden="true" />
          Já me inscrevi — verificar inscrição
        </Link>

        <div className="mt-4">
          <CountdownTimer />
        </div>
      </div>
    </section>
  )
}
