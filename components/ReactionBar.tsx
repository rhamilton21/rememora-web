'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

export default function ReactionBar({
  memorialItemId,
  commentId,
}: {
  memorialItemId?: string
  commentId?: string
}) {
  const [reactions, setReactions] = useState<any[]>([])
  const [userReaction, setUserReaction] = useState<string | null>(null)
  const [profiles, setProfiles] = useState<Record<string, any>>({})
  const [totalReactions, setTotalReactions] = useState(0)
  const [session, setSession] = useState<any>(null)
  const router = useRouter()

  const targetColumn = memorialItemId ? 'memorial_item_id' : 'comment_id'
  const targetId = memorialItemId || commentId
  const reactionTypes = ['like', 'love', 'sad', 'wow']

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSession(data.session))
  }, [])

  useEffect(() => {
    if (!targetId) return

    const fetchReactions = async () => {
      const { data, error } = await supabase
        .from('reactions')
        .select('id, type, user_id, users_profile(full_name, avatar_url)')
        .eq(targetColumn, targetId)

      if (error) {
        console.error('Error cargando reacciones:', error)
        return
      }

      setReactions(data || [])
      setTotalReactions(data?.length || 0)

      const map: Record<string, any> = {}
      data?.forEach((r) => {
        if (r.users_profile) map[r.user_id] = r.users_profile
      })
      setProfiles(map)

      const user = session?.user?.id
      if (user) {
        const found = data?.find((r) => r.user_id === user)
        setUserReaction(found?.type || null)
      }
    }

    fetchReactions()
  }, [targetId, session])

  const handleReaction = async (type: string) => {
    if (!session) {
      alert('Debes iniciar sesión o registrarte para reaccionar.')
      return
    }

    const userId = session.user.id
    const existing = reactions.find((r) => r.user_id === userId)

    if (existing && existing.type === type) {
      await supabase.from('reactions').delete().eq('id', existing.id)
      setReactions((prev) => prev.filter((r) => r.id !== existing.id))
      setUserReaction(null)
      setTotalReactions((prev) => prev - 1)
      return
    }

    if (existing) {
      await supabase.from('reactions').update({ type }).eq('id', existing.id)
      setReactions((prev) =>
        prev.map((r) => (r.id === existing.id ? { ...r, type } : r))
      )
      setUserReaction(type)
      return
    }

    const { data, error } = await supabase
      .from('reactions')
      .insert({
        [targetColumn]: targetId,
        user_id: userId,
        type,
      })
      .select('id, type, user_id, users_profile(full_name, avatar_url)')
      .single()

    if (!error && data) {
      setReactions((prev) => [...prev, data])
      setUserReaction(type)
      setTotalReactions((prev) => prev + 1)
    }
  }

  const count = (type: string) =>
    reactions.filter((r) => r.type === type).length

  return (
    <div className="mt-2 text-sm">
      <div className="flex items-center justify-between">
        {session ? (
          <div className="flex gap-2 flex-wrap">
            {reactionTypes.map((type) => (
              <button
                key={type}
                onClick={() => handleReaction(type)}
                className={`flex items-center gap-1 px-3 py-1.5 rounded-md text-base transition border ${
                  userReaction === type
                    ? 'bg-[#4557a6] text-white border-[#4557a6]'
                    : 'bg-gray-100 hover:bg-gray-200 border-gray-200 text-gray-700'
                }`}
              >
                {type === 'like' && '👍'}
                {type === 'love' && '❤️'}
                {type === 'sad' && '😢'}
                {type === 'wow' && '😮'}
                <span className="text-[#4557a6] text-sm font-semibold ml-1">
                  {count(type)}
                </span>
              </button>
            ))}
          </div>
        ) : (
          <div className="flex items-center gap-3 text-gray-500 italic">
            <p>Para reaccionar,</p>
            <button
              onClick={() => router.push('/signin')}
              className="text-[#4557a6] hover:underline"
            >
              inicia sesión
            </button>
            <span>o</span>
            <button
              onClick={() => router.push('/signup')}
              className="text-[#4557a6] hover:underline"
            >
              crea una cuenta
            </button>
          </div>
        )}

        {totalReactions > 0 && (
          <span className="text-gray-500 text-xs">{totalReactions} reacción(es)</span>
        )}
      </div>

      {Object.keys(profiles).length > 0 && (
        <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-gray-600">
          {Object.entries(profiles).map(([userId, p]: [string, any]) => (
            <div key={userId} className="flex items-center gap-1">
              {p.avatar_url ? (
                <img
                  src={p.avatar_url}
                  alt={p.full_name}
                  className="w-4 h-4 rounded-full object-cover"
                />
              ) : (
                <span className="w-4 h-4 bg-gray-300 text-[10px] rounded-full flex items-center justify-center">
                  {p.full_name?.charAt(0) ?? '?'}
                </span>
              )}
              <span>{p.full_name}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
