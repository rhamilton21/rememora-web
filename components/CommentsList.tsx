'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import ReactionBar from './ReactionBar'

export default function CommentsList({ memorialItemId }: { memorialItemId: string }) {
  const [comments, setComments] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [newComment, setNewComment] = useState('')
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    const fetchComments = async () => {
      const { data, error } = await supabase
        .from('comments')
        .select('id, content, created_at, users_profile(full_name, avatar_url)')
        .eq('memorial_item_id', memorialItemId)
        .order('created_at', { ascending: true })

      if (error) console.error('Error cargando comentarios:', error)
      if (data) setComments(data)
      setLoading(false)
    }

    fetchComments()
  }, [memorialItemId])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newComment.trim()) return
    setSubmitting(true)

    const { data: userData } = await supabase.auth.getUser()
    const userId = userData?.user?.id
    if (!userId) {
      alert('Debes iniciar sesión para comentar')
      setSubmitting(false)
      return
    }

    const { data, error } = await supabase
      .from('comments')
      .insert({
        memorial_item_id: memorialItemId,
        user_id: userId,
        content: newComment.trim(),
      })
      .select('id, content, created_at, users_profile(full_name, avatar_url)')
      .single()

    if (error) {
      console.error('Error al comentar:', error)
      alert('Error al comentar: ' + error.message)
    } else if (data) {
      setComments((prev) => [...prev, data])
      setNewComment('')
    }

    setSubmitting(false)
  }

  if (loading)
    return <p className="text-sm text-gray-400 mt-2">Cargando comentarios...</p>

  return (
    <div className="mt-4">
      <h4 className="text-lg font-medium mb-2">Comentarios</h4>

      {comments.length === 0 ? (
        <p className="text-gray-500 text-sm mb-2">Aún no hay comentarios.</p>
      ) : (
        <ul className="space-y-3 mb-4">
          {comments.map((c) => (
            <li key={c.id} className="border rounded p-2 text-sm">
              <div className="flex items-start gap-2">
                {c.users_profile?.avatar_url ? (
                  <img
                    src={c.users_profile.avatar_url}
                    alt={c.users_profile.full_name || 'Usuario'}
                    className="w-8 h-8 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center text-xs">
                    {c.users_profile?.full_name?.charAt(0) ?? '?'}
                  </div>
                )}
                <div className="flex-1">
                  <p className="font-medium">
                    {c.users_profile?.full_name ?? 'Usuario anónimo'}
                  </p>
                  <p>{c.content}</p>
                  <span className="text-xs text-gray-400">
                    {new Date(c.created_at).toLocaleString()}
                  </span>
                </div>
              </div>

              <ReactionBar commentId={c.id} />
            </li>
          ))}
        </ul>
      )}

      <form onSubmit={handleSubmit} className="mt-2 flex flex-col gap-2">
        <textarea
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          placeholder="Escribe un comentario..."
          className="border rounded p-2 text-sm w-full"
          rows={2}
        />
        <button
          type="submit"
          disabled={submitting}
          className={`bg-blue-600 text-white px-3 py-1 rounded self-end hover:bg-blue-700 ${
            submitting ? 'opacity-50 cursor-not-allowed' : ''
          }`}
        >
          {submitting ? 'Publicando...' : 'Comentar'}
        </button>
      </form>
    </div>
  )
}
