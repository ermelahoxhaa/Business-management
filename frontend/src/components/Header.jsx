import { useNavigate, Link } from 'react-router-dom'
import { useCallback, useEffect, useState } from 'react'
import './Header.css'
import { getUserRole, isAuthenticated, logout, getToken } from '../services/auth'
import { getNotifications, markNotificationRead } from '../services/api'
import { connectSocket, disconnectSocket } from '../services/socket'

const formatTimeAgo = (dateValue) => {
  const date = new Date(dateValue)
  const diffMs = Date.now() - date.getTime()
  const minutes = Math.floor(diffMs / 60000)
  if (minutes < 1) return 'Just now'
  if (minutes < 60) return `${minutes}m ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  return `${days}d ago`
}

function NotificationModal({ open, onClose, items, onMarkRead }) {
  if (!open) return null

  return (
    <div className="notification-modal">
      <div className="notification-modal__panel">
        <div className="notification-modal__header">
          <div>
            <h2 className="notification-modal__title">Notifications</h2>
            <p className="notification-modal__subtitle">Recent updates for your account</p>
          </div>
          <button
            onClick={onClose}
            className="notification-modal__close"
            aria-label="Close notifications"
          >
            ×
          </button>
        </div>

        <div className="notification-modal__content">
          {items.length ? (
            items.map((notification) => (
              <button
                key={notification.id}
                type="button"
                onClick={() => onMarkRead(notification)}
                className="notification-modal__item w-full text-left"
              >
                <p className="notification-modal__item-title">{notification.title}</p>
                <p className="text-sm text-slate-500">{notification.message}</p>
                <p className="notification-modal__item-time">{formatTimeAgo(notification.created_at)}</p>
              </button>
            ))
          ) : (
            <div className="notification-modal__empty">No notifications yet.</div>
          )}
        </div>
      </div>
    </div>
  )
}

export default function Header() {
  const navigate = useNavigate()
  const isLoggedIn = isAuthenticated()
  const userRole = getUserRole()
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false)
  const [notifications, setNotifications] = useState([])
  const [unreadCount, setUnreadCount] = useState(0)

  const loadNotifications = useCallback(async () => {
    if (!isLoggedIn) return
    try {
      const response = await getNotifications()
      setNotifications(response.data.items || [])
      setUnreadCount(response.data.unread || 0)
    } catch {
      setNotifications([])
      setUnreadCount(0)
    }
  }, [isLoggedIn])

  useEffect(() => {
    if (!isLoggedIn || !getToken()) {
      disconnectSocket()
      return undefined
    }

    loadNotifications()
    connectSocket((payload) => {
      setNotifications((current) => [payload, ...current])
      setUnreadCount((count) => count + 1)
    })

    return () => disconnectSocket()
  }, [isLoggedIn, loadNotifications])

  const handleMarkRead = async (notification) => {
    if (!notification.read_at) {
      try {
        await markNotificationRead(notification.id)
        setNotifications((current) =>
          current.map((item) =>
            item.id === notification.id ? { ...item, read_at: new Date().toISOString() } : item
          )
        )
        setUnreadCount((count) => Math.max(0, count - 1))
      } catch {
        // ignore
      }
    }
  }

  const handleLogout = async () => {
    disconnectSocket()
    await logout()
    navigate('/home', { replace: true })
  }

  return (
    <>
      <header className="header">
        <div className="header__brand">Business-Management</div>

        <nav className="flex gap-6 text-gray-600">
          <Link to={isLoggedIn && userRole === 'employee' ? '/home' : '/'} className="hover:text-black transition">
            Home
          </Link>
          <Link to="/about" className="hover:text-black transition">
            About Us
          </Link>
        </nav>

        <div className="header__actions">
          {isLoggedIn && (
            <>
              {userRole === 'employee' && (
                <button
                  type="button"
                  onClick={() => navigate('/settings')}
                  className="header__notify-button"
                  aria-label="Open settings"
                >
                  <svg viewBox="0 0 24 24" width="20" height="20" className="header__notify-icon" aria-hidden="true">
                    <path d="M19.43 12.98c.04-.32.07-.65.07-.98s-.02-.66-.07-.98l2.11-1.65-2-3.46-2.49 1a7.3 7.3 0 0 0-1.69-.98L15 3.25h-4l-.36 2.68c-.6.24-1.17.57-1.69.98l-2.49-1-2 3.46 2.11 1.65c-.04.32-.07.65-.07.98s.02.66.07.98l-2.11 1.65 2 3.46 2.49-1c.52.41 1.09.74 1.69.98l.36 2.68h4l.36-2.68c.6-.24 1.17-.57 1.69-.98l2.49 1 2-3.46-2.11-1.65ZM13 15.5A3.5 3.5 0 1 1 13 8a3.5 3.5 0 0 1 0 7.5Z" />
                  </svg>
                </button>
              )}
              <button
                type="button"
                onClick={() => setIsNotificationsOpen(true)}
                className="header__notify-button"
                aria-label="Open notifications"
              >
                <svg viewBox="0 0 24 24" width="20" height="20" className="header__notify-icon" aria-hidden="true">
                  <path d="M12 2a6 6 0 0 0-6 6v4.5L4 14.5v1h16v-1l-2-2V8a6 6 0 0 0-6-6Zm0 18a2.5 2.5 0 0 0 2.45-2h-4.9A2.5 2.5 0 0 0 12 20Zm-4-8V8a4 4 0 1 1 8 0v6H8Z" />
                </svg>
                {unreadCount > 0 && (
                  <span className="header__notify-badge">{unreadCount}</span>
                )}
              </button>
            </>
          )}

          {!isLoggedIn ? (
            <button onClick={() => navigate('/login')} className="header__button">
              Login
            </button>
          ) : (
            <button onClick={handleLogout} className="header__button">
              Logout
            </button>
          )}
        </div>
      </header>

      <NotificationModal
        open={isNotificationsOpen}
        onClose={() => setIsNotificationsOpen(false)}
        items={notifications}
        onMarkRead={handleMarkRead}
      />
    </>
  )
}
