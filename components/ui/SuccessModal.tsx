"use client"

import { AnimatePresence, motion } from "framer-motion"
import { CheckCircle2, X } from "lucide-react"

type SuccessModalProps = {
  isOpen: boolean
  onClose: () => void
  checkoutUrl: string
  qrCodeToken: string
}

export default function SuccessModal({ isOpen, onClose, checkoutUrl, qrCodeToken }: SuccessModalProps) {
  function handlePagamento() {
    window.open(checkoutUrl, "_blank", "noopener,noreferrer")
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-roxo-dark/80 px-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="success-modal-title"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            className="relative w-full max-w-md rounded-2xl bg-white p-8 text-center shadow-2xl"
          >
            <button
              type="button"
              onClick={onClose}
              aria-label="Fechar"
              className="absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-full text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
            >
              <X className="h-5 w-5" aria-hidden="true" />
            </button>

            <motion.div
              initial={{ scale: 0, rotate: -45 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ duration: 0.4, delay: 0.1, ease: "easeOut" }}
              className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100"
            >
              <CheckCircle2 className="h-10 w-10 text-green-600" aria-hidden="true" />
            </motion.div>

            <h2 id="success-modal-title" className="text-xl font-bold text-roxo-dark">
              Inscrição recebida!
            </h2>
            <p className="mt-2 text-base text-gray-600">
              ✅ Dados recebidos! Agora complete sua inscrição realizando o pagamento:
            </p>

            <button
              type="button"
              onClick={handlePagamento}
              className="mt-6 flex min-h-[44px] w-full items-center justify-center rounded-full bg-roxo px-6 py-4 text-lg font-bold text-white shadow-xl transition-shadow hover:bg-roxo-dark hover:shadow-2xl"
            >
              Ir para o Pagamento &rarr;
            </button>

            <a
              href={`/acompanhar/${qrCodeToken}`}
              className="mt-2 block w-full rounded-lg border border-roxo/30 py-2.5 text-center text-sm font-medium text-roxo transition-colors hover:bg-roxo/5"
            >
              Acompanhar minha inscrição
            </a>

            <p className="mt-2 text-xs text-gray-400">
              Guarde o link de acompanhamento para consultar sua inscrição a qualquer momento.
            </p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
