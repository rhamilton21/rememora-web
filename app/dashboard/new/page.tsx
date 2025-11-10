'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

export default function NewMemorialPage() {
  const router = useRouter()
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)

    const { data: userData } = await supabase.auth.getUser()
    const userId = userData?.user?.id
    if (!userId) return router.push('/login')

    const { error } = await supabase
      .from('memorials')
      .insert([{ title, description, created_by: userId }])

    if (error) {
      console.error(error)
      alert('Error al crear el memorial')
    } else {
      router.push('/dashboard')
    }

    setSubmitting(false)
  }

  return (
    <div className="max-w-xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">Nuevo memorial</h1>
      <form onSubmit={handleCreate} className="space-y-4">
        <div>
          <label className="block text-sm font-medium">Título</label>
          <input
            type="text"
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="border rounded w-full p-2 mt-1"
            placeholder="Ej. En memoria de..."
          />
        </div>

        <div>
          <label className="block text-sm font-medium">Descripción</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="border rounded w-full p-2 mt-1"
            rows={4}
            placeholder="Breve texto descriptivo o dedicatoria"
          />
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="bg-black text-white px-4 py-2 rounded hover:bg-gray-800 disabled:opacity-50"
        >
          {submitting ? 'Creando...' : 'Crear memorial'}
        </button>
      </form>
    </div>
  )
}
