import { writeFileSync, mkdirSync, readdirSync, existsSync, copyFileSync } from 'fs'
import { join } from 'path'
import { tmpdir } from 'os'
import sharp from 'sharp'

let configurado = false

const ARQUIVOS_FONTE = ['Poppins-Regular.ttf', 'Poppins-SemiBold.ttf', 'Poppins-Bold.ttf', 'Poppins-Black.ttf']

/**
 * Ambientes serverless (Vercel Lambda) não têm nenhuma fonte de sistema instalada. O build do
 * sharp usado em produção renderiza SVG via `resvg` (Rust, sem fontconfig/pango/@font-face —
 * ver `sharp.versions`), diferente do build local que usa librsvg+fontconfig. `resvg`/`fontdb`
 * não lê FONTCONFIG_FILE nem @font-face; ele escaneia diretórios fixos do sistema, incluindo
 * `$HOME/.fonts`. Como `/var/task` é somente leitura na Lambda, apontamos HOME para /tmp
 * (gravável) e copiamos as fontes para lá antes da primeira renderização. Mantém também o
 * FONTCONFIG_PATH como fallback defensivo para builds que ainda usam fontconfig.
 */
export function configurarFontconfig(): void {
  if (configurado) return

  const fontsDir = join(process.cwd(), 'public', 'fonts')
  const fontsDirExiste = existsSync(fontsDir)
  console.log(`[fontconfig] cwd=${process.cwd()} fontsDir=${fontsDir} existe=${fontsDirExiste}`)

  const homeDir = join(tmpdir(), 'corre-conca-home')
  const userFontsDir = join(homeDir, '.fonts')
  mkdirSync(userFontsDir, { recursive: true })
  for (const arquivo of ARQUIVOS_FONTE) {
    copyFileSync(join(fontsDir, arquivo), join(userFontsDir, arquivo))
  }
  process.env.HOME = homeDir
  console.log(
    `[fontconfig] HOME=${homeDir} userFontsDir=${userFontsDir} arquivos=${JSON.stringify(readdirSync(userFontsDir))}`
  )

  const cacheDir = join(tmpdir(), 'corre-conca-fontconfig-cache')
  const confDir = join(tmpdir(), 'corre-conca-fontconfig')
  mkdirSync(cacheDir, { recursive: true })
  mkdirSync(confDir, { recursive: true })
  writeFileSync(
    join(confDir, 'fonts.conf'),
    `<?xml version="1.0"?>\n<!DOCTYPE fontconfig SYSTEM "fonts.dtd">\n<fontconfig>\n  <dir>${fontsDir}</dir>\n  <cachedir>${cacheDir}</cachedir>\n</fontconfig>\n`
  )
  process.env.FONTCONFIG_PATH = confDir

  console.log(`[fontconfig] sharp.versions=${JSON.stringify(sharp.versions)}`)
  console.log(`[fontconfig] process.arch=${process.arch} process.platform=${process.platform}`)
  configurado = true
}
