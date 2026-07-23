"use client"

import { useEffect, useRef, useState } from "react"
import { Html5Qrcode } from "html5-qrcode"
import { Camera, Search, QrCode, CheckCircle2, Info, AlertCircle, ArrowRight } from "lucide-react"
import { modalidadeLabel } from "@/lib/utils"

type Alerta = "pagamento_pendente" | "pagamento_cancelado" | null

type AtletaCheckin = {
  nome: string
  modalidade: string
  status_pagamento: string
  numero_bib: number | null
  tamanho_camisa?: string
}

type ResultadoCheckin =
  | { tipo: "sucesso"; atleta: AtletaCheckin; alerta: Alerta }
  | { tipo: "ja_registrado"; atleta: AtletaCheckin; checkinEm: string | null }

type ResultadoBusca = {
  id: string
  nome: string
  cpfMascarado: string
  modalidade: string
  numero_bib: number | null
  presenca_confirmada: boolean | null
  qr_code_token: string | null
}

function extrairToken(texto: string): string {
  const match = texto.match(/\/checkin\/([^/?#\s]+)/)
  return match ? match[1] : texto
}

function mapErroCheckin(codigo: string | undefined): string {
  if (codigo === "inscricao_nao_encontrada") return "QR code ou atleta não encontrado."
  if (codigo === "nao_autenticado") return "Sessão expirada. Faça login novamente."
  if (codigo === "token_obrigatorio") return "QR code inválido."
  return "Erro ao processar check-in. Tente novamente."
}

export default function CheckinPage() {
  const [modo, setModo] = useState<"camera" | "manual">("camera")
  const [scannerAtivo, setScannerAtivo] = useState(false)
  const [resultado, setResultado] = useState<ResultadoCheckin | null>(null)
  const [erro, setErro] = useState<string | null>(null)
  const [processando, setProcessando] = useState(false)

  const [termoBusca, setTermoBusca] = useState("")
  const [resultadosBusca, setResultadosBusca] = useState<ResultadoBusca[]>([])
  const [buscando, setBuscando] = useState(false)

  const scannerRef = useRef<Html5Qrcode | null>(null)
  const filaRef = useRef<Promise<void>>(Promise.resolve())
  const processandoScanRef = useRef(false)
  const controllerRef = useRef<AbortController | null>(null)

  function enfileirar(op: () => Promise<void>): Promise<void> {
    const proxima = filaRef.current.then(op, op)
    filaRef.current = proxima
    return proxima
  }

  async function confirmarCheckin(token: string) {
    setProcessando(true)
    setErro(null)
    try {
      const res = await fetch("/api/checkin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token }),
      })
      const data = await res.json()
      if (res.ok) {
        if (data.jaRegistrado) {
          setResultado({ tipo: "ja_registrado", atleta: data.atleta, checkinEm: data.checkinEm })
        } else {
          setResultado({ tipo: "sucesso", atleta: data.atleta, alerta: data.alerta })
        }
      } else {
        setErro(mapErroCheckin(data.error))
      }
    } catch {
      setErro("Erro de conexão. Tente novamente.")
    } finally {
      setProcessando(false)
    }
  }

  function onScanSuccess(decodedText: string) {
    if (processandoScanRef.current) return
    processandoScanRef.current = true
    try {
      scannerRef.current?.pause(true)
    } catch {
      // scanner já não está mais rodando — seguro ignorar
    }
    void confirmarCheckin(extrairToken(decodedText))
  }

  async function iniciarScanner() {
    setErro(null)
    setResultado(null)
    if (scannerRef.current?.isScanning) return
    try {
      const instancia = new Html5Qrcode("leitor-qr")
      scannerRef.current = instancia
      await instancia.start({ facingMode: "environment" }, { fps: 10, qrbox: 250 }, onScanSuccess, () => {})
      setScannerAtivo(true)
    } catch {
      scannerRef.current = null
      setScannerAtivo(false)
      setErro("Não foi possível acessar a câmera. Use a busca manual.")
      setModo("manual")
    }
  }

  async function pararScanner() {
    const instancia = scannerRef.current
    scannerRef.current = null
    setScannerAtivo(false)
    if (!instancia) return
    try {
      if (instancia.isScanning) await instancia.stop()
    } catch {
      // já parado (ex.: dupla desmontagem em modo estrito) — seguro ignorar
    } finally {
      try {
        instancia.clear()
      } catch {
        // remove o <video>/<canvas> injetado — seguro ignorar falha
      }
    }
  }

  useEffect(() => {
    return () => {
      enfileirar(pararScanner)
    }
  }, [modo])

  useEffect(() => {
    controllerRef.current?.abort()
    const termo = termoBusca.trim()
    const controller = new AbortController()
    controllerRef.current = controller
    const handle = setTimeout(() => {
      if (termo.length < 2) {
        setResultadosBusca([])
        setBuscando(false)
        return
      }
      setBuscando(true)
      fetch(`/api/checkin/buscar?q=${encodeURIComponent(termo)}`, { signal: controller.signal })
        .then(async (res) => {
          if (!res.ok) {
            setResultadosBusca([])
            return
          }
          const data = await res.json()
          setResultadosBusca(data.resultados ?? [])
        })
        .catch((err) => {
          if ((err as Error).name !== "AbortError") setResultadosBusca([])
        })
        .finally(() => {
          if (!controller.signal.aborted) setBuscando(false)
        })
    }, 400)
    return () => {
      clearTimeout(handle)
      controller.abort()
    }
  }, [termoBusca])

  function novoCheckin() {
    setResultado(null)
    setErro(null)
    setTermoBusca("")
    setResultadosBusca([])
    processandoScanRef.current = false
    try {
      scannerRef.current?.resume()
    } catch {
      // scanner não está pausado/rodando — seguro ignorar
    }
  }

  function trocarModo(novoModo: "camera" | "manual") {
    setResultado(null)
    setErro(null)
    setModo(novoModo)
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-1">Check-in do Evento</h1>
      <p className="text-sm text-gray-500 mb-6">Confirme a presença dos atletas no dia da corrida</p>

      <div className="flex gap-2 mb-6">
        <button
          onClick={() => trocarModo("camera")}
          className={`flex-1 py-3 rounded-xl font-medium text-sm flex items-center justify-center gap-2 ${
            modo === "camera" ? "bg-roxo text-white" : "bg-white border border-gray-200 text-gray-600"
          }`}
        >
          <Camera size={18} />
          Escanear QR Code
        </button>
        <button
          onClick={() => trocarModo("manual")}
          className={`flex-1 py-3 rounded-xl font-medium text-sm flex items-center justify-center gap-2 ${
            modo === "manual" ? "bg-roxo text-white" : "bg-white border border-gray-200 text-gray-600"
          }`}
        >
          <Search size={18} />
          Buscar Manualmente
        </button>
      </div>

      {modo === "camera" && !resultado && (
        <div className="bg-white rounded-2xl shadow-sm p-6 text-center">
          {!scannerAtivo ? (
            <>
              <QrCode className="text-purple-300 mx-auto mb-4" size={64} />
              <p className="text-gray-500 text-sm mb-4">Toque para escanear o QR code da credencial</p>
              <button
                onClick={() => enfileirar(iniciarScanner)}
                disabled={processando}
                className="bg-roxo hover:bg-roxo-dark text-white px-6 py-3 rounded-xl font-medium flex items-center gap-2 mx-auto disabled:opacity-50"
              >
                <Camera size={18} />
                Iniciar Câmera
              </button>
            </>
          ) : (
            <>
              <div id="leitor-qr" className="w-full max-w-sm mx-auto rounded-xl overflow-hidden" />
              <button onClick={() => enfileirar(pararScanner)} className="mt-4 text-gray-500 text-sm underline">
                Cancelar
              </button>
            </>
          )}
        </div>
      )}

      {modo === "manual" && !resultado && (
        <div className="bg-white rounded-2xl shadow-sm p-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              value={termoBusca}
              onChange={(e) => setTermoBusca(e.target.value)}
              placeholder="Nome, CPF ou número do bib..."
              className="w-full border border-gray-300 rounded-xl pl-10 pr-4 py-3 text-sm bg-white text-gray-900 focus:ring-2 focus:ring-purple-500 focus:outline-none"
            />
          </div>

          {buscando && <p className="text-sm text-gray-400 mt-3">Buscando...</p>}

          {resultadosBusca.length > 0 && (
            <div className="mt-4 divide-y divide-gray-100">
              {resultadosBusca.map((r) => (
                <div
                  key={r.id}
                  onClick={() => r.qr_code_token && confirmarCheckin(r.qr_code_token)}
                  className="flex items-center justify-between py-3 px-2 hover:bg-gray-50 rounded-lg cursor-pointer"
                >
                  <div>
                    <p className="font-medium text-gray-800">{r.nome}</p>
                    <p className="text-xs text-gray-400">{r.cpfMascarado}</p>
                  </div>
                  <div className="flex items-center">
                    <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-purple-100 text-purple-700">
                      Nº {r.numero_bib ?? "—"}
                    </span>
                    {r.presenca_confirmada && <CheckCircle2 className="text-green-500 ml-2" size={16} />}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {erro && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 mt-4 flex items-start gap-3">
          <AlertCircle className="text-red-500 flex-shrink-0" size={20} />
          <div className="flex-1">
            <p className="text-red-700 text-sm">{erro}</p>
            <button onClick={novoCheckin} className="text-red-700 text-sm underline mt-1">
              Tentar novamente
            </button>
          </div>
        </div>
      )}

      {resultado?.tipo === "ja_registrado" && (
        <div className="bg-blue-50 border-2 border-blue-200 rounded-2xl p-8 text-center mt-4">
          <Info className="text-blue-500 mx-auto mb-3" size={48} />
          <p className="text-blue-800 font-bold text-lg mb-1">Check-in já realizado</p>
          <p className="text-blue-600 text-sm">
            {resultado.checkinEm
              ? `às ${new Date(resultado.checkinEm).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}`
              : ""}
          </p>
          <button
            onClick={novoCheckin}
            className="mt-6 bg-roxo hover:bg-roxo-dark text-white px-6 py-3 rounded-xl font-medium mx-auto flex items-center gap-2"
          >
            Confirmar Próximo Atleta
            <ArrowRight size={18} />
          </button>
        </div>
      )}

      {resultado?.tipo === "sucesso" && (
        <div className="bg-green-50 border-2 border-green-300 rounded-2xl p-8 text-center mt-4">
          <CheckCircle2 className="text-green-500 mx-auto mb-3" size={56} />
          <p className="text-green-800 font-bold text-xl mb-4">Check-in Confirmado!</p>

          {resultado.alerta && (
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 mb-4 text-left flex items-start gap-2">
              <AlertCircle className="text-amber-500 flex-shrink-0" size={18} />
              <p className="text-amber-700 text-sm">
                {resultado.alerta === "pagamento_pendente"
                  ? "Pagamento ainda não confirmado — verifique manualmente."
                  : "Pagamento cancelado — verifique manualmente."}
              </p>
            </div>
          )}

          <div className="bg-white rounded-xl p-4 mt-2">
            <p className="text-lg font-bold text-gray-800">{resultado.atleta.nome}</p>
            <p className="bg-roxo text-white text-2xl font-black px-4 py-2 rounded-xl inline-block my-2">
              Nº {resultado.atleta.numero_bib ?? "—"}
            </p>
            <div className="flex justify-center gap-4 text-sm text-gray-600">
              <span>{modalidadeLabel(resultado.atleta.modalidade)}</span>
              {resultado.atleta.tamanho_camisa && <span>Camiseta {resultado.atleta.tamanho_camisa}</span>}
            </div>
          </div>

          <button
            onClick={novoCheckin}
            className="mt-6 bg-roxo hover:bg-roxo-dark text-white px-6 py-3 rounded-xl font-medium mx-auto flex items-center gap-2"
          >
            Confirmar Próximo Atleta
            <ArrowRight size={18} />
          </button>
        </div>
      )}
    </div>
  )
}
