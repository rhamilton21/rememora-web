'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

interface Notification {
  id: string
  user_id: string
  message: string
  created_at: string
  read: boolean
  actor_name?: string | null
  actor_avatar?: string | null
}

export default function NotificationsMenu() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [open, setOpen] = useState(false)
  const [userId, setUserId] = useState<string | null>(null)

  // Carga inicial
  useEffect(() => {
    const load = async () => {
      const { data: userData } = await supabase.auth.getUser()
      const id = userData?.user?.id
      if (!id) return
      setUserId(id)

      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', id)
        .order('created_at', { ascending: false })
        .limit(50)

      if (error) {
        console.error('Error cargando notificaciones:', error)
        return
      }
      setNotifications(data || [])
    }
    load()
  }, [])

  // Realtime: INSERT y UPDATE
  useEffect(() => {
    if (!userId) return

    const channel = supabase
      .channel('notifications-realtime')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'notifications', filter: `user_id=eq.${userId}` },
        (payload) => {
          const n = payload.new as Notification
          setNotifications((prev) => [n, ...prev])
        }
      )
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'notifications', filter: `user_id=eq.${userId}` },
        (payload) => {
          const n = payload.new as Notification
          setNotifications((prev) => prev.map((x) => (x.id === n.id ? (n as Notification) : x)))
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [userId])

  // Marcar TODAS como leídas
  const markAllAsRead = async () => {
    if (!userId) return

    const { data, error } = await supabase
      .from('notifications')
      .update({ read: true })
      .eq('user_id', userId)
      .is('read', false)        // solo las no leídas
      .select('id')             // devuelve ids afectadas

    if (error) {
      console.error('Error marcando como leídas:', error)
      return
    }

    const updatedIds = new Set((data ?? []).map((r) => r.id))
    if (updatedIds.size === 0) return

    setNotifications((prev) =>
      prev.map((n) => (updatedIds.has(n.id) ? { ...n, read: true } : n))
    )
  }

  const unreadCount = notifications.filter((n) => !n.read).length

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="relative bg-gray-100 rounded-full p-2 hover:bg-gray-200"
        aria-label="Abrir notificaciones"
      >
        {/* icono textual para el ejemplo */}
        🔔
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full px-1">
            {unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-80 bg-white border rounded-lg shadow-xl z-50">
          <div className="flex justify-between items-center border-b p-2">
            <h4 className="font-semibold text-sm">Notificaciones</h4>
            {notifications.length > 0 && (
              <button
                onClick={markAllAsRead}
                className="text-xs text-blue-600 hover:underline"
              >
                Marcar como leídas
              </button>
            )}
          </div>

          {notifications.length === 0 ? (
            <p className="p-3 text-sm text-gray-500">No hay notificaciones</p>
          ) : (
            <ul className="max-h-96 overflow-y-auto">
              {notifications.map((n) => (
                <li
                  key={n.id}
                  className={`flex items-start gap-3 p-3 border-b transition ${
                    n.read ? 'bg-white' : 'bg-blue-50'
                  }`}
                >
                  {n.actor_avatar ? (
                    <img
                      src={n.actor_avatar}
                      alt={n.actor_name || 'Usuario'}
                      className="w-10 h-10 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center text-sm">
                      {n.actor_name ? n.actor_name.charAt(0) : '?'}
                    </div>
                  )}

                  <div className="flex-1">
                    <p className={`text-sm ${n.read ? 'text-gray-700' : 'font-medium text-gray-900'}`}>
                      {n.message}
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                      {new Date(n.created_at).toLocaleString()}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  )
}

