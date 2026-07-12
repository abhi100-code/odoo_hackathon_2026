'use client';

import { useEffect, useState } from 'react';
import { Route, Plus, Check, Play, Ban, Trash2, Edit2, AlertCircle, CheckCircle2 } from 'lucide-react';

export default function TripsPage() {
  const [trips, setTrips] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    sourceLocation: '',
    destinationLocation: '',
    assignedVehicle: '',
    assignedDriver: '',
    cargoWeight: '',
    plannedDistance: '',
    revenueGenerated: '',
    status: 'Draft',
  });

  const fetchData = async () => {
    setLoading(true);
    setError('');
    try {
      const tripsRes = await fetch('/api/trips');
      const vehiclesRes = await fetch('/api/vehicles');
      const driversRes = await fetch('/api/drivers');

      if (tripsRes.ok && vehiclesRes.ok && driversRes.ok) {
        const tripsData = await tripsRes.json();
        const vehiclesData = await vehiclesRes.json();
        const driversData = await driversRes.json();

        setTrips(tripsData.data || []);
        setVehicles((vehiclesData.data || []).filter(v => v.status !== 'Retired'));
        setDrivers((driversData.data || []).filter(d => d.status !== 'Suspended'));
      } else {
        setError('Failed to fetch data logs.');
      }
    } catch (err) {
      setError('Connection failure.');
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

    const url = editingId ? `/api/trips/${editingId}` : '/api/trips';
    const method = editingId ? 'PUT' : 'POST';

    try {
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (res.ok) {
        setSuccess(editingId ? 'Trip updated successfully.' : 'Trip planned successfully.');
        setFormData({
          sourceLocation: '',
          destinationLocation: '',
          assignedVehicle: '',
          assignedDriver: '',
          cargoWeight: '',
          plannedDistance: '',
          revenueGenerated: '',
          status: 'Draft',
        });
        setShowForm(false);
        setEditingId(null);
        fetchData();
      } else {
        setError(data.error || 'Operation failed.');
      }
    } catch (err) {
      setError('Connection failed.');
    }
  };

  const updateTripStatus = async (id, status) => {
    setError('');
    setSuccess('');
    try {
      const res = await fetch(`/api/trips/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });

      const data = await res.json();
      if (res.ok) {
        setSuccess(`Trip status updated to: ${status}`);
        fetchData();
      } else {
        setError(data.error || 'Failed to update status.');
      }
    } catch (err) {
      setError('Network connection error.');
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this trip record?')) return;
    setError('');
    setSuccess('');
    try {
      const res = await fetch(`/api/trips/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setSuccess('Trip deleted successfully.');
        fetchData();
      } else {
        const data = await res.json();
        setError(data.error || 'Failed to delete.');
      }
    } catch (err) {
      setError('Failed to connect to delete service.');
    }
  };

  const startEdit = (trip) => {
    setEditingId(trip._id);
    setFormData({
      sourceLocation: trip.sourceLocation,
      destinationLocation: trip.destinationLocation,
      assignedVehicle: trip.assignedVehicle?._id || '',
      assignedDriver: trip.assignedDriver?._id || '',
      cargoWeight: trip.cargoWeight,
      plannedDistance: trip.plannedDistance,
      revenueGenerated: trip.revenueGenerated,
      status: trip.status,
    });
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const getStatusClass = (status) => {
    switch (status) {
      case 'Draft': return 'bg-secondary text-white';
      case 'Dispatched': return 'bg-primary text-white';
      case 'Completed': return 'bg-success text-white';
      case 'Cancelled': return 'bg-danger text-white';
      default: return 'bg-secondary text-white';
    }
  };

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="m-0 font-weight-bold">Dispatch Control Board</h2>
          <p className="text-secondary m-0" style={{ fontSize: '0.9rem' }}>Plan, dispatch, and track active trip lifecycles.</p>
        </div>
        <button
          className="btn btn-grad d-flex align-items-center gap-2"
          onClick={() => {
            setShowForm(!showForm);
            setEditingId(null);
            if (showForm) {
              setFormData({
                sourceLocation: '',
                destinationLocation: '',
                assignedVehicle: '',
                assignedDriver: '',
                cargoWeight: '',
                plannedDistance: '',
                revenueGenerated: '',
                status: 'Draft',
              });
            }
          }}
        >
          <Plus size={16} />
          <span>{showForm ? 'Hide Form' : 'Plan Trip'}</span>
        </button>
      </div>

      {error && <div className="alert alert-danger d-flex align-items-center gap-2 py-2 mb-3" style={{ fontSize: '0.85rem' }}><AlertCircle size={16} />{error}</div>}
      {success && <div className="alert alert-success d-flex align-items-center gap-2 py-2 mb-3" style={{ fontSize: '0.85rem' }}><CheckCircle2 size={16} />{success}</div>}

      {showForm && (
        <div className="glass-panel mb-4">
          <h5 className="font-weight-bold mb-3">{editingId ? 'Edit Planned Route' : 'Plan New Route Dispatch'}</h5>
          <form onSubmit={handleFormSubmit}>
            <div className="row g-3">
              <div className="col-12 col-md-6">
                <label className="form-label" style={{ fontSize: '0.8rem', fontWeight: 600 }}>Source Location</label>
                <input type="text" className="form-control form-control-custom" name="sourceLocation" value={formData.sourceLocation} onChange={handleInputChange} placeholder="e.g. Austin Warehouse A" required />
              </div>
              <div className="col-12 col-md-6">
                <label className="form-label" style={{ fontSize: '0.8rem', fontWeight: 600 }}>Destination Location</label>
                <input type="text" className="form-control form-control-custom" name="destinationLocation" value={formData.destinationLocation} onChange={handleInputChange} placeholder="e.g. Dallas Store 14" required />
              </div>

              <div className="col-12 col-md-6">
                <label className="form-label" style={{ fontSize: '0.8rem', fontWeight: 600 }}>Assign Vehicle</label>
                <select className="form-select form-control-custom" name="assignedVehicle" value={formData.assignedVehicle} onChange={handleInputChange} required>
                  <option value="">Select a Vehicle...</option>
                  {vehicles.map((v) => (
                    <option key={v._id} value={v._id}>
                      {v.name} ({v.registrationNumber}) - Status: {v.status} | Cap: {v.maxLoadCapacity}kg
                    </option>
                  ))}
                </select>
              </div>
              <div className="col-12 col-md-6">
                <label className="form-label" style={{ fontSize: '0.8rem', fontWeight: 600 }}>Assign Driver</label>
                <select className="form-select form-control-custom" name="assignedDriver" value={formData.assignedDriver} onChange={handleInputChange} required>
                  <option value="">Select a Driver...</option>
                  {drivers.map((d) => (
                    <option key={d._id} value={d._id}>
                      {d.name} ({d.licenseCategory}) - Status: {d.status} | Expiry: {new Date(d.licenseExpiryDate).toLocaleDateString()}
                    </option>
                  ))}
                </select>
              </div>

              <div className="col-12 col-md-4">
                <label className="form-label" style={{ fontSize: '0.8rem', fontWeight: 600 }}>Cargo Weight (kg)</label>
                <input type="number" className="form-control form-control-custom" name="cargoWeight" value={formData.cargoWeight} onChange={handleInputChange} required />
              </div>
              <div className="col-12 col-md-4">
                <label className="form-label" style={{ fontSize: '0.8rem', fontWeight: 600 }}>Planned Distance (km)</label>
                <input type="number" className="form-control form-control-custom" name="plannedDistance" value={formData.plannedDistance} onChange={handleInputChange} required />
              </div>
              <div className="col-12 col-md-4">
                <label className="form-label" style={{ fontSize: '0.8rem', fontWeight: 600 }}>Revenue Generated ($)</label>
                <input type="number" className="form-control form-control-custom" name="revenueGenerated" value={formData.revenueGenerated} onChange={handleInputChange} required />
              </div>
            </div>
            <div className="mt-3 text-end">
              <button type="submit" className="btn btn-grad">
                {editingId ? 'Save Route' : 'Schedule Trip'}
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
                <th className="px-4 py-3">Route details</th>
                <th className="py-3">Assigned Asset</th>
                <th className="py-3">Assigned Driver</th>
                <th className="py-3 text-end">Cargo Weight</th>
                <th className="py-3 text-end">Distance</th>
                <th className="py-3 text-end">Revenue</th>
                <th className="py-3 text-center">Status</th>
                <th className="py-3 text-center px-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="8" className="text-center py-4"><div className="spinner-border text-primary" /></td></tr>
              ) : trips.length === 0 ? (
                <tr><td colSpan="8" className="text-center py-4 text-muted">No scheduled trips.</td></tr>
              ) : (
                trips.map((t) => (
                  <tr key={t._id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                    <td className="px-4 py-3">
                      <div className="font-weight-bold" style={{ fontSize: '0.9rem' }}>{t.sourceLocation}</div>
                      <div className="text-secondary" style={{ fontSize: '0.75rem' }}>to {t.destinationLocation}</div>
                    </td>
                    <td>
                      {t.assignedVehicle ? (
                        <>
                          <div className="font-weight-bold" style={{ fontSize: '0.85rem' }}>{t.assignedVehicle.name}</div>
                          <span className="text-primary" style={{ fontSize: '0.75rem', fontWeight: 600 }}>{t.assignedVehicle.registrationNumber}</span>
                        </>
                      ) : (
                        <span className="text-danger" style={{ fontSize: '0.8rem' }}>Unassigned / Deleted</span>
                      )}
                    </td>
                    <td>
                      {t.assignedDriver ? (
                        <>
                          <div className="font-weight-bold" style={{ fontSize: '0.85rem' }}>{t.assignedDriver.name}</div>
                          <span className="text-secondary" style={{ fontSize: '0.75rem' }}>CDL: {t.assignedDriver.licenseNumber}</span>
                        </>
                      ) : (
                        <span className="text-danger" style={{ fontSize: '0.8rem' }}>Unassigned / Deleted</span>
                      )}
                    </td>
                    <td className="text-end font-weight-bold" style={{ fontSize: '0.85rem' }}>{t.cargoWeight.toLocaleString()} kg</td>
                    <td className="text-end font-weight-bold" style={{ fontSize: '0.85rem' }}>{t.plannedDistance} km</td>
                    <td className="text-end font-weight-bold text-success" style={{ fontSize: '0.85rem' }}>${t.revenueGenerated.toLocaleString()}</td>
                    <td className="text-center">
                      <span className={`badge badge-custom ${getStatusClass(t.status)}`}>{t.status}</span>
                    </td>
                    <td className="text-center px-4">
                      <div className="d-flex justify-content-center gap-2">
                        {t.status === 'Draft' && (
                          <>
                            <button
                              className="btn btn-sm btn-outline-primary d-flex align-items-center gap-1 py-1"
                              onClick={() => updateTripStatus(t._id, 'Dispatched')}
                            >
                              <Play size={12} />
                              <span>Dispatch</span>
                            </button>
                            <button className="btn btn-sm btn-outline-secondary p-1" onClick={() => startEdit(t)}><Edit2 size={12} /></button>
                          </>
                        )}
                        {t.status === 'Dispatched' && (
                          <>
                            <button
                              className="btn btn-sm btn-outline-success d-flex align-items-center gap-1 py-1"
                              onClick={() => updateTripStatus(t._id, 'Completed')}
                            >
                              <Check size={12} />
                              <span>Complete</span>
                            </button>
                            <button
                              className="btn btn-sm btn-outline-danger d-flex align-items-center gap-1 py-1"
                              onClick={() => updateTripStatus(t._id, 'Cancelled')}
                            >
                              <Ban size={12} />
                              <span>Cancel</span>
                            </button>
                          </>
                        )}
                        {t.status === 'Draft' && (
                          <button className="btn btn-sm btn-outline-danger p-1" onClick={() => handleDelete(t._id)}><Trash2 size={12} /></button>
                        )}
                        {t.status === 'Cancelled' && (
                          <button className="btn btn-sm btn-outline-danger p-1" onClick={() => handleDelete(t._id)}><Trash2 size={12} /></button>
                        )}
                      </div>
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
