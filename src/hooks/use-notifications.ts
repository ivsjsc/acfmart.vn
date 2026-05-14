import { useEffect, useState } from "react"
import {
  notificationService,
  type NotificationDoc,
} from "../lib/firestore-notification"
import { useAuthStore } from "../stores/auth-store"

export function useNotifications() {
  const userId = useAuthStore((s) => s.user?.id)
  const [notifications, setNotifications] = useState<NotificationDoc[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!userId) {
      setNotifications([])
      setLoading(false)
      return
    }
    setLoading(true)
    const unsub = notificationService.subscribe(userId, (next) => {
      setNotifications(next)
      setLoading(false)
    })
    return unsub
  }, [userId])

  const unreadCount = notifications.filter((n) => !n.read).length

  return {
    notifications,
    unreadCount,
    loading,
    markRead: notificationService.markRead,
    markAllRead: () => (userId ? notificationService.markAllRead(userId) : Promise.resolve(0)),
  }
}
