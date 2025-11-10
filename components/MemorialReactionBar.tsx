'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

type ReactionType = 'like' | 'love' | 'sad' | 'wow'

interface Props {
  memorialId: string
}

export default function MemorialReactionBar({ memorialId }: Props) {
  const [reactions, setReactions] = useState<any[]>([])
  const [userReaction, setUserReaction] = useState<ReactionType | null>(null)
  const reactionTypes: ReactionType[] = ['like', 'love', 'sad', 'wow']

  useEffect(() => {
    const fetchReactions = async () => {
      const { data, error } = await supabase
        .from('memorial_reactions')
        .select('id, user_id, type')
        .eq('memorial_id', memorialId)

      if (error) {
        console.error('Error cargando reacciones del memorial:', error)
        return
      }

      setReactions(data || [])

      const { data: userData } = await supabase.auth.getUser()
      const userId = userData?.user?.id
      const existing = data?.find((r) => r.user_id === userId)
      if (existing) setUserReaction(existing.type)
    }

    fetchReactions()
  }, [memorialId])

  const handleReaction = async (type: ReactionType) => {
    const { data: userData } = await supabase.auth.getUser()
    const userId = userData?.user?.id
    if (!userId) return alert('Debes iniciar sesión para reaccionar')

    const existing = reactions.find((r) => r.user_id === userId)

    try {
      if (existing) {
        if (existing.type === type) {
          await supabase.from('memorial_reactions').delete().eq('id', existing.id)
          setReactions((prev) => prev.filter((r) => r.id !== existing.id))
          setUserReaction(null)
        } else {
          const { data, error } = await supabase
            .from('memorial_reactions')
            .update({ type })
            .eq('id', existing.id)
            .select()
            .single()

          if (error) throw error
          setReactions((prev) =>
            prev.map((r) => (r.id === existing.id ? data : r))
          )
          setUserReaction(type)
        }
      } else {
        const { data, error } = await supabase
          .from('memorial_reactions')
          .insert({ memorial_id: memorialId, user_id: userId, type })
          .select()
          .single()

        if (error) throw error
        setReactions((prev) => [...prev, data])
        setUserReaction(type)
      }
    } catch (err: any) {
      console.error('Error al reaccionar:', err.message)
      alert('Error al reaccionar: ' + err.message)
    }
  }

  const count = (type: ReactionType) =>
    reactions.filter((r) => r.type === type).length

  return (
    <div className="mt-4 border-t pt-3">
      <p className="text-sm text-gray-600 mb-1 font-medium">
        Reacciones al memorial
      </p>
      <div className="flex gap-3 flex-wrap">
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
    </div>
  )
}
