'use client'

import { Geist, Geist_Mono } from 'next/font/google'
import './globals.css'
import NavbarLanding from '@/components/NavbarLanding' // 👈 Landing público
import Navbar from '@/components/Navbar' // 👈 Navbar autenticado
import HeaderBar from '@/components/HeaderBar' // 👈 Header privado (dashboard)
import { usePathname } from 'next/navigation'

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
})

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
})

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const pathname = usePathname()
  
  // Definir rutas públicas (landing + auth)
  const publicRoutes = ['/', '/login', '/register']
  const isPublic = publicRoutes.includes(pathname)

  // Rutas internas privadas (dashboard, memorial, etc.)
  const privateRoutes = ['/dashboard', '/profile', '/settings']
  const isPrivate = privateRoutes.some((r) => pathname.startsWith(r))

  return (
    <html lang="es">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-gray-50 text-gray-800`}
      >
        {/* 🔹 Mostrar Navbar según tipo de ruta */}
        {isPublic ? (
          <NavbarLanding />
        ) : isPrivate ? (
          <HeaderBar />
        ) : (
          <Navbar />
        )}

        {/* 🔹 Contenido principal */}
        <main className="max-w-7xl mx-auto pt-20 px-6">{children}</main>
      </body>
    </html>
  )
}
