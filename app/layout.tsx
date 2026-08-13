import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Mapa Solidario — Coordinación de Emergencias Colombia 2026',
  description:
    'Mapa colaborativo en tiempo real para coordinar voluntariado y donaciones tras el terremoto de Colombia (agosto 2026). Agrega puntos de acopio, voluntariado y donaciones sin necesidad de crear cuenta.',
  keywords: ['terremoto Colombia', 'voluntariado', 'donaciones', 'emergencia', 'Bogotá', 'ayuda', 'mapa solidario'],
  openGraph: {
    title: 'Mapa Solidario — Emergencia Colombia 2026',
    description: 'Coordina voluntariado y donaciones en tiempo real. Sin registro.',
    type: 'website',
    locale: 'es_CO',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es">
      <body className={inter.className}>{children}</body>
    </html>
  )
}
