'use client';

import { useState } from 'react';
import { useAuth } from '@/components/AuthContext';
import { Truck, Lock, Mail, Database, AlertCircle, CheckCircle2 } from 'lucide-react';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [seedStatus, setSeedStatus] = useState({ loading: false, msg: '', success: false });

  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await login(email, password);
      if (!res.success) {
        setError(res.error || 'Invalid credentials');
      }
    } catch (err) {
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSeed = async () => {
    setSeedStatus({ loading: true, msg: 'Clearing and seeding database...', success: false });
    try {
      const res = await fetch('/api/seed');
      if (res.ok) {
        const data = await res.json();
        setSeedStatus({
          loading: false,
          msg: `${data.message} ${data.usersCount} users created. Use 'admin@transitops.com' & 'password123' to log in.`,
          success: true,
        });
        setEmail('admin@transitops.com');
        setPassword('password123');
      } else {
        setSeedStatus({ loading: false, msg: 'Seeding failed. Make sure MongoDB is running.', success: false });
      }
    } catch (err) {
      setSeedStatus({ loading: false, msg: 'Failed to contact database seeding service.', success: false });
    }
  };

  return (
    <div
      className="d-flex align-items-center justify-content-center min-vh-100 p-3"
      style={{
        background: 'radial-gradient(circle at 10% 20%, rgba(99, 102, 241, 0.15) 0%, transparent 40%), radial-gradient(circle at 90% 80%, rgba(139, 92, 246, 0.15) 0%, transparent 40%), var(--bg-primary)',
      }}
    >
      <div className="w-100" style={{ maxWidth: '450px' }}>
        <div className="text-center mb-4">
          <div
            className="d-inline-flex align-items-center justify-content-center bg-primary text-white rounded-circle p-3 mb-3 shadow"
            style={{ width: '60px', height: '60px' }}
          >
            <Truck size={32} />
          </div>
          <h2 className="font-weight-extrabold" style={{ letterSpacing: '-0.5px' }}>TransitOps</h2>
          <p className="text-secondary" style={{ fontSize: '0.95rem' }}>Smart Transport Operations Platform</p>
        </div>

        <div className="glass-card">
          <h4 className="text-center mb-4" style={{ fontWeight: 700 }}>Operator Sign In</h4>

          {error && (
            <div className="alert alert-danger d-flex align-items-center gap-2 py-2" role="alert" style={{ fontSize: '0.85rem' }}>
              <AlertCircle size={16} />
              <div>{error}</div>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label className="form-label" style={{ fontSize: '0.85rem', fontWeight: 600 }}>Email Address</label>
              <div className="input-group">
                <span className="input-group-text bg-transparent border-end-0" style={{ borderColor: 'var(--border-color)' }}>
                  <Mail size={16} className="text-secondary" />
                </span>
                <input
                  type="email"
                  className="form-control form-control-custom border-start-0"
                  placeholder="name@transitops.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="mb-4">
              <label className="form-label" style={{ fontSize: '0.85rem', fontWeight: 600 }}>Password</label>
              <div className="input-group">
                <span className="input-group-text bg-transparent border-end-0" style={{ borderColor: 'var(--border-color)' }}>
                  <Lock size={16} className="text-secondary" />
                </span>
                <input
                  type="password"
                  className="form-control form-control-custom border-start-0"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
            </div>

            <button type="submit" className="btn-grad w-100 py-2.5 d-flex align-items-center justify-content-center gap-2" disabled={loading}>
              {loading ? (
                <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true" />
              ) : (
                'Access Control Panel'
              )}
            </button>
          </form>
        </div>

        {/* Developer Sandbox Seeding Utility */}
        <div className="glass-card mt-4 text-center p-3" style={{ borderStyle: 'dashed' }}>
          <div className="d-flex align-items-center justify-content-between mb-2">
            <span className="badge bg-primary-subtle text-primary" style={{ fontSize: '0.7rem' }}>Odoo Hackathon Setup</span>
            <button
              onClick={handleSeed}
              className="btn btn-sm btn-outline-primary d-flex align-items-center gap-1"
              disabled={seedStatus.loading}
              style={{ borderRadius: '8px' }}
            >
              <Database size={14} />
              <span>Auto-Seed DB</span>
            </button>
          </div>
          <p className="text-muted text-start m-0" style={{ fontSize: '0.75rem', lineHeight: '1.4' }}>
            Click &quot;Auto-Seed DB&quot; to initialize vehicles, drivers, expenses, and accounts.
          </p>

          {seedStatus.msg && (
            <div className={`mt-3 alert d-flex align-items-start gap-2 text-start p-2 m-0`} style={{ fontSize: '0.8rem', backgroundColor: seedStatus.success ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)', color: seedStatus.success ? 'var(--success)' : 'var(--danger)', border: 'none' }}>
              {seedStatus.success ? <CheckCircle2 size={16} className="mt-0.5" /> : <AlertCircle size={16} className="mt-0.5" />}
              <div>{seedStatus.msg}</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
