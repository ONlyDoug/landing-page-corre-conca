"use client"

import { useState } from "react"
import { useForm, Controller, type FieldErrors } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { motion } from "framer-motion"
import { useRouter } from "next/navigation"
import { Loader2, CheckCircle, AlertCircle, Clock } from "lucide-react"
import { inscricaoSchema, type InscricaoFormData } from "@/lib/validations"
import { maskCPF, maskTelefone, maskDataNascimento } from "@/lib/utils"
import {
  TAMANHOS_CAMISA,
  MODALIDADES,
  LOCALSTORAGE_QR_TOKEN_KEY,
  PRAZO_ENCERRAMENTO_INSCRICOES,
} from "@/lib/constants"
import SuccessModal from "@/components/ui/SuccessModal"

type InscricaoResponse = {
  success: boolean
  qrCodeToken?: string
  checkoutUrl?: string
  jaInscrito?: boolean
  jaConfirmado?: boolean
  statusPagamento?: string
}

const CAMPO_BASE =
  "w-full rounded-lg border-2 bg-white px-4 py-3 text-base text-roxo-dark placeholder:text-gray-400 transition-colors focus:outline-none focus:ring-2 focus:ring-roxo/30"

const TEXTOS_AJUDA: Partial<Record<keyof InscricaoFormData, string>> = {
  nome: "Nome e sobrenome, como no documento",
  cpf: "Formato: 000.000.000-00",
  dataNascimento: "Formato: DD/MM/AAAA",
  telefone: "Formato: (00) 00000-0000, com DDD",
}

const CAMPOS_EM_ORDEM: (keyof InscricaoFormData)[] = [
  "nome",
  "cpf",
  "dataNascimento",
  "cidade",
  "telefone",
  "tamanhoCamisa",
  "modalidade",
]

function idsDescricao(idAjuda: string | undefined, temErro: boolean, idErro: string): string | undefined {
  return [idAjuda, temErro ? idErro : undefined].filter(Boolean).join(" ") || undefined
}

function bordaCampo(temErro: boolean, tocadoValido: boolean): string {
  if (temErro) return "border-red-400 bg-red-50 ring-1 ring-red-200 focus:ring-red-400"
  if (tocadoValido) return "border-green-400 bg-white ring-1 ring-green-100 focus:ring-green-400"
  return "border-gray-200 bg-white focus:border-roxo"
}

