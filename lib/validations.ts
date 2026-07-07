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
