'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import Image from 'next/image'

export default function CreateMemorialPage() {
  const router = useRouter()
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [visibility, setVisibility] = useState<'public' | 'private'>('private')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setImageFile(file)
      setPreviewUrl(URL.createObjectURL(file))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    if (!title.trim()) {
      setError('El título es obligatorio.')
      setLoading(false)
      return
    }

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/login')
        return
      }

      let imageUrl: string | null = null

      // 🔹 Subir imagen si se seleccionó una
      if (imageFile) {
        const fileExt = imageFile.name.split('.').pop()
        const fileName = `${crypto.randomUUID()}.${fileExt}`
        const { error: uploadError } = await supabase.storage
          .from('memorial-uploads')
          .upload(`covers/${fileName}`, imageFile)

        if (uploadError) throw uploadError

        const { data } = supabase.storage
          .from('memorial-uploads')
          .getPublicUrl(`covers/${fileName}`)

        imageUrl = data.publicUrl
      }

      // 🔹 Guardar el memorial
      const { error: insertError } = await supabase.from('memorials').insert({
        title,
        description,
        visibility,
        created_by: user.id,
        cover_url: imageUrl, // nuevo campo
      })

      if (insertError) throw insertError

      router.push('/dashboard')
    } catch (err: any) {
      console.error(err)
      setError(err.message || 'Ocurrió un error al crear el memorial.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="max-w-2xl mx-auto px-6 py-16">
      <h1 className="text-3xl font-bold text-gray-800 mb-4">Crear memorial</h1>
      <p className="text-gray-600 mb-8">
        Crea un espacio digital único para preservar recuerdos y homenajear a tus seres queridos.
      </p>

            <form
        onSubmit={handleSubmit}
        className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 space-y-6"
      >
        {/* Imagen de portada */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Imagen de portada (opcional)
          </label>
          <div className="relative border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-[#4557a6] transition group">
            {previewUrl ? (
              <div className="relative w-full h-48 mx-auto">
                <Image
                  src={previewUrl}
                  alt="Vista previa"
                  fill
                  className="object-cover rounded-lg"
                />
              </div>
            ) : (
              <p className="text-gray-500 text-sm pointer-events-none">
                Arrastra una imagen o haz clic para seleccionarla.
              </p>
            )}
            <input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
            />
          </div>
        </div>

        {/* Título */}
        <div className="relative z-0">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Título del memorial <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Ejemplo: En memoria de María López"
            className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-[#4557a6] focus:outline-none"
          />
        </div>

        {/* Descripción */}
        <div className="relative z-0">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Descripción
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Agrega una breve descripción o dedicatoria."
            rows={4}
            className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-[#4557a6] focus:outline-none"
          />
        </div>

        {/* Visibilidad */}
        <div className="relative z-0">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Visibilidad
          </label>
          <select
            value={visibility}
            onChange={(e) => setVisibility(e.target.value as 'public' | 'private')}
            className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-[#4557a6] focus:outline-none"
          >
            <option value="private">Privado (solo tú y tus invitados)</option>
            <option value="public">Público (cualquiera con el enlace)</option>
          </select>
        </div>

        {error && <p className="text-red-500 text-sm">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className={`w-full py-3 font-semibold rounded-lg text-white transition ${
            loading ? 'bg-[#9ba3c9] cursor-not-allowed' : 'bg-[#4557a6] hover:bg-[#3a4890]'
          }`}
        >
          {loading ? 'Creando memorial...' : 'Crear memorial'}
        </button>
      </form>
    </main>
  )
}
