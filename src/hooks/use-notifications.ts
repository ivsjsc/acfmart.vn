import { useEffect, useState } from "react"
import {
  notificationService,
  type NotificationDoc,
} from "../lib/firestore-notification"
import { useAuthStore } from "../stores/auth-store"
import { useFirebaseAuthReady } from "./use-firebase-auth-ready"

export function useNotifications() {
  const authReady = useFirebaseAuthReady()
  const userId = useAuthStore((s) => s.user?.id)
  const [notifications, setNotifications] = useState<NotificationDoc[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!authReady) {
      setNotifications([])
      setLoading(true)
      return
    }
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
  }, [authReady, userId])

  const unreadCount = notifications.filter((n) => !n.read).length

  return {
    notifications,
    unreadCount,
    loading,
    markRead: notificationService.markRead,
    markAllRead: () => (authReady && userId ? notificationService.markAllRead(userId) : Promise.resolve(0)),
  }
}
