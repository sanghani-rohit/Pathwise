'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Bell, GraduationCap, Award, TrendingUp, Info, CheckCircle, MapPin } from 'lucide-react'
import { supabase } from '@/lib/supabase'

interface Notification {
  id: string
  user_id: string
  title: string
  description: string
  type: 'roadmap_created' | 'module_completed' | 'course_completed' | 'info'
  read: boolean
  created_at: string
  metadata: any
}

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchNotifications()

    // Set up realtime subscription
    const channel = supabase
      .channel('notifications-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'notifications'
        },
        () => {
          // Refresh notifications when changes occur
          fetchNotifications()
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  async function fetchNotifications() {
    try {
      setLoading(true)
      const { data: { session } } = await supabase.auth.getSession()

      if (!session) {
        setLoading(false)
        return
      }

      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', session.user.id)
        .order('created_at', { ascending: false })
        .limit(50)

      if (!error && data) {
        setNotifications(data)
      }
    } catch (error) {
      console.error('Error fetching notifications:', error)
    } finally {
      setLoading(false)
    }
  }

  async function markAsRead(notificationId: string) {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ read: true })
        .eq('id', notificationId)

      if (!error) {
        setNotifications(notifications.map(n =>
          n.id === notificationId ? { ...n, read: true } : n
        ))
      }
    } catch (error) {
      console.error('Error marking notification as read:', error)
    }
  }

  async function markAllAsRead() {
    try {
      const { data: { session } } = await supabase.auth.getSession()

      if (!session) return

      const { error } = await supabase
        .from('notifications')
        .update({ read: true })
        .eq('user_id', session.user.id)
        .eq('read', false)

      if (!error) {
        setNotifications(notifications.map(n => ({ ...n, read: true })))
      }
    } catch (error) {
      console.error('Error marking all as read:', error)
    }
  }

  function getNotificationIcon(type: string) {
    switch (type) {
      case 'roadmap_created':
        return MapPin
      case 'module_completed':
        return CheckCircle
      case 'course_completed':
        return Award
      default:
        return Info
    }
  }

  function getNotificationColor(type: string) {
    switch (type) {
      case 'roadmap_created':
        return { text: 'text-blue-600', bg: 'bg-blue-50' }
      case 'module_completed':
        return { text: 'text-green-600', bg: 'bg-green-50' }
      case 'course_completed':
        return { text: 'text-purple-600', bg: 'bg-purple-50' }
      default:
        return { text: 'text-gray-600', bg: 'bg-gray-50' }
    }
  }

  function formatTimeAgo(dateString: string): string {
    const date = new Date(dateString)
    const now = new Date()
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000)

    if (diffInSeconds < 60) return 'Just now'
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)} days ago`

    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  }

  const unreadCount = notifications.filter(n => !n.read).length

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center gap-3">
            Notifications
            {unreadCount > 0 && (
              <span className="text-sm bg-primary-600 text-white px-3 py-1 rounded-full">
                {unreadCount} new
              </span>
            )}
          </h1>
          <p className="text-gray-600">Stay updated with your learning journey</p>
        </div>
        {unreadCount > 0 && (
          <button
            onClick={markAllAsRead}
            className="px-4 py-2 text-primary-600 hover:text-primary-700 font-medium text-sm hover:bg-primary-50 rounded-lg transition-colors"
          >
            Mark all as read
          </button>
        )}
      </motion.div>

      {/* Loading State */}
      {loading && (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary-600"></div>
        </div>
      )}

      {/* Notifications List */}
      {!loading && notifications.length > 0 && (
        <div className="space-y-3">
          {notifications.map((notification, index) => {
            const Icon = getNotificationIcon(notification.type)
            const colors = getNotificationColor(notification.type)

            return (
              <motion.div
                key={notification.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                onClick={() => !notification.read && markAsRead(notification.id)}
                className={`bg-white rounded-xl p-5 shadow-md hover:shadow-lg transition-all cursor-pointer ${
                  !notification.read ? 'border-l-4 border-primary-600' : ''
                }`}
              >
                <div className="flex items-start gap-4">
                  {/* Icon */}
                  <div className={`${colors.bg} p-3 rounded-lg`}>
                    <Icon className={colors.text} size={24} />
                  </div>

                  {/* Content */}
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-1">
                      <h3 className="font-semibold text-gray-900">{notification.title}</h3>
                      {!notification.read && (
                        <span className="w-2 h-2 bg-primary-600 rounded-full"></span>
                      )}
                    </div>
                    <p className="text-sm text-gray-600 mb-2">{notification.description}</p>
                    <p className="text-xs text-gray-500">{formatTimeAgo(notification.created_at)}</p>
                  </div>
                </div>
              </motion.div>
            )
          })}
        </div>
      )}

      {/* Empty State */}
      {!loading && notifications.length === 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl p-12 shadow-lg text-center"
        >
          <Bell size={48} className="text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No notifications yet</h3>
          <p className="text-gray-600">We'll notify you when there's something new</p>
        </motion.div>
      )}
    </div>
  )
}
