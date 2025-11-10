'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import {
  Facebook,
  Mail,
  MessageCircle,
  Share2,
  Link as LinkIcon,
  Calendar,
  Heart,
} from 'lucide-react'

import CommentsList from '@/components/CommentsList'
import ReactionBar from '@/components/ReactionBar'
import AddMemoryForm from '@/components/AddMemoryForm'

export default function MemorialDetailPage() {
  const params = useParams()
  const memorialId = Array.isArray(params?.id)
    ? params.id[0]
    : (params?.id as string | undefined)
  const router = useRouter()

  const [memorial, setMemorial] = useState<any>(null)
  const [items, setItems] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [canContribute, setCanContribute] = useState(false)
  const [reactionCount, setReactionCount] = useState(0)
  const [userReacted, setUserReacted] = useState(false)

  useEffect(() => {
    if (!memorialId) return

    const fetchData = async () => {
      const { data: userData } = await supabase.auth.getUser()
      const userId = userData?.user?.id

      // Obtener memorial
      const { data: memorialData, error: memorialError } = await supabase
        .from('memorials')
        .select('*')
        .eq('id', memorialId)
        .single()

      if (memorialError || !memorialData) {
        router.push('/dashboard')
        return
      }

      setMemorial(memorialData)

      // Obtener recuerdos
      const { data: itemData } = await supabase
        .from('memorial_items')
        .select('*')
        .eq('memorial_id', memorialId)
        .order('created_at', { ascending: false })

      if (itemData) setItems(itemData)

      // Contar reacciones ❤️
      const { data: reactions } = await supabase
        .from('memorial_reactions')
        .select('id, user_id')
        .eq('memorial_id', memorialId)

      setReactionCount(reactions?.length || 0)

      if (userId && reactions?.some((r) => r.user_id === userId)) {
        setUserReacted(true)
      }

      // Permiso de contribución
      if (userId) {
        const { data: followerData } = await supabase
          .from('memorial_followers')
          .select('status')
          .eq('memorial_id', memorialId)
          .eq('user_id', userId)
          .single()

        if (
          memorialData.created_by === userId ||
          followerData?.status === 'approved'
        ) {
          setCanContribute(true)
        }
      }

      setLoading(false)
    }

    fetchData()
  }, [memorialId, router])

  const handleHeartClick = async () => {
    const { data: userData } = await supabase.auth.getUser()
    const userId = userData?.user?.id
    if (!userId) {
      alert('Inicia sesión para reaccionar a este memorial.')
      return
    }

    if (userReacted) {
      // Quitar reacción
      await supabase
        .from('memorial_reactions')
        .delete()
        .eq('memorial_id', memorialId)
        .eq('user_id', userId)

      setUserReacted(false)
      setReactionCount((prev) => Math.max(prev - 1, 0))
    } else {
      // Agregar reacción
      await supabase
        .from('memorial_reactions')
        .insert({ memorial_id: memorialId, user_id: userId, type: 'love' })

      setUserReacted(true)
      setReactionCount((prev) => prev + 1)
    }
  }

  if (loading)
    return (
      <div className="p-10 text-center text-gray-600 animate-pulse">
        Cargando memorial...
      </div>
    )

  const shareUrl = `${process.env.NEXT_PUBLIC_SITE_URL}/memorial/${memorialId}`

  return (
    <div className="max-w-3xl mx-auto bg-white rounded-2xl shadow-sm border border-gray-100">
      {/* PORTADA */}
      <section className="relative w-full h-64 md:h-80 overflow-hidden rounded-t-2xl">
        {memorial?.cover_url ? (
          <img
            src={memorial.cover_url}
            alt="Imagen del memorial"
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-r from-gray-200 to-gray-300 flex items-center justify-center text-gray-500 text-sm">
            Sin imagen de portada
          </div>
        )}

        {/* Overlay oscuro */}
        <div className="absolute inset-0 bg-black/40" />

        {/* Retrato lateral inferior izquierdo */}
        {memorial?.portrait_url && (
          <div className="absolute bottom-4 left-6 z-20 flex items-center gap-4">
            <img
              src={memorial.portrait_url}
              alt="Retrato del homenajeado"
              className="w-20 h-20 md:w-24 md:h-24 rounded-full border-4 border-white shadow-lg object-cover"
            />
            <div className="text-white">
              <h1 className="text-2xl md:text-3xl font-bold mb-1">
                En memoria de {memorial?.title}
              </h1>
              <p className="text-sm md:text-base text-gray-100 line-clamp-2">
                {memorial?.description || 'Sin descripción disponible.'}
              </p>

              <div className="flex flex-wrap items-center gap-3 text-xs md:text-sm text-gray-200 mt-2">
                <span className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  {new Date(memorial?.created_at).toLocaleDateString('es-CR', {
                    day: '2-digit',
                    month: 'long',
                    year: 'numeric',
                  })}
                </span>
                <span>{items.length} recuerdos</span>
                <span>{reactionCount} reacciones</span>
              </div>
            </div>
          </div>
        )}

        {/* ❤️ REACCIÓN EN PORTADA */}
        <button
          onClick={handleHeartClick}
          className={`absolute bottom-6 right-6 flex items-center gap-2 px-4 py-2 rounded-full shadow-md transition ${
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
      </section>

      {/* CONTENIDO PRINCIPAL */}
      <div className="p-6 md:p-8">
        {/* COMPARTIR MEMORIAL */}
        <div className="pb-5 border-b border-gray-200 mb-10">
          <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
            <Share2 className="w-4 h-4 text-gray-600" />
            Compartir este memorial
          </h3>

          <div className="flex gap-3 flex-wrap items-center">
            <a
              href={`https://api.whatsapp.com/send?text=${encodeURIComponent(
                `Mira este memorial en REMEMORA: ${shareUrl}`
              )}`}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 bg-gray-100 hover:bg-gray-200 rounded-full transition"
              title="Compartir en WhatsApp"
            >
              <MessageCircle className="w-5 h-5 text-gray-700" />
            </a>

            <a
              href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
                shareUrl
              )}`}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 bg-gray-100 hover:bg-gray-200 rounded-full transition"
              title="Compartir en Facebook"
            >
              <Facebook className="w-5 h-5 text-gray-700" />
            </a>

            <a
              href={`mailto:?subject=Memorial en REMEMORA&body=Te comparto este memorial: ${shareUrl}`}
              className="p-2 bg-gray-100 hover:bg-gray-200 rounded-full transition"
              title="Enviar por correo"
            >
              <Mail className="w-5 h-5 text-gray-700" />
            </a>

            <button
              onClick={() => navigator.clipboard.writeText(shareUrl)}
              className="p-2 bg-gray-100 hover:bg-gray-200 rounded-full transition"
              title="Copiar enlace"
            >
              <LinkIcon className="w-5 h-5 text-gray-700" />
            </button>
          </div>
        </div>

        {/* LISTA DE RECUERDOS */}
        <section className="mb-12">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">
            Recuerdos compartidos
          </h2>

          {items.length === 0 ? (
            <p className="text-gray-500 italic text-center py-8">
              Aún no hay recuerdos agregados.
            </p>
          ) : (
            <ul className="space-y-6">
              {items.map((item) => (
                <li
                  key={item.id}
                  className="bg-gray-50 border border-gray-200 rounded-xl p-5 shadow-sm hover:shadow-md transition"
                >
                  {item.type === 'text' && (
                    <p className="text-gray-700 text-lg leading-relaxed whitespace-pre-line">
                      {item.content}
                    </p>
                  )}
                  {item.type === 'image' && (
                    <div className="bg-gray-100 flex justify-center items-center rounded-lg border mt-2 overflow-hidden">
                      <img
                        src={item.content ?? ''}
                        alt="Recuerdo visual"
                        className="max-h-[600px] object-contain rounded-lg"
                      />
                    </div>
                  )}
                  {item.type === 'video' && (
                    <video
                      controls
                      className="rounded-lg w-full mt-2 border shadow-inner"
                    >
                      <source src={item.content ?? ''} type="video/mp4" />
                    </video>
                  )}

                  <p className="text-sm text-gray-400 mt-3">
                    Publicado el{' '}
                    {item.created_at
                      ? new Date(item.created_at).toLocaleDateString('es-CR', {
                          day: '2-digit',
                          month: 'long',
                          year: 'numeric',
                        })
                      : '—'}
                  </p>

                  <div className="mt-3 border-t border-gray-200 pt-3 space-y-3">
                    <ReactionBar memorialItemId={item.id} />
                    <CommentsList memorialItemId={item.id} />
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>

        {/* FORMULARIO */}
        <section className="border-t border-gray-200 pt-6">
          {canContribute ? (
            <AddMemoryForm memorialId={memorialId!} />
          ) : (
            <p className="text-center text-gray-500 italic">
              Solo los colaboradores aprobados o el creador pueden agregar
              nuevos recuerdos.
            </p>
          )}
        </section>
      </div>
    </div>
  )
}
