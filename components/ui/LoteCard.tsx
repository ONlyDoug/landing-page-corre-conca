'use client'

import { useEffect, useState } from 'react'
import type { LoteInfo } from '@/lib/constants'
import { getLoteStatus, type LoteStatus } from '@/lib/utils'

type LoteCardProps = {
  lote: LoteInfo
}

const ATUALIZACAO_INTERVALO_MS = 60_000

function formatarValor(valor: number): string {
  return valor.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  })
}

export function LoteCard({ lote }: LoteCardProps) {
  const [status, setStatus] = useState<LoteStatus | null>(null)

  useEffect(() => {
    const atualizarStatus = () => setStatus(getLoteStatus(lote.numero, new Date()))

    atualizarStatus()
    const intervalId = setInterval(atualizarStatus, ATUALIZACAO_INTERVALO_MS)

    return () => clearInterval(intervalId)
  }, [lote.numero])

  const encerrado = status === 'encerrado'
  const ativo = status === 'ativo'
  const emBreve = status === 'em_breve'

  return (
    <div
      className={`flex flex-col gap-4 rounded-2xl border border-white/10 bg-white/5 p-6 shadow-lg transition-opacity ${
        emBreve ? 'opacity-60' : 'opacity-100'
      }`}
    >
      <div className="flex items-center justify-between gap-2">
        <h3 className="text-xl font-bold">Lote {lote.numero}</h3>
        {status === null ? null : ativo ? (
          <span className="rounded-full bg-yellow-400 px-3 py-1 text-xs font-bold uppercase tracking-wide text-roxo-dark">
            Lote Atual
          </span>
        ) : emBreve ? (
          <span className="rounded-full bg-white/20 px-3 py-1 text-xs font-bold uppercase tracking-wide text-white">
            Em Breve
          </span>
        ) : (
          <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-bold uppercase tracking-wide text-white/70">
            Encerrado
          </span>
        )}
      </div>

      <p className="text-3xl font-extrabold">{formatarValor(lote.valor)}</p>
      <p className="text-sm text-white/80">{lote.condicao}</p>

      <a
        href="#formulario"
        aria-disabled={encerrado}
        tabIndex={encerrado ? -1 : undefined}
        onClick={(event) => {
          if (encerrado) event.preventDefault()
        }}
        className={`mt-2 inline-flex items-center justify-center gap-2 rounded-full px-6 py-3 text-sm font-bold uppercase tracking-wide transition-colors ${
          encerrado
            ? 'pointer-events-none cursor-not-allowed bg-white/10 text-white/40 opacity-50'
            : 'bg-yellow-400 text-roxo-dark hover:bg-yellow-300'
        }`}
      >
        Inscrever no Lote {lote.numero} →
      </a>
    </div>
  )
}
