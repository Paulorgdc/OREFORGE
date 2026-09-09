import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'OREFORGE — Minere seu futuro financeiro',
  description: 'Gerencie investimentos com gamificação. CDB, CDI, SELIC, Poupança e mais.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body className="bg-slate-950 text-white antialiased">{children}</body>
    </html>
  )
}