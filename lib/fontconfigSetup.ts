import { writeFileSync, mkdirSync, copyFileSync } from 'fs'
import { join } from 'path'
import { tmpdir } from 'os'

let configurado = false

const ARQUIVOS_FONTE = ['Poppins-Regular.ttf', 'Poppins-SemiBold.ttf', 'Poppins-Bold.ttf', 'Poppins-Black.ttf']

/**
 * A Lambda da Vercel não tem nenhuma fonte de sistema instalada, então o sharp não renderiza
 * texto nenhum em SVG por padrão (nem via @font-face embutido, que o librsvg empacotado no
 * sharp ignora). `/var/task` é somente leitura, então copiamos as fontes estáticas do Poppins
 * para `$HOME/.fonts` em /tmp (gravável) — um dos diretórios padrão escaneados pelo
 * mecanismo de descoberta de fontes — e também registramos via um fonts.conf customizado
 * (FONTCONFIG_PATH) como reforço, antes da primeira renderização.
 */
export function configurarFontconfig(): void {
  if (configurado) return

  const fontsDir = join(process.cwd(), 'public', 'fonts')

  const homeDir = join(tmpdir(), 'corre-conca-home')
  const userFontsDir = join(homeDir, '.fonts')
  mkdirSync(userFontsDir, { recursive: true })
  for (const arquivo of ARQUIVOS_FONTE) {
    copyFileSync(join(fontsDir, arquivo), join(userFontsDir, arquivo))
  }
  process.env.HOME = homeDir

  const cacheDir = join(tmpdir(), 'corre-conca-fontconfig-cache')
  const confDir = join(tmpdir(), 'corre-conca-fontconfig')
  mkdirSync(cacheDir, { recursive: true })
  mkdirSync(confDir, { recursive: true })
  writeFileSync(
    join(confDir, 'fonts.conf'),
    `<?xml version="1.0"?>\n<!DOCTYPE fontconfig SYSTEM "fonts.dtd">\n<fontconfig>\n  <dir>${fontsDir}</dir>\n  <cachedir>${cacheDir}</cachedir>\n</fontconfig>\n`
  )
  process.env.FONTCONFIG_PATH = confDir

  configurado = true
}
