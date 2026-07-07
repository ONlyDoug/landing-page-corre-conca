import { createClient, type SupabaseClient } from "@supabase/supabase-js"
import type { Database } from "./database.types"

// Usa a service role key (bypassa RLS). Nunca importar este módulo em código "use client".
let client: SupabaseClient<Database> | undefined

function getSupabaseAdmin(): SupabaseClient<Database> {
  if (!client) {
    client = createClient<Database>(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)
  }
  return client
}

export const supabaseAdmin = new Proxy({} as SupabaseClient<Database>, {
  get(_target, prop, receiver) {
    return Reflect.get(getSupabaseAdmin(), prop, receiver)
  },
})
