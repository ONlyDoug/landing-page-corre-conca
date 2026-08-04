import { z } from 'zod'

export function validarCPF(cpfSujo: string): boolean {
  const cpf = cpfSujo.replace(/\D/g, '')
  if (cpf.length !== 11 || /^(\d)\1{10}$/.test(cpf)) return false
  const calcDigito = (base: string, pesoInicial: number): number => {
    let soma = 0
    for (let i = 0; i < base.length; i++) soma += parseInt(base[i], 10) * (pesoInicial - i)
    const resto = (soma * 10) % 11
    return resto === 10 ? 0 : resto
  }
  const digito1 = calcDigito(cpf.slice(0, 9), 10)
  const digito2 = calcDigito(cpf.slice(0, 10), 11)
  return digito1 === parseInt(cpf[9], 10) && digito2 === parseInt(cpf[10], 10)
}

/** Normaliza nome para comparação: trim, minúsculas e remoção de acentos (ex.: "Estéfani " -> "estefani"). */
export function normalizarNome(valor: string): string {
  return valor
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
}

/** Converte "dd/mm/yyyy" (formato mascarado do form) em "yyyy-mm-dd", validando data de calendário real. */
export function parseDataNascimentoISO(valor: string): string | null {
  const match = valor.match(/^(\d{2})\/(\d{2})\/(\d{4})$/)
  if (!match) return null
  const [, diaStr, mesStr, anoStr] = match
  const dia = parseInt(diaStr, 10)
  const mes = parseInt(mesStr, 10)
  const ano = parseInt(anoStr, 10)
  const data = new Date(ano, mes - 1, dia)
  if (data.getFullYear() !== ano || data.getMonth() !== mes - 1 || data.getDate() !== dia) return null
  return `${anoStr}-${mesStr}-${diaStr}`
}

export const inscricaoSchema = z.object({
  nome: z.string().refine(
    (v) => v.trim().split(/\s+/).filter(Boolean).length >= 2,
    'Digite seu nome completo (mínimo 2 palavras)'
  ),
  cpf: z.string().refine(validarCPF, 'CPF inválido — confira os números digitados'),
  cidade: z.string().min(2, 'Informe sua cidade'),
  dataNascimento: z.string().superRefine((v, ctx) => {
    if (v.replace(/\D/g, '').length < 8) {
      ctx.addIssue('Data incompleta. Use o formato DD/MM/AAAA')
      return
    }
    if (!parseDataNascimentoISO(v)) {
      ctx.addIssue('Essa data não existe. Confira o dia e o mês informados')
    }
  }),
  telefone: z.string().refine((v) => {
    const digitos = v.replace(/\D/g, '')
    return digitos.length === 10 || digitos.length === 11
  }, 'Telefone inválido. Digite com DDD (ex: 75 99999-9999)'),
  tamanhoCamisa: z.enum(['P', 'M', 'G', 'GG', 'XG'], 'Selecione o tamanho da camiseta'),
  modalidade: z.enum(['caminhada_3km', 'corrida_6km'], 'Selecione a modalidade que deseja participar'),
})

export type InscricaoFormData = z.infer<typeof inscricaoSchema>
