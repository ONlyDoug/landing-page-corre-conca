"use client"

import { useState } from "react"
import AccordionItem from "@/components/ui/AccordionItem"
import { REGULAMENTO_ITEMS } from "@/lib/constants"

export default function Regulamento() {
  const [openIndex, setOpenIndex] = useState<number | null>(null)

  const handleToggle = (index: number) => {
    setOpenIndex((current) => (current === index ? null : index))
  }

  return (
    <section id="regulamento" className="bg-gray-50 px-4 py-16 sm:py-24">
      <div className="mx-auto max-w-3xl">
        <h2 className="text-center text-3xl font-bold text-roxo-dark sm:text-4xl">
          Regulamento
        </h2>
        <div className="mt-10">
          {REGULAMENTO_ITEMS.map((item, index) => (
            <AccordionItem
              key={item.titulo}
              titulo={item.titulo}
              isOpen={openIndex === index}
              onToggle={() => handleToggle(index)}
            >
              {item.texto}
            </AccordionItem>
          ))}
        </div>
      </div>
    </section>
  )
}
