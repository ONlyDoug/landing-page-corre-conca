"use client"

import { useState } from "react"
import AccordionItem from "@/components/ui/AccordionItem"
import { FAQ_ITEMS } from "@/lib/constants"

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(null)

  const handleToggle = (index: number) => {
    setOpenIndex((current) => (current === index ? null : index))
  }

  return (
    <section id="faq" className="bg-white px-4 py-16 sm:py-24">
      <div className="mx-auto max-w-3xl">
        <h2 className="text-center text-3xl font-bold text-roxo-dark sm:text-4xl">
          Perguntas Frequentes
        </h2>
        <div className="mt-10">
          {FAQ_ITEMS.map((item, index) => (
            <AccordionItem
              key={item.pergunta}
              titulo={item.pergunta}
              isOpen={openIndex === index}
              onToggle={() => handleToggle(index)}
            >
              {item.resposta}
            </AccordionItem>
          ))}
        </div>
      </div>
    </section>
  )
}
