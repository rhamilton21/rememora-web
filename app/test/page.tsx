'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

export default function TestPage() {
  const [userId, setUserId] = useState<string | null>(null)
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const router = useRouter()

  useEffect(() => {
    const getUser = async () => {
      const { data, error } = await supabase.auth.getUser()
      if (data?.user) {
        setUserId(data.user.id)
      } else {
        // Si no hay sesión, redirigir al login
        router.push('/login')
      }
    }
    getUser()
  }, [router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setMessage('')
    setLoading(true)

    const { data, error } = await supabase.from('memorials').insert([
      {
        title,
        description,
        created_by: userId,
      },
    ])

    if (error) {
      setMessage(`❌ Error: ${error.message}`)
    } else {
      setMessage('✅ Memorial creado exitosamente.')
      setTitle('')
      setDescription('')
    }

    setLoading(false)
  }

  return (
    <div className="p-6 max-w-xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Crear Memorial (Usuario)</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="text"
          placeholder="Título del memorial"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
          className="w-full p-2 border rounded"
        />
        <textarea
          placeholder="Descripción"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={4}
          className="w-full p-2 border rounded"
        />
        <button
          type="submit"
          disabled={loading || !userId}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          {loading ? 'Creando...' : 'Crear memorial'}
        </button>
      </form>

      {message && <p className="mt-4">{message}</p>}
    </div>
  )
}

