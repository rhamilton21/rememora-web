'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { Bell } from 'lucide-react'

export default function HeaderBar() {
  const [user, setUser] = useState<any>(null)
  const [showMenu, setShowMenu] = useState(false)
  const [showNotifications, setShowNotifications] = useState(false)
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

  return (
    <header className="fixed top-0 left-0 w-full bg-white/90 backdrop-blur border-b border-gray-200 shadow-sm z-50">
      <div className="max-w-7xl mx-auto flex items-center justify-between px-6 py-3">
        {/* LOGO */}
        <Link
          href={user ? '/dashboard' : '/'}
          className="flex items-center gap-2 hover:opacity-90 transition"
        >
          <img src="/images/rememora-logo.png" alt="Rememora" className="w-7 h-7" />
          <span className="text-lg font-semibold text-gray-900 tracking-tight">
            REMEMORA
          </span>
        </Link>

        {/* NAVEGACIÓN */}
        <nav className="hidden md:flex items-center gap-6">
          <Link href="/dashboard" className="header-link">
            Inicio
          </Link>
          <Link href="/dashboard" className="header-link">
            Mis memoriales
          </Link>
          <Link href="/settings" className="header-link">
            Configuración
          </Link>
        </nav>

        {/* DERECHA */}
        <div className="flex items-center gap-4 relative">
          {/* Notificaciones */}
          <button
            onClick={() => {
              setShowNotifications(!showNotifications)
              setShowMenu(false)
            }}
            className="relative p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition"
          >
            <Bell className="w-5 h-5 text-gray-600" />
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-64 bg-white border border-gray-200 shadow-lg rounded-xl overflow-hidden z-50">
              <div className="px-4 py-3 border-b font-semibold text-gray-800">
                Notificaciones
              </div>
              <div className="p-4 text-sm text-gray-500 text-center">
                No hay notificaciones
              </div>
            </div>
          )}

          {/* Menú de usuario */}
          <div className="relative">
            <button
              onClick={() => {
                setShowMenu(!showMenu)
                setShowNotifications(false)
              }}
              className="flex items-center gap-2 bg-gray-100 hover:bg-gray-200 px-2 py-1 rounded-full transition"
            >
              <div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center text-sm font-semibold text-gray-700">
                {user?.email?.charAt(0).toUpperCase() || 'U'}
              </div>
              <span className="hidden sm:block text-sm text-gray-700">
                {user?.user_metadata?.full_name ||
                  user?.email?.split('@')[0] ||
                  'Usuario'}
              </span>
            </button>

            {showMenu && (
              <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 shadow-lg rounded-xl overflow-hidden z-50">
                <Link
                  href="/profile"
                  className="block px-4 py-2 text-sm hover:bg-gray-50"
                  onClick={() => setShowMenu(false)}
                >
                  Perfil
                </Link>
                <Link
                  href="/settings"
                  className="block px-4 py-2 text-sm hover:bg-gray-50"
                  onClick={() => setShowMenu(false)}
                >
                  Configuración
                </Link>
                <button
                  onClick={handleSignOut}
                  className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-50"
                >
                  Cerrar sesión
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}