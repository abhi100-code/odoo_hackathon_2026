'use client';

import { useEffect, useState } from 'react';
import { Bell, AlertTriangle, Calendar, Info, Check } from 'lucide-react';

export default function NotificationBadge() {
  const [notifications, setNotifications] = useState([]);
  const [isOpen, setIsOpen] = useState(false);

  const fetchNotifications = async () => {
    try {
      const res = await fetch('/api/notifications');
      if (res.ok) {
        const data = await res.json();
        setNotifications(data.data || []);
      }
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
    }
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const markAllAsRead = async () => {
    try {
      const res = await fetch('/api/notifications', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      });
      if (res.ok) {
        setNotifications(notifications.map(n => ({ ...n, read: true })));
      }
    } catch (error) {
      console.error(error);
    }
  };

  const markAsRead = async (id) => {
    try {
      const res = await fetch('/api/notifications', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, read: true }),
      });
      if (res.ok) {
        setNotifications(notifications.map(n => n._id === id ? { ...n, read: true } : n));
      }
    } catch (error) {
      console.error(error);
    }
  };

  const getIcon = (type) => {
    switch (type) {
      case 'License Expiry':
        return <AlertTriangle className="text-warning" size={16} />;
      case 'Maintenance Due':
        return <Calendar className="text-danger" size={16} />;
      default:
        return <Info className="text-info" size={16} />;
    }
  };

  return (
    <div className="position-relative">
      <button
        className="btn btn-link nav-link position-relative p-2"
        onClick={() => setIsOpen(!isOpen)}
        style={{ color: 'var(--text-primary)' }}
      >
        <Bell size={20} />
        {unreadCount > 0 && (
          <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger" style={{ fontSize: '0.65rem' }}>
            {unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <>
          <div className="position-fixed top-0 start-0 end-0 bottom-0" onClick={() => setIsOpen(false)} style={{ zIndex: 999 }} />
          <div
            className="glass-card position-absolute end-0 mt-2 p-0 overflow-hidden"
            style={{ width: '320px', zIndex: 1000, maxHeight: '400px', display: 'flex', flexDirection: 'column' }}
          >
            <div className="d-flex justify-content-between align-items-center p-3 border-bottom" style={{ borderColor: 'var(--border-color)' }}>
              <h6 className="m-0 font-weight-bold">Notifications</h6>
              {unreadCount > 0 && (
                <button className="btn btn-sm btn-link text-decoration-none p-0" style={{ fontSize: '0.8rem', color: 'var(--primary)' }} onClick={markAllAsRead}>
                  Mark all read
                </button>
              )}
            </div>

            <div className="overflow-auto flex-grow-1" style={{ maxHeight: '300px' }}>
              {notifications.length === 0 ? (
                <div className="text-center p-4 text-muted" style={{ fontSize: '0.9rem' }}>
                  No notifications
                </div>
              ) : (
                notifications.map((n) => (
                  <div
                    key={n._id}
                    className="d-flex gap-2 p-3 border-bottom align-items-start"
                    style={{
                      borderColor: 'var(--border-color)',
                      backgroundColor: !n.read ? 'rgba(var(--primary-rgb), 0.05)' : 'transparent',
                      transition: 'background-color 0.2s',
                    }}
                  >
                    <div className="mt-1">{getIcon(n.type)}</div>
                    <div className="flex-grow-1">
                      <p className="m-0 mb-1" style={{ fontSize: '0.85rem', color: 'var(--text-primary)', lineHeight: '1.2' }}>
                        {n.message}
                      </p>
                      <span className="text-muted" style={{ fontSize: '0.7rem' }}>
                        {new Date(n.date).toLocaleString()}
                      </span>
                    </div>
                    {!n.read && (
                      <button
                        className="btn btn-sm p-1 rounded-circle hover-bg"
                        style={{ alignSelf: 'center', border: '1px solid var(--border-color)' }}
                        onClick={() => markAsRead(n._id)}
                        title="Mark as read"
                      >
                        <Check size={12} className="text-muted" />
                      </button>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
