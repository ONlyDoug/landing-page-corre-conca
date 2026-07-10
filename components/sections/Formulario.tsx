"use client"

import { useState } from "react"
import { useForm, Controller } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { motion } from "framer-motion"
import { useRouter } from "next/navigation"
import { Loader2, CheckCircle, AlertCircle } from "lucide-react"
import { inscricaoSchema, type InscricaoFormData } from "@/lib/validations"
import { maskCPF, maskTelefone, maskDataNascimento } from "@/lib/utils"
import { TAMANHOS_CAMISA, MODALIDADES, LOCALSTORAGE_QR_TOKEN_KEY } from "@/lib/constants"
import SuccessModal from "@/components/ui/SuccessModal"

type InscricaoResponse = {
  success: boolean
  qrCodeToken?: string
  checkoutUrl?: string
  jaInscrito?: boolean
  statusPagamento?: string
}

const CAMPO_BASE =
  "w-full rounded-lg border-2 bg-white px-4 py-3 text-base text-roxo-dark placeholder:text-gray-400 transition-colors focus:outline-none focus:ring-2 focus:ring-roxo/30"

const mensagensErro: Record<keyof InscricaoFormData, string> = {
  nome: "Digite seu nome completo (mínimo 2 palavras)",
  cpf: "CPF inválido. Verifique os números e tente novamente",
  cidade: "Digite o nome da sua cidade",
  dataNascimento: "Data inválida. Use o formato DD/MM/AAAA",
  telefone: "Telefone inválido. Digite com DDD (ex: 75 99999-9999)",
  tamanhoCamisa: "Selecione o tamanho da camiseta",
  modalidade: "Selecione a modalidade que deseja participar",
}

function bordaCampo(temErro: boolean, tocadoValido: boolean): string {
  if (temErro) return "border-red-400 focus:ring-red-400 bg-red-50"
  if (tocadoValido) return "border-green-400 focus:ring-green-400"
  return "border-gray-200 focus:border-roxo"
}

export default function Formulario() {
  const router = useRouter()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [submitError, setSubmitError] = useState(false)
  const [checkoutUrl, setCheckoutUrl] = useState<string | null>(null)
  const [qrCodeToken, setQrCodeToken] = useState<string | null>(null)

  const {
    register,
    control,
    handleSubmit,
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

      if (!response.ok || !result.success || !result.qrCodeToken || !result.checkoutUrl) {
        setSubmitError(true)
        return
      }

      window.localStorage.setItem(LOCALSTORAGE_QR_TOKEN_KEY, result.qrCodeToken)
      setCheckoutUrl(result.checkoutUrl)
      setQrCodeToken(result.qrCodeToken)
      setIsModalOpen(true)
    } catch {
      setSubmitError(true)
    }
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

        <form
          onSubmit={handleSubmit(onSubmit)}
          noValidate
          className="grid grid-cols-1 gap-5 md:grid-cols-2"
        >
          {/* Nome */}
          <div className="flex flex-col gap-1 md:col-span-2">
            <label
              htmlFor="nome"
              className={`text-sm font-semibold ${errors.nome ? "text-red-600" : "text-roxo-dark"}`}
            >
              Nome completo
            </label>
            <div className="relative">
              <input
                id="nome"
                type="text"
                placeholder="Seu nome completo"
                className={`${CAMPO_BASE} ${bordaCampo(!!errors.nome, !!touchedFields.nome && !errors.nome)} pr-10`}
                aria-invalid={!!errors.nome}
                aria-describedby={errors.nome ? "nome-erro" : undefined}
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
              <span id="nome-erro" className="flex items-center gap-1 text-sm text-red-600">
                <AlertCircle size={12} aria-hidden="true" />
                {mensagensErro.nome}
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
                    aria-describedby={errors.cpf ? "cpf-erro" : undefined}
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
              <span id="cpf-erro" className="flex items-center gap-1 text-sm text-red-600">
                <AlertCircle size={12} aria-hidden="true" />
                {mensagensErro.cpf}
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
                    aria-describedby={errors.dataNascimento ? "dataNascimento-erro" : undefined}
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
              <span id="dataNascimento-erro" className="flex items-center gap-1 text-sm text-red-600">
                <AlertCircle size={12} aria-hidden="true" />
                {mensagensErro.dataNascimento}
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
                aria-describedby={errors.cidade ? "cidade-erro" : undefined}
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
              <span id="cidade-erro" className="flex items-center gap-1 text-sm text-red-600">
                <AlertCircle size={12} aria-hidden="true" />
                {mensagensErro.cidade}
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
                    aria-describedby={errors.telefone ? "telefone-erro" : undefined}
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
              <span id="telefone-erro" className="flex items-center gap-1 text-sm text-red-600">
                <AlertCircle size={12} aria-hidden="true" />
                {mensagensErro.telefone}
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
              aria-describedby={errors.tamanhoCamisa ? "tamanhoCamisa-erro" : undefined}
              {...register("tamanhoCamisa")}
            >
              {TAMANHOS_CAMISA.map((tamanho) => (
                <option key={tamanho} value={tamanho}>
                  {tamanho}
                </option>
              ))}
            </select>
            {errors.tamanhoCamisa && (
              <span id="tamanhoCamisa-erro" className="flex items-center gap-1 text-sm text-red-600">
                <AlertCircle size={12} aria-hidden="true" />
                {mensagensErro.tamanhoCamisa}
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
              aria-describedby={errors.modalidade ? "modalidade-erro" : undefined}
              {...register("modalidade")}
            >
              {MODALIDADES.map((modalidade) => (
                <option key={modalidade.slug} value={modalidade.slug}>
                  {modalidade.nome} {modalidade.distancia}
                </option>
              ))}
            </select>
            {errors.modalidade && (
              <span id="modalidade-erro" className="flex items-center gap-1 text-sm text-red-600">
                <AlertCircle size={12} aria-hidden="true" />
                {mensagensErro.modalidade}
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
