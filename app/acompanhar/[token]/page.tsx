"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import {
  ChevronLeft,
  Loader2,
  CheckCircle,
  Clock,
  XCircle,
  ExternalLink,
  MessageCircle,
} from "lucide-react"
import { LINK_INFINITEPAY, REDES_SOCIAIS, LOCALSTORAGE_QR_TOKEN_KEY } from "@/lib/constants"
import { modalidadeLabel, formatBRL } from "@/lib/utils"

type InscricaoAtleta = {
  nome: string
  modalidade: string
  lote: number
  valor_pago: number
  status_pagamento: "pendente" | "confirmado" | "cancelado"
  presenca_confirmada: boolean | null
  criado_em: string | null
  tamanho_camisa: string
  cidade: string
  checkout_url: string | null
}

type Estado = "carregando" | "ok" | "nao_encontrado" | "erro"

export default function AcompanharTokenPage() {
  const params = useParams<{ token: string }>()
  const router = useRouter()
  const [inscricao, setInscricao] = useState<InscricaoAtleta | null>(null)
  const [estado, setEstado] = useState<Estado>("carregando")

  useEffect(() => {
    let cancelado = false

    async function buscar() {
      try {
        const resposta = await fetch(`/api/atleta/${params.token}`)
        if (cancelado) return

        if (resposta.status === 404) {
          window.localStorage.removeItem(LOCALSTORAGE_QR_TOKEN_KEY)
          setEstado("nao_encontrado")
          return
        }
        if (!resposta.ok) {
          setEstado("erro")
          return
        }

        const { inscricao } = (await resposta.json()) as { inscricao: InscricaoAtleta }
        if (cancelado) return
        setInscricao(inscricao)
        setEstado("ok")
      } catch {
        if (!cancelado) setEstado("erro")
      }
    }

    buscar()
    return () => {
      cancelado = true
    }
  }, [params.token])

  if (estado === "carregando") {
    return (
      <main className="flex min-h-screen items-center justify-center bg-gray-50">
        <Loader2 className="h-8 w-8 animate-spin text-roxo" aria-hidden="true" />
      </main>
    )
  }

  if (estado === "nao_encontrado" || estado === "erro" || !inscricao) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center gap-4 bg-gray-50 px-4 text-center">
        <p className="text-gray-600">
          {estado === "nao_encontrado"
            ? "Não encontramos essa inscrição."
            : "Não foi possível carregar sua inscrição. Tente novamente."}
        </p>
        <a href="/acompanhar" className="font-medium text-roxo hover:underline">
          Voltar
        </a>
      </main>
    )
  }

  const linkPagamento = inscricao.checkout_url ?? LINK_INFINITEPAY

  return (
    <main className="min-h-screen bg-gray-50">
      <header className="flex items-center gap-3 bg-roxo px-4 py-4 text-white">
        <button type="button" onClick={() => router.back()} aria-label="Voltar">
          <ChevronLeft className="h-5 w-5" aria-hidden="true" />
        </button>
        <span className="font-semibold">Minha Inscrição</span>
        <span className="ml-auto text-sm text-purple-300">Corre Conça</span>
      </header>

      <div className="mx-auto flex max-w-lg flex-col gap-4 px-4 py-6 pb-8">
        {inscricao.status_pagamento === "confirmado" && (
          <div className="rounded-xl border border-green-200 bg-green-50 p-5 text-center">
            <CheckCircle className="mx-auto mb-2 h-10 w-10 text-green-500" aria-hidden="true" />
            <p className="text-lg font-bold text-green-800">Pagamento Confirmado!</p>
            <p className="mt-1 text-sm text-green-700">Sua vaga está garantida. Boa corrida!</p>
          </div>
        )}
        {inscricao.status_pagamento === "pendente" && (
          <div className="rounded-xl border border-yellow-200 bg-yellow-50 p-5 text-center">
            <Clock className="mx-auto mb-2 h-10 w-10 text-yellow-500" aria-hidden="true" />
            <p className="text-lg font-bold text-yellow-800">Pagamento Pendente</p>
            <p className="mt-1 text-sm text-yellow-700">
              Conclua o pagamento para garantir sua vaga.
            </p>
          </div>
        )}
        {inscricao.status_pagamento === "cancelado" && (
          <div className="rounded-xl border border-red-200 bg-red-50 p-5 text-center">
            <XCircle className="mx-auto mb-2 h-10 w-10 text-red-500" aria-hidden="true" />
            <p className="text-lg font-bold text-red-800">Inscrição Cancelada</p>
            <p className="mt-1 text-sm text-red-700">
              Entre em contato para mais informações.
            </p>
          </div>
        )}

        <div className="rounded-xl bg-white p-5 shadow-sm">
          <p className="mb-4 font-semibold text-gray-800">Dados da Inscrição</p>
          <dl className="divide-y divide-gray-100 text-sm">
            <div className="flex justify-between py-2.5">
              <dt className="text-gray-500">Nome</dt>
              <dd className="font-medium text-gray-800">{inscricao.nome}</dd>
            </div>
            <div className="flex justify-between py-2.5">
              <dt className="text-gray-500">Modalidade</dt>
              <dd className="font-medium text-gray-800">{modalidadeLabel(inscricao.modalidade)}</dd>
            </div>
            <div className="flex justify-between py-2.5">
              <dt className="text-gray-500">Camisa</dt>
              <dd className="font-medium text-gray-800">{inscricao.tamanho_camisa}</dd>
            </div>
            <div className="flex justify-between py-2.5">
              <dt className="text-gray-500">Lote</dt>
              <dd className="font-medium text-gray-800">Lote {inscricao.lote}</dd>
            </div>
            <div className="flex justify-between py-2.5">
              <dt className="text-gray-500">Valor</dt>
              <dd className="font-medium text-gray-800">{formatBRL(inscricao.valor_pago)}</dd>
            </div>
            <div className="flex justify-between py-2.5">
              <dt className="text-gray-500">Cidade</dt>
              <dd className="font-medium text-gray-800">{inscricao.cidade}</dd>
            </div>
            {inscricao.criado_em && (
              <div className="flex justify-between py-2.5">
                <dt className="text-gray-500">Data</dt>
                <dd className="font-medium text-gray-800">
                  {new Date(inscricao.criado_em).toLocaleDateString("pt-BR")}
                </dd>
              </div>
            )}
          </dl>
        </div>

        {inscricao.status_pagamento === "pendente" && (
          <div className="rounded-xl bg-white p-5 shadow-sm">
            <p className="mb-4 font-semibold text-gray-800">Efetuar Pagamento</p>
            <a
              href={linkPagamento}
              target="_blank"
              rel="noopener noreferrer"
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-roxo py-3 font-medium text-white transition-colors hover:bg-roxo-dark"
            >
              <ExternalLink className="h-4 w-4" aria-hidden="true" />
              Ir para o Checkout
            </a>
            <p className="mt-2 text-center text-xs text-gray-400">
              Aceita cartão de crédito e Pix
            </p>
            <div className="mt-4 rounded-lg border border-blue-200 bg-blue-50 p-4">
              <p className="mb-1 text-sm font-medium text-blue-800">Já efetuou o pagamento?</p>
              <p className="text-sm text-blue-700">
                A confirmação pode levar alguns minutos. Se após 10 minutos seu status não
                atualizar, entre em contato pelo WhatsApp.
              </p>
            </div>
          </div>
        )}

        <div className="rounded-xl bg-white p-5 shadow-sm">
          <p className="mb-3 font-semibold text-gray-800">Precisa de ajuda?</p>
          <a
            href={`${REDES_SOCIAIS.whatsapp}?text=${encodeURIComponent(
              `Olá! Me inscrevi no Corre Conça (${inscricao.nome}) e preciso de ajuda.`
            )}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-green-500 py-3 font-medium text-white transition-colors hover:bg-green-600"
          >
            <MessageCircle className="h-4 w-4" aria-hidden="true" />
            Falar com o organizador
          </a>
          <p className="mt-2 text-center text-xs text-gray-400">Atendimento pelo WhatsApp</p>
        </div>

        <div className="rounded-xl bg-white p-5 shadow-sm">
          {inscricao.presenca_confirmada ? (
            <div className="flex items-center gap-2 text-blue-700">
              <CheckCircle className="h-[18px] w-[18px]" aria-hidden="true" />
              <span>Presença confirmada no evento</span>
            </div>
          ) : (
            <p className="text-sm text-gray-500">
              Sua presença será confirmada no dia do evento.
            </p>
          )}
        </div>
      </div>
    </main>
  )
}
