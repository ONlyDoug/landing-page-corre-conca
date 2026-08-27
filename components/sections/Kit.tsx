'use client'

import { motion, type Variants } from 'framer-motion'
import { ClipboardList, Apple, Medal, Trophy, Shirt, type LucideIcon } from 'lucide-react'
import { KIT, KIT_NOTA } from '@/lib/constants'

const ICONES: Record<string, LucideIcon> = {
  ClipboardList,
  Apple,
  Medal,
  Trophy,
  Shirt,
}

const containerVariants: Variants = {
  hidden: {},
  show: {
    transition: {
      staggerChildren: 0.12,
    },
  },
}

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' } },
}

export default function Kit() {
  return (
    <section id="kit" className="bg-gray-50 py-20 px-6">
      <div className="mx-auto max-w-5xl">
        <h2 className="text-center text-3xl font-bold text-roxo-dark">Kit do Atleta</h2>

        <motion.div
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.1 }}
          variants={containerVariants}
          className="mt-12 grid grid-cols-2 gap-8 sm:grid-cols-3 md:grid-cols-5"
        >
          {KIT.map((item) => {
            const Icone = ICONES[item.icone] ?? ClipboardList
            return (
              <motion.div
                key={item.label}
                variants={itemVariants}
                className="flex flex-col items-center rounded-xl bg-branco p-6 text-center shadow-sm"
              >
                <Icone className="h-9 w-9 text-roxo" aria-hidden="true" strokeWidth={1.5} />
                <span className="mt-3 text-sm font-medium text-gray-700">{item.label}</span>
              </motion.div>
            )
          })}
        </motion.div>

        <p className="mt-10 text-center text-sm text-gray-500">{KIT_NOTA}</p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-16 rounded-2xl bg-white p-8 shadow-md border border-gray-100"
          role="region"
          aria-label="Retirada de Kits"
        >
          <h3 className="text-xl font-bold text-roxo-dark mb-6 text-center md:text-left">Informações da Retirada de Kits</h3>
          <div data-testid="info-section" className="flex flex-col md:flex-row gap-6 md:gap-12 justify-center md:justify-start">
            <div className="flex flex-col gap-2">
              <span className="text-sm font-semibold text-roxo uppercase tracking-wider">Datas</span>
              <p className="text-gray-700 font-medium">03 e 04/09</p>
            </div>
            <div className="flex flex-col gap-2">
              <span className="text-sm font-semibold text-roxo uppercase tracking-wider">Local</span>
              <p className="text-gray-700 font-medium">Rua Castro Alves (próximo à Prefeitura), Conceição da Feira, Bahia</p>
            </div>
            <div className="flex flex-col gap-2">
              <span className="text-sm font-semibold text-roxo uppercase tracking-wider">Requisito Obrigatório</span>
              <p className="text-gray-700 font-medium">2kg de alimento não perecível</p>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
