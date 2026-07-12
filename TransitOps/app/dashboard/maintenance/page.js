'use client';

import { useEffect, useState } from 'react';
import { Wrench, Plus, Check, Clock, AlertCircle, CheckCircle2 } from 'lucide-react';

export default function MaintenancePage() {
  const [logs, setLogs] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    vehicle: '',
    maintenanceType: 'Oil Change',
    description: '',
    cost: '',
    serviceDate: '',
    vendorName: '',
    nextServiceDate: '',
    status: 'Open',
  });

  const fetchData = async () => {
    setLoading(true);
    setError('');
    try {
      const logsRes = await fetch('/api/maintenance');
      const vehiclesRes = await fetch('/api/vehicles');

      if (logsRes.ok && vehiclesRes.ok) {
        const logsData = await logsRes.json();
        const vehiclesData = await vehiclesRes.json();

        setLogs(logsData.data || []);
        setVehicles((vehiclesData.data || []).filter(v => v.status !== 'Retired'));
      } else {
        setError('Failed to fetch maintenance dataset.');
      }
    } catch (err) {
      setError('Connection failed.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      const res = await fetch('/api/maintenance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (res.ok) {
        setSuccess('Maintenance log created. Vehicle set to "In Shop".');
        setFormData({
          vehicle: '',
          maintenanceType: 'Oil Change',
          description: '',
          cost: '',
          serviceDate: '',
          vendorName: '',
          nextServiceDate: '',
          status: 'Open',
        });
        setShowForm(false);
        fetchData();
      } else {
        setError(data.error || 'Failed to submit maintenance log.');
      }
    } catch (err) {
      setError('Failed to connect to server.');
    }
  };

  const closeMaintenance = async (id) => {
    setError('');
    setSuccess('');
    try {
      const res = await fetch(`/api/maintenance/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'Closed' }),
      });

      if (res.ok) {
        setSuccess('Maintenance closed. Vehicle restored to "Available".');
        fetchData();
      } else {
        const data = await res.json();
        setError(data.error || 'Failed to close log.');
      }
    } catch (err) {
      setError('Network communication failed.');
    }
  };

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="m-0 font-weight-bold">Maintenance Center</h2>
          <p className="text-secondary m-0" style={{ fontSize: '0.9rem' }}>Schedule repairs, track oil changes, and monitor shop status.</p>
        </div>
        <button
          className="btn btn-grad d-flex align-items-center gap-2"
          onClick={() => setShowForm(!showForm)}
        >
          <Plus size={16} />
          <span>{showForm ? 'Hide Form' : 'Log Maintenance'}</span>
        </button>
      </div>

      {error && <div className="alert alert-danger d-flex align-items-center gap-2 py-2 mb-3" style={{ fontSize: '0.85rem' }}><AlertCircle size={16} />{error}</div>}
      {success && <div className="alert alert-success d-flex align-items-center gap-2 py-2 mb-3" style={{ fontSize: '0.85rem' }}><CheckCircle2 size={16} />{success}</div>}

      {showForm && (
        <div className="glass-panel mb-4">
          <h5 className="font-weight-bold mb-3">Log Maintenance Event</h5>
          <form onSubmit={handleFormSubmit}>
            <div className="row g-3">
              <div className="col-12 col-md-6">
                <label className="form-label" style={{ fontSize: '0.8rem', fontWeight: 600 }}>Select Vehicle</label>
                <select className="form-select form-control-custom" name="vehicle" value={formData.vehicle} onChange={handleInputChange} required>
                  <option value="">Choose a Vehicle...</option>
                  {vehicles.map((v) => (
                    <option key={v._id} value={v._id}>
                      {v.name} ({v.registrationNumber}) - Current: {v.status}
                    </option>
                  ))}
                </select>
              </div>
              <div className="col-12 col-md-6">
                <label className="form-label" style={{ fontSize: '0.8rem', fontWeight: 600 }}>Maintenance Type</label>
                <select className="form-select form-control-custom" name="maintenanceType" value={formData.maintenanceType} onChange={handleInputChange}>
                  <option value="Oil Change">Oil Change</option>
                  <option value="Brake Service">Brake Service</option>
                  <option value="Tire Replacement">Tire Replacement</option>
                  <option value="Engine Repair">Engine Repair</option>
                  <option value="General Service">General Service</option>
                </select>
              </div>

              <div className="col-12 col-md-4">
                <label className="form-label" style={{ fontSize: '0.8rem', fontWeight: 600 }}>Total Service Cost ($)</label>
                <input type="number" className="form-control form-control-custom" name="cost" value={formData.cost} onChange={handleInputChange} placeholder="e.g. 350" required />
              </div>
              <div className="col-12 col-md-8">
                <label className="form-label" style={{ fontSize: '0.8rem', fontWeight: 600 }}>Vendor / Repair Shop Name</label>
                <input type="text" className="form-control form-control-custom" name="vendorName" value={formData.vendorName} onChange={handleInputChange} placeholder="e.g. Midtown Fleet Repairs" required />
              </div>

              <div className="col-12 col-md-6">
                <label className="form-label" style={{ fontSize: '0.8rem', fontWeight: 600 }}>Service Date</label>
                <input type="date" className="form-control form-control-custom" name="serviceDate" value={formData.serviceDate} onChange={handleInputChange} required />
              </div>
              <div className="col-12 col-md-6">
                <label className="form-label" style={{ fontSize: '0.8rem', fontWeight: 600 }}>Next Service Date (Due)</label>
                <input type="date" className="form-control form-control-custom" name="nextServiceDate" value={formData.nextServiceDate} onChange={handleInputChange} required />
              </div>

              <div className="col-12">
                <label className="form-label" style={{ fontSize: '0.8rem', fontWeight: 600 }}>Detailed Description</label>
                <textarea className="form-control form-control-custom" name="description" rows="2" value={formData.description} onChange={handleInputChange} placeholder="Describe parts replaced or issues diagnosed..."></textarea>
              </div>
            </div>
            <div className="mt-3 text-end">
              <button type="submit" className="btn btn-grad">
                Record Maintenance
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="glass-panel p-0 overflow-hidden">
        <div className="table-responsive">
          <table className="table table-hover align-middle mb-0" style={{ color: 'var(--text-primary)' }}>
            <thead style={{ backgroundColor: 'rgba(255,255,255,0.02)' }}>
              <tr>
                <th className="px-4 py-3">Vehicle</th>
                <th className="py-3">Service Details</th>
                <th className="py-3">Service Date</th>
                <th className="py-3">Next Due Date</th>
                <th className="py-3">Vendor</th>
                <th className="py-3 text-end">Cost</th>
                <th className="py-3 text-center">Status</th>
                <th className="py-3 text-center px-4">Action</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="8" className="text-center py-4"><div className="spinner-border text-primary" /></td></tr>
              ) : logs.length === 0 ? (
                <tr><td colSpan="8" className="text-center py-4 text-muted">No maintenance events recorded.</td></tr>
              ) : (
                logs.map((log) => (
                  <tr key={log._id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                    <td className="px-4 py-3">
                      {log.vehicle ? (
                        <>
                          <div className="font-weight-bold" style={{ fontSize: '0.85rem' }}>{log.vehicle.name}</div>
                          <span className="text-primary" style={{ fontSize: '0.75rem', fontWeight: 600 }}>{log.vehicle.registrationNumber}</span>
                        </>
                      ) : (
                        <span className="text-danger" style={{ fontSize: '0.8rem' }}>Deleted Vehicle</span>
                      )}
                    </td>
                    <td>
                      <div className="font-weight-bold" style={{ fontSize: '0.85rem' }}>{log.maintenanceType}</div>
                      <span className="text-muted text-truncate d-inline-block" style={{ fontSize: '0.75rem', maxWidth: '200px' }} title={log.description}>{log.description || 'No description'}</span>
                    </td>
                    <td><span style={{ fontSize: '0.85rem' }}>{new Date(log.serviceDate).toLocaleDateString()}</span></td>
                    <td><span style={{ fontSize: '0.85rem' }}>{new Date(log.nextServiceDate).toLocaleDateString()}</span></td>
                    <td><span style={{ fontSize: '0.85rem' }}>{log.vendorName}</span></td>
                    <td className="text-end font-weight-bold" style={{ fontSize: '0.85rem' }}>${log.cost.toLocaleString()}</td>
                    <td className="text-center">
                      <span className={`badge badge-custom ${log.status === 'Open' ? 'bg-warning text-white' : 'bg-success text-white'}`}>
                        {log.status === 'Open' ? 'In Shop' : 'Completed'}
                      </span>
                    </td>
                    <td className="text-center px-4">
                      {log.status === 'Open' ? (
                        <button
                          className="btn btn-sm btn-outline-success d-flex align-items-center gap-1 mx-auto py-1"
                          onClick={() => closeMaintenance(log._id)}
                        >
                          <Check size={12} />
                          <span>Close Log</span>
                        </button>
                      ) : (
                        <span className="text-success d-flex align-items-center justify-content-center gap-1" style={{ fontSize: '0.8rem' }}>
                          <Check size={14} /> Completed
                        </span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
