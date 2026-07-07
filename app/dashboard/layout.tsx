import { redirect } from "next/navigation"
import { createAuthClient } from "@/lib/supabase/auth-server"
import { signOut } from "./actions"
import {
  LayoutDashboard,
  Users,
  DollarSign,
  QrCode,
  FileText,
  LogOut,
} from "lucide-react"

const navLinks = [
  { href: "/dashboard", label: "Visão Geral", icon: LayoutDashboard },
  { href: "/dashboard/inscritos", label: "Inscritos", icon: Users },
  { href: "/dashboard/financeiro", label: "Financeiro", icon: DollarSign },
  { href: "/dashboard/checkin", label: "Check-in", icon: QrCode },
  { href: "/dashboard/relatorios", label: "Relatórios", icon: FileText },
]

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createAuthClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/login")
  }

  return (
    // VISUAL: wrapper
    <div className="min-h-screen flex">
      {/* VISUAL: sidebar-desktop */}
      <aside className="hidden md:flex flex-col w-64 min-h-screen bg-roxo-dark p-4">
        {/* VISUAL: sidebar-topo */}
        <div className="mb-8">
          <p className="text-white font-bold text-lg">Corre Conça</p>
          <p className="text-purple-300 text-xs">Organizador</p>
        </div>

        {/* VISUAL: sidebar-nav */}
        <nav className="flex flex-col gap-1 flex-1">
          {navLinks.map((link) => {
            const Icon = link.icon
            return (
              <a
                key={link.href}
                href={link.href}
                className="flex items-center gap-3 px-3 py-2 rounded-lg text-purple-200 hover:bg-roxo hover:text-white transition-colors text-sm"
              >
                <Icon size={18} />
                <span>{link.label}</span>
              </a>
            )
          })}
        </nav>

        {/* VISUAL: sidebar-logout */}
        <form action={signOut} className="mt-auto w-full">
          <button
            type="submit"
            className="w-full flex items-center gap-3 px-3 py-2 text-purple-300 hover:text-white text-sm rounded-lg hover:bg-roxo transition-colors"
          >
            <LogOut size={18} />
            <span>Sair</span>
          </button>
        </form>
      </aside>

      {/* VISUAL: main-wrapper */}
      <div className="flex-1 flex flex-col min-h-screen">
        {/* VISUAL: header */}
        <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <p className="text-lg font-semibold text-gray-800">Painel Corre Conça</p>
          <p className="text-sm text-gray-500">{user.email}</p>
        </header>

        {/* VISUAL: main */}
        <main className="flex-1 bg-gray-50 p-6 overflow-auto pb-24 md:pb-6">{children}</main>

        {/* VISUAL: bottom-nav-mobile */}
        <nav className="flex md:hidden fixed bottom-0 left-0 right-0 z-50 bg-roxo-dark border-t border-roxo justify-around">
          {navLinks.map((link) => {
            const Icon = link.icon
            return (
              <a
                key={link.href}
                href={link.href}
                className="flex-1 flex flex-col items-center justify-center py-2 gap-0.5 text-purple-200 text-xs"
              >
                <Icon size={20} />
                <span>{link.label}</span>
              </a>
            )
          })}
        </nav>
      </div>
    </div>
  )
}
