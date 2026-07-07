"use client"

import { ReactNode } from "react"
import { AnimatePresence, motion } from "framer-motion"
import { ChevronDown } from "lucide-react"

type AccordionItemProps = {
  titulo: string
  children: ReactNode
  isOpen: boolean
  onToggle: () => void
}

export default function AccordionItem({ titulo, children, isOpen, onToggle }: AccordionItemProps) {
  return (
    <div className="border-b border-gray-200">
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={isOpen}
        className="flex min-h-[44px] w-full items-center justify-between gap-4 py-4 text-left"
      >
        <span className="font-semibold text-roxo-dark">{titulo}</span>
        <motion.span
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.2 }}
          className="flex-shrink-0"
        >
          <ChevronDown className="h-5 w-5 text-roxo" aria-hidden="true" />
        </motion.span>
      </button>
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <div className="pb-4 pr-8 text-gray-600">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
