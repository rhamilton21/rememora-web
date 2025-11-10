'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'

export default function AddMemoryForm({ memorialId }: { memorialId: string }) {
  const [content, setContent] = useState('')
  const [file, setFile] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setMessage(null)

    if (!content.trim() && !file) {
      setMessage('Debes escribir un mensaje o subir una imagen/video.')
      return
    }

    setLoading(true)

    try {
      // Obtener usuario actual
      const { data: userData } = await supabase.auth.getUser()
      const userId = userData?.user?.id
      if (!userId) {
        setMessage('Debes iniciar sesión para compartir un recuerdo.')
        setLoading(false)
        return
      }

      let fileUrl: string | null = null

      if (file) {
        const fileExt = file.name.split('.').pop()
        const fileName = `${crypto.randomUUID()}.${fileExt}`
        const { data, error } = await supabase.storage
          .from('memorial-uploads')
          .upload(`${memorialId}/${fileName}`, file)

        if (error) throw error

        fileUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/memorial-uploads/${memorialId}/${fileName}`
      }

      const { error: insertError } = await supabase.from('memorial_items').insert([
        {
          memorial_id: memorialId,
          uploaded_by: userId,
          type: file ? (file.type.startsWith('video') ? 'video' : 'image') : 'text',
          content: file ? fileUrl : content,
          approved: false,
          status: 'pending',
          created_at: new Date(),
        },
      ])

      if (insertError) throw insertError

      setContent('')
      setFile(null)
      setMessage('Tu recuerdo ha sido enviado para aprobación.')
    } catch (error) {
      console.error(error)
      setMessage('Hubo un error al enviar tu recuerdo.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-gray-50 border border-gray-200 rounded-xl p-6 shadow-sm"
    >
      <h3 className="text-lg font-semibold text-gray-800 mb-4">
        Comparte un recuerdo
      </h3>

      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="Escribe una anécdota, mensaje o recuerdo especial..."
        className="w-full h-28 p-3 border border-gray-300 rounded-lg text-gray-700 focus:ring-2 focus:ring-rememora focus:outline-none transition"
      />

      <div className="mt-4">
        <label className="block text-sm text-gray-600 font-medium mb-1">
          Foto o video (opcional)
        </label>
        <input
          type="file"
          accept="image/*,video/*"
          onChange={(e) => setFile(e.target.files?.[0] || null)}
          className="block w-full text-sm text-gray-600 file:mr-4 file:py-2 file:px-4 
                     file:rounded-md file:border-0 file:text-sm file:font-semibold 
                     file:bg-rememora file:text-white hover:file:bg-rememora-dark cursor-pointer"
        />
      </div>

      {message && (
        <p className="mt-3 text-sm text-center text-gray-600 italic">{message}</p>
      )}

      <button
        type="submit"
        disabled={loading}
        className="mt-6 w-full md:w-auto px-6 py-2.5 bg-rememora text-white font-medium rounded-md 
                   hover:bg-rememora-dark transition disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? 'Enviando...' : 'Enviar para aprobación'}
      </button>
    </form>
  )
}
