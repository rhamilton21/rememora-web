'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

export default function Navbar() {
  const [user, setUser] = useState<any>(null)
  const pathname = usePathname()
  const router = useRouter()

  useEffect(() => {
    const getUser = async () => {
      const { data } = await supabase.auth.getUser()
      setUser(data?.user || null)
    }

    getUser()
    const { data: listener } = supabase.auth.onAuthStateChange(() => getUser())
    return () => listener.subscription.unsubscribe()
  }, [])

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/')
  }

  if (['/login', '/register'].includes(pathname)) return null

  return (
    <header className="fixed top-0 left-0 w-full bg-white/90 backdrop-blur border-b border-gray-200 shadow-sm z-50">
      <div className="max-w-7xl mx-auto flex items-center justify-between px-6 py-3">
        {/* LOGO */}
        <Link
          href={user ? '/dashboard' : '/'}
          className="flex items-center gap-2 hover:opacity-90 transition"
        >
          <img src="/images/rememora-logo.png" alt="Rememora" className="w-8 h-8" />
          <span className="text-lg font-semibold text-gray-900 tracking-tight">
            REMEMORA
          </span>
        </Link>

        {/* NAVEGACIÓN */}
        <nav className="hidden md:flex items-center gap-6">
          <Link
            href={user ? '/dashboard' : '/'}
            className="header-link"
          >
            Inicio
          </Link>

          {user ? (
            <Link href="/dashboard" className="header-link">
              Mis memoriales
            </Link>
          ) : (
            <Link href="/register" className="header-link">
              Crear cuenta
            </Link>
          )}
        </nav>

        {/* ACCIONES DERECHA */}
        <div className="flex items-center gap-3">
          {user ? (
            <button
              onClick={handleSignOut}
              className="text-sm font-medium text-gray-700 hover:text-red-600 transition"
            >
              Cerrar sesión
            </button>
          ) : (
            <>
              <Link href="/login" className="header-button header-button-outline">
                Iniciar sesión
              </Link>
              <Link href="/register" className="header-button header-button-primary">
                Registrarse
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  )
}