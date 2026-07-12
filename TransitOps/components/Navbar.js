'use client';

import ThemeToggle from './ThemeToggle';
import NotificationBadge from './NotificationBadge';
import { Menu, Truck } from 'lucide-react';

export default function Navbar({ onToggleSidebar }) {
  return (
    <header
      className="glass-panel d-flex justify-content-between align-items-center mb-4 py-2 px-3 shadow-sm"
      style={{ borderRadius: '12px', border: '1px solid var(--border-color)' }}
    >
      <div className="d-flex align-items-center gap-2">
        <button
          className="btn btn-link p-2 text-decoration-none d-lg-none"
          style={{ color: 'var(--text-primary)' }}
          onClick={onToggleSidebar}
        >
          <Menu size={22} />
        </button>
        <div className="d-flex align-items-center gap-2">
          <Truck size={20} className="text-primary d-lg-none" />
          <h5 className="m-0 font-weight-bold" style={{ fontSize: '1.1rem' }}>
            Operations Control Panel
          </h5>
        </div>
      </div>

      <div className="d-flex align-items-center gap-3">
        <ThemeToggle />
        <span className="text-muted d-none d-sm-inline" style={{ fontSize: '1.2rem' }}>|</span>
        <NotificationBadge />
      </div>
    </header>
  );
}
