'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'
import { motion } from 'framer-motion'

interface Memorial {
  id: string
  title: string
  description: string | null
  created_at: string
}

export default function DashboardPage() {
  const [memorials, setMemorials] = useState<Memorial[]>([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const fetchMemorials = async () => {
      const { data: userData } = await supabase.auth.getUser()
      const user = userData?.user
      if (!user) {
        router.push('/login')
        return
      }

      const { data, error } = await supabase
        .from('memorials')
        .select('id, title, description, created_at')
        .eq('created_by', user.id)
        .order('created_at', { ascending: false })

      if (error) console.error(error)
      else setMemorials(data || [])
      setLoading(false)
    }

    fetchMemorials()
  }, [router])

  if (loading)
    return (
      <div className="p-8 text-center text-gray-600 animate-pulse">
        Cargando tus memoriales...
      </div>
    )

  return (
    <main className="max-w-6xl mx-auto px-6 py-16">
      {/* ENCABEZADO */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-10">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Mis memoriales</h1>
          <p className="text-gray-500 mt-1">
            Gestiona, edita o crea nuevos espacios de recuerdo.
          </p>
        </div>

        <Link
          href="/create"
          className="bg-[#4557a6] text-white px-5 py-3 rounded-lg font-medium hover:bg-[#3a4890] transition"
        >
          + Crear memorial
        </Link>
      </div>

      {/* LISTA DE MEMORIALES */}
      {memorials.length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6 }}
          className="text-center text-gray-500 py-20 border border-dashed rounded-xl"
        >
          <p className="text-lg">Aún no tienes memoriales creados.</p>
          <p className="text-sm mt-2">Crea el primero para empezar a construir recuerdos.</p>
          <Link
            href="/create"
            className="inline-block mt-6 bg-[#4557a6] text-white px-6 py-3 rounded-lg hover:bg-[#3a4890] transition"
          >
            Crear memorial
          </Link>
        </motion.div>
      ) : (
        <div className="grid md:grid-cols-3 gap-6">
        {memorials.map((m, idx) => (
          <motion.div
            key={m.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            className="group bg-white rounded-2xl shadow-sm border border-gray-200 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 p-6 flex flex-col"
          >
            <div className="flex-1">
              <h2 className="text-lg font-semibold text-gray-900 mb-2 group-hover:text-[#4557a6] transition-colors">
                {m.title}
              </h2>
              <p className="text-sm text-gray-600 line-clamp-2">
                {m.description || 'Sin descripción.'}
              </p>
            </div>

            <div className="mt-5 flex justify-between items-center text-sm text-gray-500">
              <span>
                {new Date(m.created_at).toLocaleDateString('es-CR', {
                  day: '2-digit',
                  month: 'short',
                  year: 'numeric',
                })}
              </span>

              <div className="flex gap-2">
              {/* 🔹 Botón "Ver" (vista interna) */}
              <Link
                href={`/m/${m.id}`}
                className="px-3 py-1.5 text-sm font-medium rounded-md border border-[#4557a6] text-[#4557a6] hover:bg-[#4557a6] hover:text-white transition-all"
              >
                Ver
              </Link>

              {/* 🔹 Botón "Editar" */}
              <Link
                href={`/memorial/${m.id}?edit=true`}
                className="px-3 py-1.5 text-sm font-medium rounded-md border border-gray-300 text-gray-600 hover:bg-gray-100 transition-all"
              >
                Editar
              </Link>

              {/* 🔹 Botón "Muro" (vista pública) */}
              <Link
                href={`/memorial/${m.id}`}
                target="_blank"
                rel="noopener noreferrer"
                className="px-3 py-1.5 text-sm font-medium rounded-md border border-[#4557a6] text-[#4557a6] hover:bg-[#4557a6] hover:text-white transition-all"
              >
                Muro
              </Link>
            </div>

            </div>
          </motion.div>
        ))}
        </div>
      )}
    </main>
  )
}
