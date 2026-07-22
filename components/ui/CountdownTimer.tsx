"use client"

import { useEffect, useState } from "react"
import { AnimatePresence, motion } from "framer-motion"
import { getCountdownTarget } from "@/lib/utils"
import { useHydrated } from "@/lib/useHydrated"

type TimeLeft = {
  dias: number
  horas: number
  minutos: number
  segundos: number
}

const ZERO_TIME_LEFT: TimeLeft = { dias: 0, horas: 0, minutos: 0, segundos: 0 }

function calcularTempoRestante(target: Date, now: Date): TimeLeft {
  const diffMs = Math.max(0, target.getTime() - now.getTime())
  const totalSegundos = Math.floor(diffMs / 1000)

  const dias = Math.floor(totalSegundos / (60 * 60 * 24))
  const horas = Math.floor((totalSegundos % (60 * 60 * 24)) / (60 * 60))
  const minutos = Math.floor((totalSegundos % (60 * 60)) / 60)
  const segundos = totalSegundos % 60

  return { dias, horas, minutos, segundos }
}

type UnidadeCardProps = {
  valor: number
  rotulo: string
}

function UnidadeCard({ valor, rotulo }: UnidadeCardProps) {
  const valorFormatado = valor.toString().padStart(2, "0")

  return (
    <div className="flex flex-col items-center justify-center gap-1 rounded-lg border border-white/30 bg-white/10 px-3 py-3 backdrop-blur-sm sm:px-4 sm:py-4">
      <div className="relative h-8 w-full overflow-hidden text-center sm:h-10">
        <AnimatePresence mode="popLayout">
          <motion.span
            key={valorFormatado}
            initial={{ y: -12, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 12, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="absolute inset-0 block text-2xl font-extrabold text-white sm:text-3xl"
          >
            {valorFormatado}
          </motion.span>
        </AnimatePresence>
      </div>
      <span className="text-[10px] font-semibold uppercase tracking-wide text-white/80 sm:text-xs">
        {rotulo}
      </span>
    </div>
  )
}

export default function CountdownTimer() {
  const mounted = useHydrated()
  const [label, setLabel] = useState("")
  const [tempoRestante, setTempoRestante] = useState<TimeLeft>(ZERO_TIME_LEFT)

  useEffect(() => {
    if (!mounted) return

    const atualizar = () => {
      const now = new Date()
      const { target, label: novoLabel } = getCountdownTarget()
      setLabel(novoLabel)
      setTempoRestante(calcularTempoRestante(target, now))
    }

    atualizar()
    const intervalId = setInterval(atualizar, 1000)

    return () => clearInterval(intervalId)
  }, [mounted])

  if (!mounted) {
    return (
      <div className="flex flex-col items-center gap-3">
        <span className="text-sm font-semibold uppercase tracking-wide text-white/80">
          Carregando contagem...
        </span>
        <div className="grid grid-cols-4 gap-2 sm:gap-4">
          {["DIAS", "HORAS", "MINUTOS", "SEGUNDOS"].map((rotulo) => (
            <div
              key={rotulo}
              className="flex flex-col items-center justify-center gap-1 rounded-lg border border-white/30 bg-white/10 px-3 py-3 backdrop-blur-sm sm:px-4 sm:py-4"
            >
              <span className="text-2xl font-extrabold text-white sm:text-3xl">--</span>
              <span className="text-[10px] font-semibold uppercase tracking-wide text-white/80 sm:text-xs">
                {rotulo}
              </span>
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col items-center gap-3">
      <span className="text-sm font-semibold uppercase tracking-wide text-white/80">
        {label}
      </span>
      <div className="grid grid-cols-4 gap-2 sm:gap-4">
        <UnidadeCard valor={tempoRestante.dias} rotulo="Dias" />
        <UnidadeCard valor={tempoRestante.horas} rotulo="Horas" />
        <UnidadeCard valor={tempoRestante.minutos} rotulo="Minutos" />
        <UnidadeCard valor={tempoRestante.segundos} rotulo="Segundos" />
      </div>
    </div>
  )
}
