'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { motion } from 'framer-motion'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const router = useRouter()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    const { error } = await supabase.auth.signInWithPassword({ email, password })

    if (error) {
      setError(error.message)
    } else {
      router.push('/dashboard')
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-md bg-white rounded-2xl shadow-md p-8"
      >
        <div className="text-center mb-6">
          <img
            src="/images/rememora-logo.png"
            alt="Rememora"
            className="w-12 h-12 mx-auto mb-3"
          />
          <h1 className="text-2xl font-bold text-gray-800">Iniciar sesión</h1>
          <p className="text-gray-500 text-sm mt-1">
            Accede a tus memoriales y recuerdos.
          </p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <input
            type="email"
            placeholder="Correo electrónico"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4557a6] focus:outline-none"
          />
          <input
            type="password"
            placeholder="Contraseña"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4557a6] focus:outline-none"
          />

          <button
            type="submit"
            className="w-full bg-[#4557a6] text-white py-3 rounded-lg font-semibold hover:bg-[#3a4890] transition"
          >
            Iniciar sesión
          </button>

          {error && <p className="text-red-500 text-sm text-center">{error}</p>}
        </form>

        <p className="text-center text-sm text-gray-600 mt-6">
          ¿No tienes cuenta?{' '}
          <Link href="/register" className="text-[#4557a6] hover:underline">
            Regístrate
          </Link>
        </p>
      </motion.div>
    </main>
  )
}

