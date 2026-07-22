import sharp from 'sharp'
import QRCode from 'qrcode'
import { readFileSync } from 'fs'
import { join } from 'path'
import { getLogoDataUri } from './logoDataUri'
import { configurarFontconfig } from './fontconfigSetup'
import { modalidadeLabel } from './utils'
import { SITE_URL } from './constants'

configurarFontconfig()

type DadosAtleta = {
  nome: string
  numeroBib: number
  modalidade: string
  tamanhoCamisa?: string
  qrCodeToken?: string
}

function escaparXml(texto: string): string {
  return texto
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
}

export async function gerarBibPNG(dados: DadosAtleta): Promise<Buffer> {
  const templatePath = join(process.cwd(), 'public', 'templates', 'bib.svg')
  let svg = readFileSync(templatePath, 'utf-8')

  svg = svg
    .replace('{{NUMERO_BIB}}', String(dados.numeroBib).padStart(3, '0'))
    .replace('{{NOME_ATLETA}}', escaparXml(dados.nome.toUpperCase()))
    .replace('{{MODALIDADE}}', escaparXml(modalidadeLabel(dados.modalidade)))
    .replace('{{LOGO_DATA_URI}}', getLogoDataUri())

  return sharp(Buffer.from(svg)).png().toBuffer()
}

export async function gerarCredencialPNG(dados: DadosAtleta): Promise<Buffer> {
  if (!dados.qrCodeToken || !dados.tamanhoCamisa) {
    throw new Error('qrCodeToken e tamanhoCamisa são obrigatórios para a credencial')
  }

  const templatePath = join(process.cwd(), 'public', 'templates', 'credencial.svg')
  let svg = readFileSync(templatePath, 'utf-8')

  const qrUrl = `${SITE_URL}/checkin/${dados.qrCodeToken}`
  const qrSvgString = await QRCode.toString(qrUrl, {
    type: 'svg',
    width: 220,
    margin: 0,
    color: { dark: '#1E0A3C', light: '#FFFFFF' },
  })

  // Mantém a tag <svg> aninhada do QR (com seu próprio viewBox) para preservar a
  // escala dos módulos — descartá-la e usar só o conteúdo interno faz o QR renderizar
  // minúsculo, na escala do viewBox (ex.: 29x29), em vez dos 220x220 esperados.
  const qrPositioned = `<g transform="translate(190, 325)">${qrSvgString}</g>`

  svg = svg
    .replace('{{NOME_ATLETA}}', escaparXml(dados.nome.toUpperCase()))
    .replace(/\{\{NUMERO_BIB\}\}/g, String(dados.numeroBib).padStart(3, '0'))
    .replace('{{MODALIDADE}}', escaparXml(modalidadeLabel(dados.modalidade)))
    .replace('{{TAMANHO_CAMISA}}', escaparXml(dados.tamanhoCamisa))
    .replace('{{QR_CODE_SVG}}', qrPositioned)
    .replace('{{LOGO_DATA_URI}}', getLogoDataUri())

  return sharp(Buffer.from(svg)).png().toBuffer()
}
