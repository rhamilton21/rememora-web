'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

interface Contribution {
  id: string
  memorial_id: string
  author_id: string
  content: string | null
  media_url: string | null
  status: string
  created_at: string
  users_profile?: {
    full_name: string
    avatar_url: string | null
  } | null
}

export default function ModerateContributionsPage() {
  const params = useParams()
  const memorialId = Array.isArray(params?.id)
    ? params.id[0]
    : (params?.id as string | undefined)
  const router = useRouter()

  const [contributions, setContributions] = useState<Contribution[]>([])
  const [counts, setCounts] = useState({ pending: 0, approved: 0, rejected: 0 })
  const [userId, setUserId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all')

  // Cargar datos principales
  useEffect(() => {
    if (!memorialId) return

    const fetchData = async () => {
      const { data: userData } = await supabase.auth.getUser()
      const uid = userData?.user?.id
      if (!uid) {
        router.push('/signin')
        return
      }
      setUserId(uid)

      // Verificar dueño
      const { data: memorialData } = await supabase
        .from('memorials')
        .select('created_by')
        .eq('id', memorialId)
        .single()

      if (!memorialData || memorialData.created_by !== uid) {
        alert('No tienes permiso para moderar este memorial.')
        router.push(`/memorial/${memorialId}`)
        return
      }

      await Promise.all([loadContributions(), loadCounts()])
    }

    fetchData()
  }, [memorialId, router])

  // Cargar aportes según filtro
  const loadContributions = async (status?: 'pending' | 'approved' | 'rejected') => {
    setLoading(true)
    let query = supabase
      .from('contributions')
      .select('*')
      .eq('memorial_id', memorialId)
      .order('created_at', { ascending: false })

    if (status) query = query.eq('status', status)

    const { data: contribData, error } = await query
    if (error) {
      console.error('Error cargando aportes:', error)
      setContributions([])
    } else {
      const enriched = await Promise.all(
        contribData.map(async (c) => {
          const { data: profile } = await supabase
            .from('profiles')
            .select('full_name, avatar_url')
            .eq('id', c.author_id)
            .single()
          return { ...c, users_profile: profile || null }
        })
      )
      setContributions(enriched)
    }
    setLoading(false)
  }

  // Cargar conteos
  const loadCounts = async () => {
    const statuses: ('pending' | 'approved' | 'rejected')[] = ['pending', 'approved', 'rejected']
    const results = await Promise.all(
      statuses.map(async (status) => {
        const { count } = await supabase
          .from('contributions')
          .select('id', { count: 'exact', head: true })
          .eq('memorial_id', memorialId)
          .eq('status', status)
        return { status, count: count || 0 }
      })
    )
    setCounts({
      pending: results.find((r) => r.status === 'pending')?.count || 0,
      approved: results.find((r) => r.status === 'approved')?.count || 0,
      rejected: results.find((r) => r.status === 'rejected')?.count || 0,
    })
  }

  const handleFilterChange = async (newFilter: 'all' | 'pending' | 'approved' | 'rejected') => {
    setFilter(newFilter)
    if (newFilter === 'all') await loadContributions()
    else await loadContributions(newFilter)
  }

  const handleAction = async (id: string, newStatus: 'approved' | 'rejected') => {
    const { error } = await supabase.from('contributions').update({ status: newStatus }).eq('id', id)
    if (error) {
      alert('Error actualizando el aporte.')
      console.error(error)
      return
    }
    await Promise.all([loadContributions(filter === 'all' ? undefined : filter), loadCounts()])
  }

  if (loading) return <div className="p-6">Cargando aportes...</div>

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-4">Moderar aportes</h1>
      <p className="text-gray-600 mb-6">
        Aquí puedes aprobar o rechazar los recuerdos enviados por los colaboradores.
      </p>

      {/* Filtros con contadores */}
      <div className="flex flex-wrap gap-2 mb-6">
        {[
          { label: 'Todos', value: 'all', count: counts.pending + counts.approved + counts.rejected },
          { label: 'Pendientes', value: 'pending', count: counts.pending },
          { label: 'Aprobados', value: 'approved', count: counts.approved },
          { label: 'Rechazados', value: 'rejected', count: counts.rejected },
        ].map((f) => (
          <button
            key={f.value}
            onClick={() => handleFilterChange(f.value as any)}
            className={`px-3 py-1.5 rounded-md text-sm font-medium border transition ${
              filter === f.value
                ? 'bg-black text-white border-black'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {f.label} ({f.count})
          </button>
        ))}
      </div>

      {contributions.length === 0 ? (
        <p className="text-gray-500">No hay aportes en esta categoría.</p>
      ) : (
        <ul className="space-y-6">
          {contributions.map((c) => (
            <li key={c.id} className="border rounded-lg p-4 bg-white shadow-sm">
              <div className="flex items-start gap-3 mb-3">
                {c.users_profile?.avatar_url ? (
                  <img
                    src={c.users_profile.avatar_url}
                    alt={c.users_profile.full_name || 'Usuario'}
                    className="w-10 h-10 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center text-sm">
                    {c.users_profile?.full_name?.charAt(0) ?? '?'}
                  </div>
                )}
                <div>
                  <p className="font-medium text-gray-800">
                    {c.users_profile?.full_name ?? 'Usuario anónimo'}
                  </p>
                  <p className="text-xs text-gray-500">
                    {new Date(c.created_at).toLocaleString()}
                  </p>
                </div>
              </div>

              {c.content && <p className="text-gray-700 mb-3">{c.content}</p>}

              {c.media_url && (
                <>
                  {c.media_url.endsWith('.mp4') ? (
                    <video src={c.media_url} controls className="rounded-lg max-w-full mb-3" />
                  ) : (
                    <img
                      src={c.media_url}
                      alt="Aporte multimedia"
                      className="rounded-lg max-w-full mb-3"
                    />
                  )}
                </>
              )}

              <div className="flex items-center justify-between mt-2">
                <span
                  className={`text-sm font-semibold ${
                    c.status === 'pending'
                      ? 'text-yellow-600'
                      : c.status === 'approved'
                      ? 'text-green-600'
                      : 'text-red-600'
                  }`}
                >
                  Estado: {c.status}
                </span>

                {c.status === 'pending' && (
                  <div className="flex gap-3">
                    <button
                      onClick={() => handleAction(c.id, 'approved')}
                      className="bg-green-600 text-white text-sm px-3 py-1 rounded hover:bg-green-700"
                    >
                      Aprobar
                    </button>
                    <button
                      onClick={() => handleAction(c.id, 'rejected')}
                      className="bg-red-600 text-white text-sm px-3 py-1 rounded hover:bg-red-700"
                    >
                      Rechazar
                    </button>
                  </div>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

