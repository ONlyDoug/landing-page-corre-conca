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
  nome: z.string().min(3, 'Nome deve ter ao menos 3 caracteres'),
  cpf: z.string().refine(validarCPF, { message: 'CPF inválido' }),
  cidade: z.string().min(2, 'Informe sua cidade'),
  dataNascimento: z.string().min(1, 'Data de nascimento obrigatória'),
  telefone: z.string().min(14, 'Telefone inválido'),
  tamanhoCamisa: z.enum(['P', 'M', 'G', 'GG', 'XG']),
  modalidade: z.enum(['caminhada_3km', 'corrida_6km']),
})

export type InscricaoFormData = z.infer<typeof inscricaoSchema>
