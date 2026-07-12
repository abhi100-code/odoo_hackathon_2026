'use client';

import { useState } from 'react';
import Sidebar from '@/components/Sidebar';
import Navbar from '@/components/Navbar';
import { useAuth } from '@/components/AuthContext';
import { useRouter } from 'next/navigation';

export default function DashboardLayout({ children }) {
  const [showSidebar, setShowSidebar] = useState(false);
  const { user, loading } = useAuth();
  const router = useRouter();

  if (loading) {
    return (
      <div className="d-flex align-items-center justify-content-center" style={{ minHeight: '100vh', backgroundColor: 'var(--bg-primary)' }}>
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  if (!user) {
    if (typeof window !== 'undefined') {
      router.push('/');
    }
    return null;
  }

  return (
    <div style={{ backgroundColor: 'var(--bg-primary)', minHeight: '100vh' }}>
      {showSidebar && (
        <div
          className="position-fixed top-0 start-0 end-0 bottom-0 d-lg-none"
          onClick={() => setShowSidebar(false)}
          style={{ backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 999 }}
        />
      )}

      <div className={`sidebar-wrapper d-lg-block ${showSidebar ? 'show' : ''}`}>
        <Sidebar />
      </div>

      <div className="main-content">
        <Navbar onToggleSidebar={() => setShowSidebar(!showSidebar)} />
        <main>{children}</main>
      </div>
    </div>
  );
}
