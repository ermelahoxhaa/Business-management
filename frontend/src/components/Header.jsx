import { useNavigate, Link } from 'react-router-dom'
import { useState } from 'react'
import './Header.css'
import { getUserRole, isAuthenticated, logout } from '../services/auth'

const notifications = [
  { id: 1, label: 'New project request submitted.', time: '2m ago' },
  { id: 2, label: 'Payment reminder due tomorrow.', time: '1h ago' },
  { id: 3, label: 'New message from your team.', time: '3h ago' },
]

function NotificationModal({ open, onClose, items }) {
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
              <div key={notification.id} className="notification-modal__item">
                <p className="notification-modal__item-title">{notification.label}</p>
                <p className="notification-modal__item-time">{notification.time}</p>
              </div>
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

  const handleLogout = async () => {
    await logout()
    navigate('/home', { replace: true })
  }

  const unreadCount = notifications.length

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
      />
    </>
  )
}
