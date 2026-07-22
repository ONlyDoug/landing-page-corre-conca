export type Modalidade = { nome: string; distancia: string; slug: 'caminhada_3km' | 'corrida_6km' }

export const EVENTO = {
  nome: 'Corre Conça',
  edicao: '1ª edição',
  dataEvento: '2026-09-06T06:00:00-03:00',
  local: 'Conceição da Feira, BA',
}

export const DATA_EVENTO_ISO = EVENTO.dataEvento

export const MODALIDADES: Modalidade[] = [
  { nome: 'Caminhada', distancia: '3KM', slug: 'caminhada_3km' },
  { nome: 'Corrida', distancia: '6KM', slug: 'corrida_6km' },
]

export const VALOR_INSCRICAO = 25.0
export const CONDICAO_INSCRICAO = 'R$ 25,00 + 2kg de alimento não perecível'

export const TAMANHOS_CAMISA = ['P', 'M', 'G', 'GG', 'XG'] as const

export const PREMIACAO = {
  todosConcluintes: 'Todos que cruzarem a linha de chegada recebem medalha de participação!',
  podio6km: 'Premiação em dinheiro para 1º, 2º e 3º lugar Feminino e Masculino (valor a anunciar)',
  podio3km: 'Não há premiação em dinheiro para a caminhada',
}

export const KIT = [
  { icone: 'ClipboardList', label: 'Número de Peito' },
  { icone: 'Apple', label: 'Kit de Frutas' },
  { icone: 'Medal', label: 'Medalha de Participação' },
  { icone: 'Trophy', label: 'Medalha Pódio (1º, 2º, 3º)' },
  { icone: 'Shirt', label: 'Camisa Oficial do Evento' },
]

export const KIT_NOTA = 'Kit retirado mediante documento com foto + 2kg de alimento não perecível. Data e local a confirmar — fique de olho em nossas redes sociais!'

export const NAV_LINKS = [
  { href: '#inicio', label: 'Início' },
  { href: '#sobre', label: 'Sobre' },
  { href: '#modalidades', label: 'Modalidades' },
  { href: '#inscricao', label: 'Inscrição' },
  { href: '#premiacao', label: 'Premiação' },
  { href: '#kit', label: 'Kit' },
  { href: '#regulamento', label: 'Regulamento' },
  { href: '#faq', label: 'FAQ' },
]

export const FAQ_ITEMS = [
  { pergunta: 'Preciso ser atleta profissional?', resposta: 'Não, o evento é aberto a todos os níveis.' },
  { pergunta: 'O que preciso levar no dia da corrida?', resposta: 'Número de peito, documento, disposição!' },
  { pergunta: 'Como fica minha inscrição se o evento for cancelado?', resposta: 'Reembolso integral.' },
  { pergunta: 'Posso fazer a caminhada e a corrida?', resposta: 'Não, você deve escolher uma modalidade no momento da inscrição.' },
  { pergunta: 'A premiação em dinheiro vale para a caminhada?', resposta: 'Não, apenas para a corrida 6KM.' },
  { pergunta: 'Onde retiro o kit?', resposta: 'Data e local a confirmar — fique ligado em nossas redes sociais!' },
]

export const REGULAMENTO_ITEMS = [
  { titulo: 'Retirada do Kit', texto: 'Data e local a confirmar; apresentar documento com foto + 2kg de alimento não perecível.' },
  { titulo: 'Política de Reembolso', texto: 'Não há reembolso, exceto desistência formal em até 7 dias após a inscrição (Art. 49 do CDC) ou cancelamento do evento.' },
  { titulo: 'Aceite', texto: 'Ao concluir a inscrição, o atleta aceita automaticamente este regulamento.' },
  { titulo: 'Hidratação', texto: 'Postos de água mineral ao longo de todo o percurso.' },
]

// PLACEHOLDERS — trocar antes do lançamento real (ver HANDOFF.md)
export const LINK_INFINITEPAY = 'https://checkout.infinitepay.io/delso-palmeira-de/OcZUhPRkf8'
export const WEBHOOK_URL_PRODUCAO = 'https://landing-page-corre-conca.vercel.app/api/webhook/infinitepay' // referência: configurar este endereço no painel InfinitePay (aba "Depois do pagamento")
export const EMAIL_ORGANIZACAO = 'contato@correconca.org.br' // PLACEHOLDER: e-mail real da organização
export const REDES_SOCIAIS = { instagram: 'https://www.instagram.com/corrida_solidariaa', whatsapp: 'https://wa.me/5575981937220' }
export const ORGANIZACAO_REALIZACAO = 'Corre Conça'
export const LOGO_PATH = '/images/logo.svg'

// Fase 10 — checkout dinâmico via API InfinitePay
export const INFINITEPAY_HANDLE = 'delso-palmeira-de'
export const INFINITEPAY_API_URL = 'https://api.checkout.infinitepay.io/links'
export const INFINITEPAY_PAYMENT_CHECK_URL = 'https://api.checkout.infinitepay.io/payment_check'
export const SITE_URL = 'https://www.correconca.com'
// URL efetivamente usada no payload enviado à InfinitePay (WEBHOOK_URL_PRODUCAO acima é só documentação/legado)
export const WEBHOOK_URL = `${SITE_URL}/api/webhook/infinitepay`
export const LOCALSTORAGE_QR_TOKEN_KEY = 'correconca:qrCodeToken'
