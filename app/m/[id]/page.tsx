'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { Info, Camera, MessageCircle, Heart, Hourglass } from 'lucide-react'

export default function PublicMemorialPage() {
  const params = useParams()
  const router = useRouter()
  const memorialId = Array.isArray(params?.id)
    ? params.id[0]
    : (params?.id as string | undefined)

  const [memorial, setMemorial] = useState<any>(null)
  const [memories, setMemories] = useState<any[]>([])
  const [reactionCount, setReactionCount] = useState(0)
  const [userReacted, setUserReacted] = useState(false)
  const [tab, setTab] = useState<'bio' | 'family' | 'details' | 'muro'>('bio')

  useEffect(() => {
    if (!memorialId) return
    const fetchData = async () => {
      const { data: mem } = await supabase
        .from('memorials')
        .select('*')
        .eq('id', memorialId)
        .single()
      setMemorial(mem)

      const { data: recs } = await supabase
        .from('memorial_items')
        .select('*')
        .eq('memorial_id', memorialId)
        .eq('status', 'approved')
        .order('created_at', { ascending: false })
      setMemories(recs || [])

      const { data: reacts } = await supabase
        .from('memorial_reactions')
        .select('id, user_id')
        .eq('memorial_id', memorialId)
      setReactionCount(reacts?.length || 0)

      const { data: userData } = await supabase.auth.getUser()
      const userId = userData?.user?.id
      if (userId && reacts?.some((r) => r.user_id === userId)) setUserReacted(true)
    }
    fetchData()
  }, [memorialId])

  const handleHeartClick = async () => {
    const { data: userData } = await supabase.auth.getUser()
    const userId = userData?.user?.id
    if (!userId) return alert('Inicia sesión para reaccionar.')

    if (userReacted) {
      await supabase
        .from('memorial_reactions')
        .delete()
        .eq('memorial_id', memorialId)
        .eq('user_id', userId)
      setUserReacted(false)
      setReactionCount((prev) => Math.max(prev - 1, 0))
    } else {
      await supabase
        .from('memorial_reactions')
        .insert({ memorial_id: memorialId, user_id: userId, type: 'love' })
      setUserReacted(true)
      setReactionCount((prev) => prev + 1)
    }
  }

  if (!memorial) {
    return (
      <div className="flex justify-center items-center h-screen text-gray-500">
        Memorial no encontrado.
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#f8f8fb] text-gray-800">
      {/* PORTADA */}
    <section className="relative h-[28rem] w-full overflow-hidden flex flex-col justify-end">
    {memorial.cover_url ? (
        <img
        src={memorial.cover_url}
        className="absolute inset-0 w-full h-full object-cover"
        alt="Portada del memorial"
        />
    ) : (
        <div className="absolute inset-0 bg-gradient-to-r from-gray-200 to-gray-300" />
    )}

    {/* Capa de oscurecimiento */}
    <div className="absolute inset-0 bg-black/40" />

    {/* CONTENIDO CENTRAL */}
    <div className="relative z-10 text-center text-white pb-10 flex flex-col items-center">
        <div className="w-44 h-44 md:w-52 md:h-52 rounded-full overflow-hidden border-[6px] border-white shadow-2xl -mt-24 md:-mt-28 bg-white/20 backdrop-blur-sm">
        <img
            src={memorial.portrait_url || '/images/avatar-placeholder.png'}
            alt="Retrato"
            className="w-full h-full object-cover"
        />
        </div>

        <p className="text-sm mt-6 text-gray-100">En memoria de</p>
        <h1 className="text-3xl font-bold mt-1">{memorial.full_name}</h1>

        {memorial.epitaph && (
        <p className="text-[#eab308] italic mt-1 text-lg font-medium">
            {memorial.epitaph}
        </p>
        )}

        <p className="text-sm text-gray-200 mt-1">
        {memorial.birth_date
            ? new Date(memorial.birth_date).toLocaleDateString('es-CR', {
                day: '2-digit',
                month: 'long',
                year: 'numeric',
            })
            : '—'}{' '}
        -{' '}
        {memorial.death_date
            ? new Date(memorial.death_date).toLocaleDateString('es-CR', {
                day: '2-digit',
                month: 'long',
                year: 'numeric',
            })
            : '—'}
        </p>

        {/* ❤️ Reacción */}
        <button
        onClick={handleHeartClick}
        className={`mt-4 flex items-center gap-2 mx-auto px-5 py-2.5 rounded-full shadow-lg transition ${
            userReacted
            ? 'bg-red-600 text-white hover:bg-red-700'
            : 'bg-white/90 text-red-600 hover:bg-red-100'
        }`}
        >
        <Heart
            className={`w-5 h-5 ${
            userReacted ? 'fill-white' : 'fill-red-600/20'
            }`}
        />
        <span className="font-medium">{reactionCount}</span>
        </button>
    </div>
    </section>

      {/* CONTENIDO */}
      <main className="max-w-4xl mx-auto mt-10 bg-white rounded-2xl shadow p-6 md:p-10">
        {/* TABS */}
        <div className="flex justify-center border-b border-gray-200 mb-6">
          {[
            { id: 'bio', label: 'Biografía', icon: <Info className="w-4 h-4" /> },
            { id: 'family', label: 'Familia', icon: <Camera className="w-4 h-4" /> },
            { id: 'details', label: 'Detalles', icon: <MessageCircle className="w-4 h-4" /> },
            { id: 'muro', label: 'Muro colaborativo', icon: <Heart className="w-4 h-4" /> },
          ].map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id as any)}
              className={`flex items-center gap-1 px-4 py-2 text-sm font-medium border-b-2 transition ${
                tab === t.id
                  ? 'border-[#8c7ae6] text-[#8c7ae6]'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              {t.icon}
              {t.label}
            </button>
          ))}
        </div>

        {/* TAB CONTENT */}
        {tab === 'bio' && (
          <p className="text-gray-700 leading-relaxed whitespace-pre-line">
            {memorial.biography || 'Sin biografía disponible.'}
          </p>
        )}
        {tab === 'family' && (
          <p className="text-gray-700 leading-relaxed whitespace-pre-line">
            {memorial.family || 'No se ha registrado información familiar.'}
          </p>
        )}
        {tab === 'details' && (
          <p className="text-gray-700 leading-relaxed whitespace-pre-line">
            {memorial.details || 'No hay detalles adicionales.'}
          </p>
        )}
        {tab === 'muro' && (
          <div className="text-center space-y-4 mt-6">
            <p className="text-gray-600 max-w-md mx-auto leading-relaxed">
              Este espacio está reservado para quienes deseen compartir recuerdos, fotos o mensajes en el muro colaborativo.
            </p>

            {/* Botón para ir al muro colaborativo (solo público para el ejemplo) */}
            <div className="text-center mt-4">
              <a
                href={`/memorial/${memorial.id}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block px-6 py-2 bg-[#6c5ce7] text-white font-medium rounded-md shadow hover:bg-[#5a4ed0] transition"
              >
                Ver muro colaborativo
              </a>
            </div>
            
            {/* TODO: Desactivar acceso público al muro después de la presentación de Catalitec 
           <p className="text-gray-600 max-w-md mx-auto leading-relaxed">
              Este espacio está reservado para quienes deseen compartir recuerdos, fotos o mensajes en el muro colaborativo.
            </p>
            <button
              onClick={() => router.push('/register')}
              className="px-6 py-2 bg-[#8c7ae6] text-white rounded-lg shadow hover:bg-[#7a68d1] transition"
            >
              Crear cuenta gratuita
            </button>
            */}
          </div>
        )}
      </main>

      {/* PIE DE PÁGINA */}
      <footer className="bg-white border-t border-gray-200 py-10 text-center text-gray-500 text-sm mt-10">
        <p>REMEMORA • Plataforma de legados digitales</p>
        <a
          href="https://www.rememora.net"
          target="_blank"
          className="text-[#4557a6] hover:text-[#3a4890] font-medium"
        >
          www.rememora.net
        </a>
      </footer>
    </div>
  )
}
