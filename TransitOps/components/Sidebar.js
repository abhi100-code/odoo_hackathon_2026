'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from './AuthContext';
import { LayoutDashboard, Truck, Users, Route, Wrench, Fuel, Landmark, BarChart3, LogOut } from 'lucide-react';

export default function Sidebar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();

  if (!user) return null;

  const menuItems = [
    {
      name: 'Dashboard',
      path: '/dashboard',
      icon: <LayoutDashboard size={18} />,
      roles: ['Fleet Manager', 'Dispatcher', 'Safety Officer', 'Financial Analyst', 'Transport Administrator'],
    },
    {
      name: 'Vehicles',
      path: '/dashboard/vehicles',
      icon: <Truck size={18} />,
      roles: ['Fleet Manager', 'Safety Officer', 'Transport Administrator'],
    },
    {
      name: 'Drivers',
      path: '/dashboard/drivers',
      icon: <Users size={18} />,
      roles: ['Fleet Manager', 'Safety Officer', 'Transport Administrator'],
    },
    {
      name: 'Trips & Dispatch',
      path: '/dashboard/trips',
      icon: <Route size={18} />,
      roles: ['Dispatcher', 'Transport Administrator'],
    },
    {
      name: 'Maintenance',
      path: '/dashboard/maintenance',
      icon: <Wrench size={18} />,
      roles: ['Fleet Manager', 'Safety Officer', 'Transport Administrator'],
    },
    {
      name: 'Fuel Tracking',
      path: '/dashboard/fuel',
      icon: <Fuel size={18} />,
      roles: ['Fleet Manager', 'Financial Analyst', 'Transport Administrator'],
    },
    {
      name: 'Expenses',
      path: '/dashboard/expenses',
      icon: <Landmark size={18} />,
      roles: ['Financial Analyst', 'Transport Administrator'],
    },
    {
      name: 'Reports & Analytics',
      path: '/dashboard/analytics',
      icon: <BarChart3 size={18} />,
      roles: ['Financial Analyst', 'Transport Administrator'],
    },
  ];

  const visibleMenu = menuItems.filter((item) => item.roles.includes(user.role));

  return (
    <aside className="sidebar-wrapper d-flex flex-column justify-content-between">
      <div>
        <div className="d-flex align-items-center gap-2 mb-4 px-2">
          <div className="bg-primary rounded p-2 text-white d-flex align-items-center justify-content-center" style={{ width: '40px', height: '40px' }}>
            <Truck size={24} />
          </div>
          <div>
            <h5 className="m-0 font-weight-bold" style={{ fontSize: '1.2rem', background: 'linear-gradient(135deg, var(--primary), var(--accent))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              TransitOps
            </h5>
            <span className="text-muted" style={{ fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: '1px' }}>Operations Suite</span>
          </div>
        </div>

        <nav>
          {visibleMenu.map((item) => {
            const isActive = pathname === item.path;
            return (
              <Link
                key={item.path}
                href={item.path}
                className={`nav-link-custom ${isActive ? 'active' : ''}`}
              >
                {item.icon}
                <span>{item.name}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="border-top pt-3" style={{ borderColor: 'var(--border-color)' }}>
        <div className="d-flex align-items-center gap-3 px-2 mb-3">
          <div className="rounded-circle bg-primary text-white d-flex align-items-center justify-content-center" style={{ width: '38px', height: '38px', fontWeight: 'bold' }}>
            {user.name.charAt(0)}
          </div>
          <div className="overflow-hidden">
            <h6 className="m-0 text-truncate" style={{ fontSize: '0.9rem', fontWeight: 600 }}>{user.name}</h6>
            <span className="badge-custom bg-secondary text-truncate d-inline-block" style={{ fontSize: '0.65rem', padding: '0.15rem 0.4rem', color: 'var(--text-secondary)' }}>
              {user.role}
            </span>
          </div>
        </div>

        <button
          onClick={logout}
          className="btn btn-outline-danger w-100 d-flex align-items-center justify-content-center gap-2 py-2"
          style={{ borderRadius: '10px' }}
        >
          <LogOut size={16} />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
}
