import { cookies } from "next/headers"
import { createServerClient } from "@supabase/ssr"
import type { Database } from "./database.types"

// Usa a anon key + cookies de sessão (respeita RLS). Exclusivo para checagem
// de autenticação no dashboard. Não confundir com lib/supabase/server.ts
// (service role, bypassa RLS, usado só em /api/inscricao).
export async function createAuthClient() {
  const cookieStore = await cookies()

  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options))
          } catch {
            // chamado durante o render de um Server Component; o middleware já revalida a sessão
          }
        },
      },
    }
  )
}
