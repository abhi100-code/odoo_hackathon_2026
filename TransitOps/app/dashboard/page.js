'use client';

import { useEffect, useState } from 'react';
import { Truck, Navigation, Users, Gauge, Fuel, Wrench, RefreshCw, AlertTriangle } from 'lucide-react';
import {
  VehicleStatusChart,
  ExpensesByCategoryChart,
  RevenueVsExpensesChart,
  DriverPerformanceChart,
} from '@/components/DashboardChart';

export default function DashboardHome() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchAnalytics = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/analytics');
      if (res.ok) {
        const result = await res.json();
        setData(result.data);
      } else {
        const errData = await res.json();
        setError(errData.error || 'Failed to fetch analytics.');
      }
    } catch (err) {
      setError('Could not connect to the analytics server.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  if (loading) {
    return (
      <div className="d-flex flex-column align-items-center justify-content-center py-5">
        <div className="spinner-border text-primary mb-3" role="status" />
        <span className="text-secondary">Synthesizing operational aggregates...</span>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="alert alert-danger d-flex align-items-center gap-2 p-3" role="alert">
        <AlertTriangle size={20} />
        <div>
          <h5 className="alert-heading m-0">Failed to load Dashboard Metrics</h5>
          <p className="m-0 mt-1" style={{ fontSize: '0.9rem' }}>{error || 'An unexpected error occurred.'}</p>
          <button className="btn btn-sm btn-outline-danger mt-3" onClick={fetchAnalytics}>
            Retry Load
          </button>
        </div>
      </div>
    );
  }

  const { metrics, charts } = data;

  const cardConfig = [
    { title: 'Active Vehicles', val: metrics.activeVehicles, subtitle: 'Currently on delivery', icon: <Truck size={22} className="text-primary" />, color: 'var(--primary)' },
    { title: 'Available Vehicles', val: metrics.availableVehicles, subtitle: 'Ready for dispatch', icon: <Truck size={22} className="text-success" />, color: 'var(--success)' },
    { title: 'Vehicles In Shop', val: metrics.shopVehicles, subtitle: 'Under repair / servicing', icon: <Wrench size={22} className="text-warning" />, color: 'var(--warning)' },
    { title: 'Active Trips', val: metrics.activeTrips, subtitle: 'Dispatched routes', icon: <Navigation size={22} className="text-primary" />, color: 'var(--primary)' },
    { title: 'Pending Trips', val: metrics.pendingTrips, subtitle: 'Awaiting dispatch', icon: <Navigation size={22} className="text-secondary" />, color: 'var(--text-secondary)' },
    { title: 'Drivers On Duty', val: metrics.activeDrivers, subtitle: 'Currently driving', icon: <Users size={22} className="text-success" />, color: 'var(--success)' },
    { title: 'Fleet Utilization', val: `${metrics.utilization}%`, subtitle: 'Active capacity percentage', icon: <Gauge size={22} className="text-info" />, color: 'var(--info)' },
    { title: 'Monthly Fuel Cost', val: `$${metrics.monthlyFuelCost.toLocaleString()}`, subtitle: 'Fuel category spend', icon: <Fuel size={22} className="text-danger" />, color: 'var(--danger)' },
    { title: 'Maintenance Cost', val: `$${metrics.monthlyMaintCost.toLocaleString()}`, subtitle: 'Servicing category spend', icon: <Wrench size={22} className="text-danger" />, color: 'var(--danger)' },
  ];

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="m-0 font-weight-bold">Control Tower Dashboard</h2>
          <p className="text-secondary m-0" style={{ fontSize: '0.9rem' }}>Real-time telemetry and resource performance overview.</p>
        </div>
        <button className="btn btn-outline-secondary d-flex align-items-center gap-2" onClick={fetchAnalytics} style={{ borderRadius: '10px' }}>
          <RefreshCw size={14} />
          <span>Refresh Feed</span>
        </button>
      </div>

      <div className="row g-3 mb-4">
        {cardConfig.map((card, i) => (
          <div key={i} className="col-12 col-md-4">
            <div className="glass-card d-flex align-items-center justify-content-between">
              <div>
                <span className="text-muted" style={{ fontSize: '0.8rem', fontWeight: 600, textTransform: 'uppercase' }}>{card.title}</span>
                <h3 className="m-0 my-1" style={{ fontWeight: 800 }}>{card.val}</h3>
                <span className="text-muted" style={{ fontSize: '0.75rem' }}>{card.subtitle}</span>
              </div>
              <div
                className="rounded-circle d-flex align-items-center justify-content-center shadow-sm"
                style={{ width: '46px', height: '46px', backgroundColor: 'rgba(255,255,255,0.08)', border: '1px solid var(--border-color)' }}
              >
                {card.icon}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="row g-4">
        <div className="col-12 col-lg-8">
          <div className="glass-panel" style={{ height: '360px' }}>
            <h5 className="font-weight-bold mb-3">Revenue vs Total Expenses</h5>
            <RevenueVsExpensesChart
              labels={charts.revenueVsExpenses.labels}
              revenue={charts.revenueVsExpenses.revenue}
              expenses={charts.revenueVsExpenses.expenses}
            />
          </div>
        </div>

        <div className="col-12 col-lg-4">
          <div className="glass-panel" style={{ height: '360px' }}>
            <h5 className="font-weight-bold mb-3">Vehicle Allocation Status</h5>
            <VehicleStatusChart data={charts.vehicleStatus} />
          </div>
        </div>

        <div className="col-12 col-lg-6">
          <div className="glass-panel" style={{ height: '340px' }}>
            <h5 className="font-weight-bold mb-3">Operating Expense Distribution</h5>
            <ExpensesByCategoryChart data={charts.expensesByCategory} />
          </div>
        </div>

        <div className="col-12 col-lg-6">
          <div className="glass-panel" style={{ height: '340px' }}>
            <h5 className="font-weight-bold mb-3">Driver Safety Scores</h5>
            <DriverPerformanceChart data={charts.driverPerformance} />
          </div>
        </div>
      </div>
    </div>
  );
}
