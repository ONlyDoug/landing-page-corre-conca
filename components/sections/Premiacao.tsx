'use client'

import { motion } from 'framer-motion'
import { Medal, Trophy } from 'lucide-react'
import { PREMIACAO } from '@/lib/constants'

export default function Premiacao() {
  return (
    <section id="premiacao" className="bg-roxo py-20 px-6 text-branco">
      <div className="mx-auto max-w-4xl">
        <h2 className="text-center text-3xl font-bold">Premiação</h2>

        <div className="mt-12 grid grid-cols-1 gap-8 md:grid-cols-2">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.1 }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
            className="flex flex-col items-center rounded-xl border border-branco/20 bg-branco/10 p-8 text-center"
          >
            <Medal className="h-12 w-12" aria-hidden="true" strokeWidth={1.5} />
            <p className="mt-4 leading-relaxed">{PREMIACAO.todosConcluintes}</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.1 }}
            transition={{ duration: 0.5, ease: 'easeOut', delay: 0.15 }}
            className="relative flex flex-col items-center rounded-xl border-2 border-yellow-300 bg-branco/10 p-8 text-center"
          >
            <span className="absolute -top-3 rounded-full bg-yellow-300 px-3 py-1 text-xs font-bold uppercase tracking-wide text-roxo-dark">
              Somente modalidade 6KM
            </span>
            <Trophy className="mt-2 h-12 w-12" aria-hidden="true" strokeWidth={1.5} />
            <p className="mt-4 leading-relaxed">{PREMIACAO.podio6km}</p>
          </motion.div>
        </div>

        <p className="mt-8 text-center text-sm text-branco/70">{PREMIACAO.podio3km}</p>
      </div>
    </section>
  )
}
