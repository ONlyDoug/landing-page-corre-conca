'use client'

import { motion, type Variants } from 'framer-motion'
import { Heart, Dumbbell, HeartPulse, HandHeart, type LucideIcon } from 'lucide-react'

type Pilar = {
  icon: LucideIcon
  titulo: string
  descricao: string
}

const PILARES: Pilar[] = [
  {
    icon: Dumbbell,
    titulo: 'Esporte',
    descricao: 'Incentivo à prática esportiva para todas as idades e níveis de condicionamento.',
  },
  {
    icon: HeartPulse,
    titulo: 'Saúde',
    descricao: 'Promoção de qualidade de vida e bem-estar físico e mental através da corrida.',
  },
  {
    icon: HandHeart,
    titulo: 'Solidariedade',
    descricao: 'Cada inscrição ajuda a arrecadar alimentos para famílias da comunidade.',
  },
]

const containerVariants: Variants = {
  hidden: {},
  show: {
    transition: {
      staggerChildren: 0.15,
    },
  },
}

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' } },
}

export default function Sobre() {
  return (
    <section id="sobre" className="bg-branco py-20 px-6">
      <div className="mx-auto max-w-4xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.1 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          className="flex flex-col items-center text-center"
        >
          <Heart className="h-16 w-16 text-roxo" aria-hidden="true" strokeWidth={1.5} />
          <p className="mt-6 max-w-2xl text-lg leading-relaxed text-gray-700">
            Unindo esporte, saúde e solidariedade. O Corre Conça nasceu para promover inclusão
            social e qualidade de vida através da corrida de rua, com o coração aberto para toda
            a comunidade.
          </p>
        </motion.div>

        <motion.div
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.1 }}
          variants={containerVariants}
          className="mt-14 grid grid-cols-1 gap-8 md:grid-cols-3"
        >
          {PILARES.map((pilar) => (
            <motion.div
              key={pilar.titulo}
              variants={itemVariants}
              className="flex flex-col items-center rounded-xl border border-gray-100 bg-branco p-8 text-center shadow-sm"
            >
              <pilar.icon className="h-10 w-10 text-roxo" aria-hidden="true" strokeWidth={1.5} />
              <h3 className="mt-4 text-xl font-semibold text-roxo-dark">{pilar.titulo}</h3>
              <p className="mt-2 text-sm leading-relaxed text-gray-600">{pilar.descricao}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}