export default function Formulario() {
  const router = useRouter()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [submitError, setSubmitError] = useState(false)
  const [checkoutUrl, setCheckoutUrl] = useState<string | null>(null)
  const [qrCodeToken, setQrCodeToken] = useState<string | null>(null)

  const inscricoesEncerradas = new Date() > new Date(PRAZO_ENCERRAMENTO_INSCRICOES)
  const diasRestantes = Math.ceil(
    (new Date(PRAZO_ENCERRAMENTO_INSCRICOES).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
  )
  const avisoUrgente = !inscricoesEncerradas && diasRestantes <= 5 && diasRestantes > 0

  const {
    register,
    control,
    handleSubmit,
    setFocus,
    formState: { errors, touchedFields, isSubmitting },
  } = useForm<InscricaoFormData>({
    resolver: zodResolver(inscricaoSchema),
    mode: "onBlur",
    defaultValues: {
      nome: "",
      cpf: "",
      cidade: "",
      dataNascimento: "",
      telefone: "",
      tamanhoCamisa: "M",
      modalidade: "corrida_6km",
    },
  })

  async function onSubmit(data: InscricaoFormData) {
    setSubmitError(false)
    try {
      const response = await fetch("/api/inscricao", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })
      const result = (await response.json()) as InscricaoResponse

      if (response.status === 409 && result.jaInscrito && result.qrCodeToken) {
        window.localStorage.setItem(LOCALSTORAGE_QR_TOKEN_KEY, result.qrCodeToken)
        router.push(`/acompanhar/${result.qrCodeToken}`)
        return
      }

      if (result.success && result.jaConfirmado && result.qrCodeToken) {
        window.localStorage.setItem(LOCALSTORAGE_QR_TOKEN_KEY, result.qrCodeToken)
        router.push(`/acompanhar/${result.qrCodeToken}`)
        return
      }

      if (!response.ok || !result.success || !result.qrCodeToken || !result.checkoutUrl) {
        setSubmitError(true)
        return
      }

      window.localStorage.setItem(LOCALSTORAGE_QR_TOKEN_KEY, result.qrCodeToken)
      setCheckoutUrl(result.checkoutUrl)
      setQrCodeToken(result.qrCodeToken)
      window.location.assign(result.checkoutUrl)
    } catch {
      setSubmitError(true)
    }
  }

  function onError(erros: FieldErrors<InscricaoFormData>) {
    const primeiroCampo = CAMPOS_EM_ORDEM.find((campo) => erros[campo])
    if (!primeiroCampo) return
    document.getElementById(primeiroCampo)?.scrollIntoView({ behavior: "smooth", block: "center" })
    setFocus(primeiroCampo)
  }

  return (
    <section id="formulario" className="bg-gray-50 px-4 py-20">
      <div className="mx-auto max-w-3xl rounded-2xl bg-white p-6 shadow-xl md:p-10">
        <div className="mb-8 text-center">
          <h2 className="text-3xl font-extrabold text-roxo-dark md:text-4xl">
            Faça sua Inscrição
          </h2>
          <p className="mt-2 text-base text-gray-600">
            Preencha os dados abaixo para garantir sua vaga
          </p>
        </div>

        {inscricoesEncerradas ? (
          <div className="bg-white rounded-2xl p-8 text-center">
            <Clock className="text-gray-400 mx-auto mb-3" size={48} aria-hidden="true" />
            <h3 className="text-xl font-bold text-gray-800 mb-2">Inscrições Encerradas</h3>
            <p className="text-gray-500 text-sm">
              O prazo de inscrições para o Corre Conça foi encerrado em 24 de agosto.
              Acompanhe nosso Instagram para novidades sobre o evento.
            </p>
          </div>
        ) : (
        <form
          onSubmit={handleSubmit(onSubmit, onError)}
          noValidate
          className="grid grid-cols-1 gap-5 md:grid-cols-2"
        >
          {avisoUrgente && (
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 mb-4 text-center md:col-span-2">
              <p className="text-amber-800 text-sm font-medium">
                ⏰ Últimos dias! Inscrições encerram em {diasRestantes} dia{diasRestantes > 1 ? "s" : ""}
              </p>
            </div>
          )}

          {/* Nome */}
          <div className="flex flex-col gap-1 md:col-span-2">
            <label
              htmlFor="nome"
              className={`text-sm font-semibold ${errors.nome ? "text-red-600" : "text-roxo-dark"}`}
            >
              Nome completo
            </label>
            <span id="nome-ajuda" className="text-sm text-gray-500">
              {TEXTOS_AJUDA.nome}
            </span>
            <div className="relative">
              <input
                id="nome"
                type="text"
                placeholder="Seu nome completo"
                className={`${CAMPO_BASE} ${bordaCampo(!!errors.nome, !!touchedFields.nome && !errors.nome)} pr-10`}
                aria-invalid={!!errors.nome}
                aria-describedby={idsDescricao("nome-ajuda", !!errors.nome, "nome-erro")}
                {...register("nome")}
              />
              {!!touchedFields.nome && !errors.nome && (
                <CheckCircle
                  size={18}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-green-500"
                  aria-hidden="true"
                />
              )}
            </div>
            {errors.nome && (
              <span id="nome-erro" role="alert" className="flex items-center gap-1 text-sm text-red-600">
                <AlertCircle size={12} aria-hidden="true" />
                {errors.nome.message}
              </span>
            )}
          </div>

          {/* CPF */}
          <div className="flex flex-col gap-1">
            <label
              htmlFor="cpf"
              className={`text-sm font-semibold ${errors.cpf ? "text-red-600" : "text-roxo-dark"}`}
            >
              CPF
            </label>
            <span id="cpf-ajuda" className="text-sm text-gray-500">
              {TEXTOS_AJUDA.cpf}
            </span>
            <div className="relative">
              <Controller
                name="cpf"
                control={control}
                render={({ field }) => (
                  <input
                    id="cpf"
                    type="text"
                    inputMode="numeric"
                    placeholder="000.000.000-00"
                    className={`${CAMPO_BASE} ${bordaCampo(!!errors.cpf, !!touchedFields.cpf && !errors.cpf)} pr-10`}
                    aria-invalid={!!errors.cpf}
                    aria-describedby={idsDescricao("cpf-ajuda", !!errors.cpf, "cpf-erro")}
                    name={field.name}
                    value={field.value}
                    onBlur={field.onBlur}
                    ref={field.ref}
                    onChange={(e) => field.onChange(maskCPF(e.target.value))}
                  />
                )}
              />
              {!!touchedFields.cpf && !errors.cpf && (
                <CheckCircle
                  size={18}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-green-500"
                  aria-hidden="true"
                />
              )}
            </div>
            {errors.cpf && (
              <span id="cpf-erro" role="alert" className="flex items-center gap-1 text-sm text-red-600">
                <AlertCircle size={12} aria-hidden="true" />
                {errors.cpf.message}
              </span>
            )}
          </div>

          {/* Data de nascimento */}
          <div className="flex flex-col gap-1">
            <label
              htmlFor="dataNascimento"
              className={`text-sm font-semibold ${errors.dataNascimento ? "text-red-600" : "text-roxo-dark"}`}
            >
              Data de nascimento
            </label>
            <span id="dataNascimento-ajuda" className="text-sm text-gray-500">
              {TEXTOS_AJUDA.dataNascimento}
            </span>
            <div className="relative">
              <Controller
                name="dataNascimento"
                control={control}
                render={({ field }) => (
                  <input
                    id="dataNascimento"
                    type="text"
                    inputMode="numeric"
                    placeholder="00/00/0000"
                    className={`${CAMPO_BASE} ${bordaCampo(!!errors.dataNascimento, !!touchedFields.dataNascimento && !errors.dataNascimento)} pr-10`}
                    aria-invalid={!!errors.dataNascimento}
                    aria-describedby={idsDescricao("dataNascimento-ajuda", !!errors.dataNascimento, "dataNascimento-erro")}
                    name={field.name}
                    value={field.value}
                    onBlur={field.onBlur}
                    ref={field.ref}
                    onChange={(e) => field.onChange(maskDataNascimento(e.target.value))}
                  />
                )}
              />
              {!!touchedFields.dataNascimento && !errors.dataNascimento && (
                <CheckCircle
                  size={18}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-green-500"
                  aria-hidden="true"
                />
              )}
            </div>
            {errors.dataNascimento && (
              <span id="dataNascimento-erro" role="alert" className="flex items-center gap-1 text-sm text-red-600">
                <AlertCircle size={12} aria-hidden="true" />
                {errors.dataNascimento.message}
              </span>
            )}
          </div>

          {/* Cidade */}
          <div className="flex flex-col gap-1">
            <label
              htmlFor="cidade"
              className={`text-sm font-semibold ${errors.cidade ? "text-red-600" : "text-roxo-dark"}`}
            >
              Cidade
            </label>
            <div className="relative">
              <input
                id="cidade"
                type="text"
                placeholder="Sua cidade"
                className={`${CAMPO_BASE} ${bordaCampo(!!errors.cidade, !!touchedFields.cidade && !errors.cidade)} pr-10`}
                aria-invalid={!!errors.cidade}
                aria-describedby={idsDescricao(undefined, !!errors.cidade, "cidade-erro")}
                {...register("cidade")}
              />
              {!!touchedFields.cidade && !errors.cidade && (
                <CheckCircle
                  size={18}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-green-500"
                  aria-hidden="true"
                />
              )}
            </div>
            {errors.cidade && (
              <span id="cidade-erro" role="alert" className="flex items-center gap-1 text-sm text-red-600">
                <AlertCircle size={12} aria-hidden="true" />
                {errors.cidade.message}
              </span>
            )}
          </div>

          {/* Telefone */}
          <div className="flex flex-col gap-1">
            <label
              htmlFor="telefone"
              className={`text-sm font-semibold ${errors.telefone ? "text-red-600" : "text-roxo-dark"}`}
            >
              Telefone
            </label>
            <span id="telefone-ajuda" className="text-sm text-gray-500">
              {TEXTOS_AJUDA.telefone}
            </span>
            <div className="relative">
              <Controller
                name="telefone"
                control={control}
                render={({ field }) => (
                  <input
                    id="telefone"
                    type="text"
                    inputMode="numeric"
                    placeholder="(00) 00000-0000"
                    className={`${CAMPO_BASE} ${bordaCampo(!!errors.telefone, !!touchedFields.telefone && !errors.telefone)} pr-10`}
                    aria-invalid={!!errors.telefone}
                    aria-describedby={idsDescricao("telefone-ajuda", !!errors.telefone, "telefone-erro")}
                    name={field.name}
                    value={field.value}
                    onBlur={field.onBlur}
                    ref={field.ref}
                    onChange={(e) => field.onChange(maskTelefone(e.target.value))}
                  />
                )}
              />
              {!!touchedFields.telefone && !errors.telefone && (
                <CheckCircle
                  size={18}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-green-500"
                  aria-hidden="true"
                />
              )}
            </div>
            {errors.telefone && (
              <span id="telefone-erro" role="alert" className="flex items-center gap-1 text-sm text-red-600">
                <AlertCircle size={12} aria-hidden="true" />
                {errors.telefone.message}
              </span>
            )}
          </div>

          {/* Tamanho da camisa */}
          <div className="flex flex-col gap-1">
            <label
              htmlFor="tamanhoCamisa"
              className={`text-sm font-semibold ${errors.tamanhoCamisa ? "text-red-600" : "text-roxo-dark"}`}
            >
              Tamanho da camisa
            </label>
            <select
              id="tamanhoCamisa"
              className={`${CAMPO_BASE} ${bordaCampo(!!errors.tamanhoCamisa, !!touchedFields.tamanhoCamisa && !errors.tamanhoCamisa)}`}
              aria-invalid={!!errors.tamanhoCamisa}
              aria-describedby={idsDescricao(undefined, !!errors.tamanhoCamisa, "tamanhoCamisa-erro")}
              {...register("tamanhoCamisa")}
            >
              {TAMANHOS_CAMISA.map((tamanho) => (
                <option key={tamanho} value={tamanho}>
                  {tamanho}
                </option>
              ))}
            </select>
            {errors.tamanhoCamisa && (
              <span id="tamanhoCamisa-erro" role="alert" className="flex items-center gap-1 text-sm text-red-600">
                <AlertCircle size={12} aria-hidden="true" />
                {errors.tamanhoCamisa.message}
              </span>
            )}
          </div>

          {/* Modalidade */}
          <div className="flex flex-col gap-1">
            <label
              htmlFor="modalidade"
              className={`text-sm font-semibold ${errors.modalidade ? "text-red-600" : "text-roxo-dark"}`}
            >
              Modalidade
            </label>
            <select
              id="modalidade"
              className={`${CAMPO_BASE} ${bordaCampo(!!errors.modalidade, !!touchedFields.modalidade && !errors.modalidade)}`}
              aria-invalid={!!errors.modalidade}
              aria-describedby={idsDescricao(undefined, !!errors.modalidade, "modalidade-erro")}
              {...register("modalidade")}
            >
              {MODALIDADES.map((modalidade) => (
                <option key={modalidade.slug} value={modalidade.slug}>
                  {modalidade.nome} {modalidade.distancia}
                </option>
              ))}
            </select>
            {errors.modalidade && (
              <span id="modalidade-erro" role="alert" className="flex items-center gap-1 text-sm text-red-600">
                <AlertCircle size={12} aria-hidden="true" />
                {errors.modalidade.message}
              </span>
            )}
          </div>

          {submitError && (
            <div className="flex items-start gap-3 rounded-lg border border-red-200 bg-red-50 p-4 md:col-span-2">
              <AlertCircle className="flex-shrink-0 text-red-500" size={20} aria-hidden="true" />
              <span className="text-sm text-red-700">
                Não foi possível enviar sua inscrição, tente novamente.
              </span>
            </div>
          )}

          <div className="md:col-span-2">
            <motion.button
              type="submit"
              disabled={isSubmitting}
              whileHover={!isSubmitting ? { scale: 1.02 } : undefined}
              whileTap={!isSubmitting ? { scale: 0.98 } : undefined}
              className={`flex min-h-[52px] w-full items-center justify-center gap-2 rounded-full px-8 py-4 text-lg font-bold text-white shadow-xl transition-all hover:shadow-2xl disabled:cursor-not-allowed ${
                isSubmitting
                  ? "bg-roxo opacity-75"
                  : submitError
                    ? "bg-red-600 hover:bg-red-700"
                    : "bg-roxo"
              }`}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" aria-hidden="true" />
                  Processando inscrição...
                </>
              ) : submitError ? (
                <>Tentar novamente</>
              ) : (
                <>Garantir minha vaga &rarr;</>
              )}
            </motion.button>
          </div>
        </form>
        )}
      </div>

      {checkoutUrl && qrCodeToken && (
        <SuccessModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          checkoutUrl={checkoutUrl}
          qrCodeToken={qrCodeToken}
        />
      )}
    </section>
  )
}
