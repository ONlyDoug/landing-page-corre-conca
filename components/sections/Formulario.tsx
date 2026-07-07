"use client"

import { useState } from "react"
import { useForm, Controller } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { motion } from "framer-motion"
import { Loader2 } from "lucide-react"
import { inscricaoSchema, type InscricaoFormData } from "@/lib/validations"
import { maskCPF, maskTelefone, maskDataNascimento } from "@/lib/utils"
import { TAMANHOS_CAMISA, MODALIDADES } from "@/lib/constants"
import SuccessModal from "@/components/ui/SuccessModal"

const CAMPO_BASE =
  "w-full rounded-lg border-2 bg-white px-4 py-3 text-base text-roxo-dark placeholder:text-gray-400 transition-colors focus:outline-none focus:ring-2 focus:ring-roxo/30"

function bordaCampo(temErro: boolean, tocadoValido: boolean): string {
  if (temErro) return "border-red-500"
  if (tocadoValido) return "border-green-500"
  return "border-gray-200 focus:border-roxo"
}

export default function Formulario() {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [submitError, setSubmitError] = useState(false)

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
      const result = (await response.json()) as { success: boolean }

      if (!response.ok || !result.success) {
        setSubmitError(true)
        return
      }

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
            <label htmlFor="nome" className="text-sm font-semibold text-roxo-dark">
              Nome completo
            </label>
            <input
              id="nome"
              type="text"
              placeholder="Seu nome completo"
              className={`${CAMPO_BASE} ${bordaCampo(!!errors.nome, !!touchedFields.nome && !errors.nome)}`}
              {...register("nome")}
            />
            {errors.nome && <span className="text-sm text-red-600">{errors.nome.message}</span>}
          </div>

          {/* CPF */}
          <div className="flex flex-col gap-1">
            <label htmlFor="cpf" className="text-sm font-semibold text-roxo-dark">
              CPF
            </label>
            <Controller
              name="cpf"
              control={control}
              render={({ field }) => (
                <input
                  id="cpf"
                  type="text"
                  inputMode="numeric"
                  placeholder="000.000.000-00"
                  className={`${CAMPO_BASE} ${bordaCampo(!!errors.cpf, !!touchedFields.cpf && !errors.cpf)}`}
                  name={field.name}
                  value={field.value}
                  onBlur={field.onBlur}
                  ref={field.ref}
                  onChange={(e) => field.onChange(maskCPF(e.target.value))}
                />
              )}
            />
            {errors.cpf && <span className="text-sm text-red-600">{errors.cpf.message}</span>}
          </div>

          {/* Data de nascimento */}
          <div className="flex flex-col gap-1">
            <label htmlFor="dataNascimento" className="text-sm font-semibold text-roxo-dark">
              Data de nascimento
            </label>
            <Controller
              name="dataNascimento"
              control={control}
              render={({ field }) => (
                <input
                  id="dataNascimento"
                  type="text"
                  inputMode="numeric"
                  placeholder="00/00/0000"
                  className={`${CAMPO_BASE} ${bordaCampo(!!errors.dataNascimento, !!touchedFields.dataNascimento && !errors.dataNascimento)}`}
                  name={field.name}
                  value={field.value}
                  onBlur={field.onBlur}
                  ref={field.ref}
                  onChange={(e) => field.onChange(maskDataNascimento(e.target.value))}
                />
              )}
            />
            {errors.dataNascimento && (
              <span className="text-sm text-red-600">{errors.dataNascimento.message}</span>
            )}
          </div>

          {/* Cidade */}
          <div className="flex flex-col gap-1">
            <label htmlFor="cidade" className="text-sm font-semibold text-roxo-dark">
              Cidade
            </label>
            <input
              id="cidade"
              type="text"
              placeholder="Sua cidade"
              className={`${CAMPO_BASE} ${bordaCampo(!!errors.cidade, !!touchedFields.cidade && !errors.cidade)}`}
              {...register("cidade")}
            />
            {errors.cidade && <span className="text-sm text-red-600">{errors.cidade.message}</span>}
          </div>

          {/* Telefone */}
          <div className="flex flex-col gap-1">
            <label htmlFor="telefone" className="text-sm font-semibold text-roxo-dark">
              Telefone
            </label>
            <Controller
              name="telefone"
              control={control}
              render={({ field }) => (
                <input
                  id="telefone"
                  type="text"
                  inputMode="numeric"
                  placeholder="(00) 00000-0000"
                  className={`${CAMPO_BASE} ${bordaCampo(!!errors.telefone, !!touchedFields.telefone && !errors.telefone)}`}
                  name={field.name}
                  value={field.value}
                  onBlur={field.onBlur}
                  ref={field.ref}
                  onChange={(e) => field.onChange(maskTelefone(e.target.value))}
                />
              )}
            />
            {errors.telefone && (
              <span className="text-sm text-red-600">{errors.telefone.message}</span>
            )}
          </div>

          {/* Tamanho da camisa */}
          <div className="flex flex-col gap-1">
            <label htmlFor="tamanhoCamisa" className="text-sm font-semibold text-roxo-dark">
              Tamanho da camisa
            </label>
            <select
              id="tamanhoCamisa"
              className={`${CAMPO_BASE} ${bordaCampo(!!errors.tamanhoCamisa, !!touchedFields.tamanhoCamisa && !errors.tamanhoCamisa)}`}
              {...register("tamanhoCamisa")}
            >
              {TAMANHOS_CAMISA.map((tamanho) => (
                <option key={tamanho} value={tamanho}>
                  {tamanho}
                </option>
              ))}
            </select>
            {errors.tamanhoCamisa && (
              <span className="text-sm text-red-600">{errors.tamanhoCamisa.message}</span>
            )}
          </div>

          {/* Modalidade */}
          <div className="flex flex-col gap-1">
            <label htmlFor="modalidade" className="text-sm font-semibold text-roxo-dark">
              Modalidade
            </label>
            <select
              id="modalidade"
              className={`${CAMPO_BASE} ${bordaCampo(!!errors.modalidade, !!touchedFields.modalidade && !errors.modalidade)}`}
              {...register("modalidade")}
            >
              {MODALIDADES.map((modalidade) => (
                <option key={modalidade.slug} value={modalidade.slug}>
                  {modalidade.nome} {modalidade.distancia}
                </option>
              ))}
            </select>
            {errors.modalidade && (
              <span className="text-sm text-red-600">{errors.modalidade.message}</span>
            )}
          </div>

          {submitError && (
            <div className="rounded-lg border border-red-300 bg-red-50 px-4 py-3 text-sm font-medium text-red-700 md:col-span-2">
              Não foi possível enviar sua inscrição, tente novamente.
            </div>
          )}

          <div className="md:col-span-2">
            <motion.button
              type="submit"
              disabled={isSubmitting}
              whileHover={!isSubmitting ? { scale: 1.02 } : undefined}
              whileTap={!isSubmitting ? { scale: 0.98 } : undefined}
              className="flex min-h-[52px] w-full items-center justify-center gap-2 rounded-full bg-roxo px-8 py-4 text-lg font-bold text-white shadow-xl transition-shadow hover:shadow-2xl disabled:cursor-not-allowed disabled:opacity-70"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" aria-hidden="true" />
                  Processando...
                </>
              ) : (
                <>Confirmar Inscrição &rarr;</>
              )}
            </motion.button>
          </div>
        </form>
      </div>

      <SuccessModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </section>
  )
}
