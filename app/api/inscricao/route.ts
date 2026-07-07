import { NextResponse } from "next/server"
import { inscricaoSchema } from "@/lib/validations"

export async function POST(request: Request) {
  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json(
      { success: false, errors: { formErrors: ["JSON inválido"], fieldErrors: {} } },
      { status: 400 }
    )
  }

  const parsed = inscricaoSchema.safeParse(body)

  if (!parsed.success) {
    return NextResponse.json(
      { success: false, errors: parsed.error.flatten() },
      { status: 400 }
    )
  }

  console.log("[inscricao] nova inscrição recebida:", parsed.data)
  // TODO(Módulo 2): enviar e-mail real para a organização / persistir no Supabase aqui

  return NextResponse.json({ success: true })
}
