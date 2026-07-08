"use client"

import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"

interface GraficoEvolucaoProps {
  dados: { data: string; total: number }[]
}

export default function GraficoEvolucao({ dados }: GraficoEvolucaoProps) {
  return (
    <ResponsiveContainer width="100%" height={200}>
      <BarChart data={dados}>
        <XAxis dataKey="data" tick={{ fontSize: 11 }} />
        <YAxis allowDecimals={false} />
        <Tooltip formatter={(value) => [value, "Inscrições"]} />
        <Bar dataKey="total" fill="#7C3AED" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  )
}
