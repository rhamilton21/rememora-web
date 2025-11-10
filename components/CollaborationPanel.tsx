'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

interface CollaborationRequest {
  id: string
  memorial_id: string
  requester_id: string
  status: 'pending' | 'accepted' | 'rejected'
  message: string | null
  created_at: string
  requester?: { full_name?: string | null; avatar_url?: string | null }
}

export default function CollaborationPanel({ memorialId, memorialOwnerId }: { memorialId: string, memorialOwnerId: string }) {
  const [requests, setRequests] = useState<CollaborationRequest[]>([])
  const [isOwner, setIsOwner] = useState(false)
  const [userId, setUserId] = useState<string | null>(null)
  const [message, setMessage] = useState('')
  const [hasRequested, setHasRequested] = useState(false)

  // Cargar solicitudes
  useEffect(() => {
    const fetchData = async () => {
      const { data: userData } = await supabase.auth.getUser()
      const uid = userData?.user?.id
      if (!uid) return
      setUserId(uid)

      // Verificar si el usuario es el dueño
      setIsOwner(uid === memorialOwnerId)

      if (uid === memorialOwnerId) {
        const { data } = await supabase
          .from('collaboration_requests')
          .select('*, requester:users_profile(full_name, avatar_url)')
          .eq('memorial_id', memorialId)
          .order('created_at', { ascending: false })
        setRequests(data || [])
      } else {
        const { data } = await supabase
          .from('collaboration_requests')
          .select('*')
          .eq('memorial_id', memorialId)
          .eq('requester_id', uid)
        setHasRequested((data || []).length > 0)
      }
    }
    fetchData()
  }, [memorialId, memorialOwnerId])

  const handleRequestAccess = async () => {
    if (!userId) return
    const { error } = await supabase.from('collaboration_requests').insert({
      memorial_id: memorialId,
      requester_id: userId,
      message,
    })
    if (error) {
      alert('Error al enviar solicitud')
      console.error(error)
    } else {
      alert('Solicitud enviada correctamente')
      setHasRequested(true)
    }
  }

  const handleUpdateStatus = async (id: string, newStatus: 'accepted' | 'rejected') => {
    const { error } = await supabase
      .from('collaboration_requests')
      .update({ status: newStatus })
      .eq('id', id)
    if (error) {
      console.error(error)
    } else {
      setRequests((prev) =>
        prev.map((r) => (r.id === id ? { ...r, status: newStatus } : r))
      )
    }
  }

  return (
    <div className="mt-6 border-t pt-4">
      <h3 className="text-xl font-semibold mb-3">Colaboraciones</h3>

      {isOwner ? (
        <>
          {requests.length === 0 ? (
            <p className="text-gray-500">No hay solicitudes aún.</p>
          ) : (
            <ul className="space-y-3">
              {requests.map((r) => (
                <li key={r.id} className="border p-3 rounded">
                  <div className="flex items-center gap-3">
                    {r.requester?.avatar_url ? (
                      <img src={r.requester.avatar_url} alt="avatar" className="w-8 h-8 rounded-full" />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center text-xs">
                        {r.requester?.full_name?.[0] ?? '?'}
                      </div>
                    )}
                    <div>
                      <p className="font-medium">{r.requester?.full_name || 'Usuario'}</p>
                      <p className="text-sm text-gray-600">{r.message}</p>
                      <p className="text-xs text-gray-400">
                        {new Date(r.created_at).toLocaleString()}
                      </p>
                    </div>
                    <div className="ml-auto flex gap-2">
                      {r.status === 'pending' ? (
                        <>
                          <button
                            onClick={() => handleUpdateStatus(r.id, 'accepted')}
                            className="bg-green-500 text-white px-2 py-1 rounded text-xs"
                          >
                            Aceptar
                          </button>
                          <button
                            onClick={() => handleUpdateStatus(r.id, 'rejected')}
                            className="bg-red-500 text-white px-2 py-1 rounded text-xs"
                          >
                            Rechazar
                          </button>
                        </>
                      ) : (
                        <span
                          className={`text-xs font-semibold ${
                            r.status === 'accepted' ? 'text-green-600' : 'text-red-500'
                          }`}
                        >
                          {r.status === 'accepted' ? 'Aceptado' : 'Rechazado'}
                        </span>
                      )}
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </>
      ) : hasRequested ? (
        <p className="text-sm text-gray-600">Ya enviaste una solicitud de colaboración.</p>
      ) : (
        <div className="flex flex-col gap-2">
          <textarea
            placeholder="Escribe un mensaje al creador del memorial (opcional)"
            className="border rounded p-2 text-sm"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            rows={2}
          />
          <button
            onClick={handleRequestAccess}
            className="bg-blue-600 text-white px-3 py-2 rounded hover:bg-blue-700 text-sm self-end"
          >
            Solicitar acceso
          </button>
        </div>
      )}
    </div>
  )
}
