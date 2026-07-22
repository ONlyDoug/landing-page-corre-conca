import { readFileSync } from 'fs'
import { join } from 'path'

let cachedLogoDataUri: string | null = null

export function getLogoDataUri(): string {
  if (cachedLogoDataUri) return cachedLogoDataUri

  const logoPath = join(process.cwd(), 'public', 'images', 'logo.png')
  const logoBuffer = readFileSync(logoPath)
  const base64 = logoBuffer.toString('base64')
  cachedLogoDataUri = `data:image/png;base64,${base64}`
  return cachedLogoDataUri
}
