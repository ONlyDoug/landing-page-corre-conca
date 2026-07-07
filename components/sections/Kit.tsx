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
      </div>
    </section>
  )
}
