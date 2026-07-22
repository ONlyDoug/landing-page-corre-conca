import { writeFileSync, mkdirSync, readdirSync, existsSync } from 'fs'
import { join } from 'path'
import { tmpdir } from 'os'

let configurado = false

/**
 * Ambientes serverless (Vercel Lambda) não têm nenhuma fonte de sistema instalada, então o
 * librsvg usado internamente pelo sharp para rasterizar SVG->PNG não renderiza texto nenhum
 * por padrão. @font-face com data URI embutida no SVG também não funciona neste build do
 * librsvg (o texto sempre cai no fallback padrão, ignorando a fonte declarada). A solução que
 * funciona localmente é registrar a pasta com as fontes via um fonts.conf customizado, gerado
 * em /tmp (único diretório com permissão de escrita na Lambda) e apontado pela env var
 * FONTCONFIG_FILE antes da primeira renderização.
 */
export function configurarFontconfig(): void {
  if (configurado) return

  const cacheDir = join(tmpdir(), 'corre-conca-fontconfig-cache')
  const confPath = join(tmpdir(), 'corre-conca-fonts.conf')
  const fontsDir = join(process.cwd(), 'public', 'fonts')

  const fontsDirExiste = existsSync(fontsDir)
  const arquivosFontes = fontsDirExiste ? readdirSync(fontsDir) : []
  console.log(
    `[fontconfig] cwd=${process.cwd()} fontsDir=${fontsDir} existe=${fontsDirExiste} arquivos=${JSON.stringify(arquivosFontes)}`
  )

  mkdirSync(cacheDir, { recursive: true })
  writeFileSync(
    confPath,
    `<?xml version="1.0"?>\n<!DOCTYPE fontconfig SYSTEM "fonts.dtd">\n<fontconfig>\n  <dir>${fontsDir}</dir>\n  <cachedir>${cacheDir}</cachedir>\n</fontconfig>\n`
  )

  process.env.FONTCONFIG_FILE = confPath
  console.log(`[fontconfig] FONTCONFIG_FILE=${confPath} conteudo escrito, cacheDir=${cacheDir}`)
  configurado = true
}
