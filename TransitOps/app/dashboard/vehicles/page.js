'use client';

import { useEffect, useState } from 'react';
import { Truck, Search, Plus, Edit2, Trash2, Calendar, FileText, CheckCircle2, History, AlertCircle } from 'lucide-react';

export default function VehiclesPage() {
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    registrationNumber: '',
    name: '',
    model: '',
    type: 'Semi-Truck',
    maxLoadCapacity: '',
    odometerReading: '',
    acquisitionCost: '',
    insuranceExpiryDate: '',
    registrationExpiryDate: '',
    status: 'Available',
    documentUrl: '',
  });

  const [historyVehicle, setHistoryVehicle] = useState(null);
  const [historyLogs, setHistoryLogs] = useState(null);
  const [loadingHistory, setLoadingHistory] = useState(false);

  const fetchVehicles = async () => {
    setLoading(true);
    try {
      const query = new URLSearchParams();
      if (search) query.append('search', search);
      if (statusFilter) query.append('status', statusFilter);
      if (typeFilter) query.append('type', typeFilter);

      const res = await fetch(`/api/vehicles?${query.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setVehicles(data.data || []);
      }
    } catch (err) {
      setError('Failed to load vehicles.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVehicles();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, statusFilter, typeFilter]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    const url = editingId ? `/api/vehicles/${editingId}` : '/api/vehicles';
    const method = editingId ? 'PUT' : 'POST';

    try {
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (res.ok) {
        setSuccess(editingId ? 'Vehicle updated successfully!' : 'Vehicle added successfully!');
        setFormData({
          registrationNumber: '',
          name: '',
          model: '',
          type: 'Semi-Truck',
          maxLoadCapacity: '',
          odometerReading: '',
          acquisitionCost: '',
          insuranceExpiryDate: '',
          registrationExpiryDate: '',
          status: 'Available',
          documentUrl: '',
        });
        setShowForm(false);
        setEditingId(null);
        fetchVehicles();
      } else {
        setError(data.error || 'Operation failed.');
      }
    } catch (err) {
      setError('Network error. Try again.');
    }
  };

  const startEdit = (vehicle) => {
    setEditingId(vehicle._id);
    setFormData({
      registrationNumber: vehicle.registrationNumber,
      name: vehicle.name,
      model: vehicle.model,
      type: vehicle.type,
      maxLoadCapacity: vehicle.maxLoadCapacity,
      odometerReading: vehicle.odometerReading,
      acquisitionCost: vehicle.acquisitionCost,
      insuranceExpiryDate: vehicle.insuranceExpiryDate.split('T')[0],
      registrationExpiryDate: vehicle.registrationExpiryDate.split('T')[0],
      status: vehicle.status,
      documentUrl: vehicle.documentUrl || '',
    });
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this vehicle and all associated records?')) return;
    setError('');
    setSuccess('');

    try {
      const res = await fetch(`/api/vehicles/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setSuccess('Vehicle deleted successfully.');
        fetchVehicles();
        if (historyVehicle?._id === id) {
          setHistoryVehicle(null);
          setHistoryLogs(null);
        }
      } else {
        const data = await res.json();
        setError(data.error || 'Failed to delete vehicle.');
      }
    } catch (err) {
      setError('Failed to connect to delete service.');
    }
  };

  const loadHistory = async (vehicle) => {
    setLoadingHistory(true);
    setHistoryVehicle(vehicle);
    setHistoryLogs(null);
    try {
      const res = await fetch(`/api/vehicles/${vehicle._id}`);
      if (res.ok) {
        const data = await res.json();
        setHistoryLogs(data.data.history);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingHistory(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Available': return 'bg-success-bg text-success border-success';
      case 'On Trip': return 'bg-primary-subtle text-primary border-primary';
      case 'In Shop': return 'bg-warning-bg text-warning border-warning';
      case 'Retired': return 'bg-danger-bg text-danger border-danger';
      default: return 'bg-secondary text-white';
    }
  };

  const handleMockUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData(prev => ({ ...prev, documentUrl: `/uploads/${file.name}` }));
    }
  };

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="m-0 font-weight-bold">Fleet Registry</h2>
          <p className="text-secondary m-0" style={{ fontSize: '0.9rem' }}>Provision and manage vehicles in the operational fleet.</p>
        </div>
        <button
          className="btn btn-grad d-flex align-items-center gap-2"
          onClick={() => {
            setShowForm(!showForm);
            setEditingId(null);
            if (showForm) {
              setFormData({
                registrationNumber: '',
                name: '',
                model: '',
                type: 'Semi-Truck',
                maxLoadCapacity: '',
                odometerReading: '',
                acquisitionCost: '',
                insuranceExpiryDate: '',
                registrationExpiryDate: '',
                status: 'Available',
                documentUrl: '',
              });
            }
          }}
        >
          <Plus size={16} />
          <span>{showForm ? 'Hide Form' : 'Register Vehicle'}</span>
        </button>
      </div>

      {error && <div className="alert alert-danger d-flex align-items-center gap-2 py-2 mb-3" style={{ fontSize: '0.85rem' }}><AlertCircle size={16} />{error}</div>}
      {success && <div className="alert alert-success d-flex align-items-center gap-2 py-2 mb-3" style={{ fontSize: '0.85rem' }}><CheckCircle2 size={16} />{success}</div>}

      {showForm && (
        <div className="glass-panel mb-4">
          <h5 className="font-weight-bold mb-3">{editingId ? 'Edit Vehicle Details' : 'Register New Fleet Asset'}</h5>
          <form onSubmit={handleFormSubmit}>
            <div className="row g-3">
              <div className="col-12 col-md-3">
                <label className="form-label" style={{ fontSize: '0.8rem', fontWeight: 600 }}>Registration Number</label>
                <input type="text" className="form-control form-control-custom" name="registrationNumber" value={formData.registrationNumber} onChange={handleInputChange} placeholder="e.g. TX-123-CD" required />
              </div>
              <div className="col-12 col-md-3">
                <label className="form-label" style={{ fontSize: '0.8rem', fontWeight: 600 }}>Vehicle Name</label>
                <input type="text" className="form-control form-control-custom" name="name" value={formData.name} onChange={handleInputChange} placeholder="e.g. Ford Transit" required />
              </div>
              <div className="col-12 col-md-3">
                <label className="form-label" style={{ fontSize: '0.8rem', fontWeight: 600 }}>Vehicle Model</label>
                <input type="text" className="form-control form-control-custom" name="model" value={formData.model} onChange={handleInputChange} placeholder="e.g. 2023 T-350" required />
              </div>
              <div className="col-12 col-md-3">
                <label className="form-label" style={{ fontSize: '0.8rem', fontWeight: 600 }}>Vehicle Type</label>
                <select className="form-select form-control-custom" name="type" value={formData.type} onChange={handleInputChange}>
                  <option value="Semi-Truck">Semi-Truck</option>
                  <option value="Box Truck">Box Truck</option>
                  <option value="Van">Van</option>
                  <option value="Flatbed">Flatbed</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div className="col-12 col-md-3">
                <label className="form-label" style={{ fontSize: '0.8rem', fontWeight: 600 }}>Max Load Capacity (kg)</label>
                <input type="number" className="form-control form-control-custom" name="maxLoadCapacity" value={formData.maxLoadCapacity} onChange={handleInputChange} required />
              </div>
              <div className="col-12 col-md-3">
                <label className="form-label" style={{ fontSize: '0.8rem', fontWeight: 600 }}>Odometer Reading (km)</label>
                <input type="number" className="form-control form-control-custom" name="odometerReading" value={formData.odometerReading} onChange={handleInputChange} required />
              </div>
              <div className="col-12 col-md-3">
                <label className="form-label" style={{ fontSize: '0.8rem', fontWeight: 600 }}>Acquisition Cost ($)</label>
                <input type="number" className="form-control form-control-custom" name="acquisitionCost" value={formData.acquisitionCost} onChange={handleInputChange} required />
              </div>
              <div className="col-12 col-md-3">
                <label className="form-label" style={{ fontSize: '0.8rem', fontWeight: 600 }}>Operational Status</label>
                <select className="form-select form-control-custom" name="status" value={formData.status} onChange={handleInputChange}>
                  <option value="Available">Available</option>
                  <option value="On Trip">On Trip</option>
                  <option value="In Shop">In Shop</option>
                  <option value="Retired">Retired</option>
                </select>
              </div>

              <div className="col-12 col-md-4">
                <label className="form-label" style={{ fontSize: '0.8rem', fontWeight: 600 }}>Insurance Expiry Date</label>
                <input type="date" className="form-control form-control-custom" name="insuranceExpiryDate" value={formData.insuranceExpiryDate} onChange={handleInputChange} required />
              </div>
              <div className="col-12 col-md-4">
                <label className="form-label" style={{ fontSize: '0.8rem', fontWeight: 600 }}>Registration Expiry Date</label>
                <input type="date" className="form-control form-control-custom" name="registrationExpiryDate" value={formData.registrationExpiryDate} onChange={handleInputChange} required />
              </div>
              <div className="col-12 col-md-4">
                <label className="form-label" style={{ fontSize: '0.8rem', fontWeight: 600 }}>Document Upload (PDF/Image)</label>
                <input type="file" className="form-control form-control-custom" onChange={handleMockUpload} />
                {formData.documentUrl && <span className="text-success d-block mt-1" style={{ fontSize: '0.75rem' }}>✓ Document loaded: {formData.documentUrl.split('/').pop()}</span>}
              </div>
            </div>
            <div className="mt-3 text-end">
              <button type="submit" className="btn btn-grad">
                {editingId ? 'Save Changes' : 'Provision Asset'}
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="glass-panel mb-4 p-3 d-flex flex-wrap gap-2 align-items-center justify-content-between">
        <div className="d-flex align-items-center gap-2 flex-grow-1" style={{ maxWidth: '400px' }}>
          <div className="input-group">
            <span className="input-group-text bg-transparent border-end-0" style={{ borderColor: 'var(--border-color)' }}><Search size={16} /></span>
            <input type="text" className="form-control form-control-custom border-start-0" placeholder="Search by Reg #, Name, Model..." value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
        </div>
        <div className="d-flex gap-2">
          <select className="form-select form-control-custom" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
            <option value="">All Statuses</option>
            <option value="Available">Available</option>
            <option value="On Trip">On Trip</option>
            <option value="In Shop">In Shop</option>
            <option value="Retired">Retired</option>
          </select>
          <select className="form-select form-control-custom" value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)}>
            <option value="">All Types</option>
            <option value="Semi-Truck">Semi-Truck</option>
            <option value="Box Truck">Box Truck</option>
            <option value="Van">Van</option>
            <option value="Flatbed">Flatbed</option>
          </select>
        </div>
      </div>

      <div className="row g-4">
        <div className={historyVehicle ? 'col-12 col-lg-7' : 'col-12'}>
          <div className="row g-3">
            {loading ? (
              <div className="col-12 text-center py-4"><div className="spinner-border text-primary" /></div>
            ) : vehicles.length === 0 ? (
              <div className="col-12 text-center text-muted py-4">No vehicles matching your query found.</div>
            ) : (
              vehicles.map((v) => (
                <div key={v._id} className="col-12 col-md-6">
                  <div className="glass-card d-flex flex-column justify-content-between h-100">
                    <div>
                      <div className="d-flex justify-content-between align-items-start mb-2">
                        <span className={`badge border badge-custom ${getStatusColor(v.status)}`}>
                          {v.status}
                        </span>
                        <span className="text-muted" style={{ fontSize: '0.8rem', fontWeight: 600 }}>{v.type}</span>
                      </div>
                      <h5 className="m-0 font-weight-bold">{v.name}</h5>
                      <span className="text-muted" style={{ fontSize: '0.75rem' }}>{v.model}</span>
                      <p className="m-0 mt-2 style-reg" style={{ fontSize: '0.85rem', fontWeight: 600 }}>
                        Reg: <span className="text-primary">{v.registrationNumber}</span>
                      </p>

                      <div className="border-top pt-2 mt-2" style={{ borderColor: 'var(--border-color)', fontSize: '0.8rem' }}>
                        <div className="d-flex justify-content-between">
                          <span className="text-secondary">Odometer:</span>
                          <span>{v.odometerReading.toLocaleString()} km</span>
                        </div>
                        <div className="d-flex justify-content-between">
                          <span className="text-secondary">Load Limit:</span>
                          <span>{v.maxLoadCapacity.toLocaleString()} kg</span>
                        </div>
                      </div>
                    </div>

                    <div className="d-flex justify-content-between align-items-center mt-3 pt-2 border-top" style={{ borderColor: 'var(--border-color)' }}>
                      <button className="btn btn-sm btn-outline-secondary d-flex align-items-center gap-1" onClick={() => loadHistory(v)}>
                        <History size={12} />
                        <span>History</span>
                      </button>
                      <div className="d-flex gap-2">
                        <button className="btn btn-sm btn-outline-primary p-1.5" onClick={() => startEdit(v)} title="Edit Details"><Edit2 size={12} /></button>
                        <button className="btn btn-sm btn-outline-danger p-1.5" onClick={() => handleDelete(v._id)} title="Delete Asset"><Trash2 size={12} /></button>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {historyVehicle && (
          <div className="col-12 col-lg-5">
            <div className="glass-panel" style={{ position: 'sticky', top: '20px' }}>
              <div className="d-flex justify-content-between align-items-center mb-3 border-bottom pb-2" style={{ borderColor: 'var(--border-color)' }}>
                <h5 className="font-weight-bold m-0 d-flex align-items-center gap-2">
                  <History size={18} className="text-primary" />
                  <span>Asset History Log</span>
                </h5>
                <button className="btn-close" onClick={() => setHistoryVehicle(null)} />
              </div>

              <div className="mb-3">
                <h6 className="m-0 font-weight-bold">{historyVehicle.name}</h6>
                <span className="text-primary font-weight-bold" style={{ fontSize: '0.85rem' }}>{historyVehicle.registrationNumber}</span>
              </div>

              {loadingHistory ? (
                <div className="text-center py-4"><div className="spinner-border spinner-border-sm text-primary" /></div>
              ) : !historyLogs ? (
                <div className="text-muted text-center py-3">Could not load historical datasets.</div>
              ) : (
                <div className="overflow-auto" style={{ maxHeight: '420px' }}>
                  <div className="mb-4">
                    <h6 className="font-weight-bold border-bottom pb-1 mb-2 text-warning" style={{ fontSize: '0.85rem' }}>Maintenance Logs</h6>
                    {historyLogs.maintenance.length === 0 ? (
                      <span className="text-muted" style={{ fontSize: '0.75rem' }}>No maintenance records</span>
                    ) : (
                      historyLogs.maintenance.map((m) => (
                        <div key={m._id} className="p-2 mb-2 rounded bg-light-dark" style={{ backgroundColor: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-color)', fontSize: '0.75rem' }}>
                          <div className="d-flex justify-content-between font-weight-bold">
                            <span>{m.maintenanceType}</span>
                            <span>${m.cost}</span>
                          </div>
                          <span className="text-secondary d-block">{new Date(m.serviceDate).toLocaleDateString()}</span>
                          <span className="text-muted">{m.description}</span>
                        </div>
                      ))
                    )}
                  </div>

                  <div className="mb-4">
                    <h6 className="font-weight-bold border-bottom pb-1 mb-2 text-primary" style={{ fontSize: '0.85rem' }}>Completed Routes</h6>
                    {historyLogs.trips.filter(t => t.status === 'Completed').length === 0 ? (
                      <span className="text-muted" style={{ fontSize: '0.75rem' }}>No completed trips</span>
                    ) : (
                      historyLogs.trips.filter(t => t.status === 'Completed').map((t) => (
                        <div key={t._id} className="p-2 mb-2 rounded bg-light-dark" style={{ backgroundColor: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-color)', fontSize: '0.75rem' }}>
                          <div className="d-flex justify-content-between font-weight-bold">
                            <span className="text-truncate" style={{ maxWidth: '180px' }}>{t.sourceLocation} → {t.destinationLocation}</span>
                            <span className="text-success">+${t.revenueGenerated}</span>
                          </div>
                          <span className="text-secondary d-block">{t.plannedDistance} km | Driver: {t.assignedDriver?.name}</span>
                        </div>
                      ))
                    )}
                  </div>

                  <div>
                    <h6 className="font-weight-bold border-bottom pb-1 mb-2 text-success" style={{ fontSize: '0.85rem' }}>Fueling Logs</h6>
                    {historyLogs.fuel.length === 0 ? (
                      <span className="text-muted" style={{ fontSize: '0.75rem' }}>No fuel records</span>
                    ) : (
                      historyLogs.fuel.map((f) => (
                        <div key={f._id} className="p-2 mb-2 rounded bg-light-dark" style={{ backgroundColor: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-color)', fontSize: '0.75rem' }}>
                          <div className="d-flex justify-content-between font-weight-bold">
                            <span>{f.fuelStation}</span>
                            <span>${f.fuelCost}</span>
                          </div>
                          <span className="text-secondary d-block">{new Date(f.date).toLocaleDateString()} | Qty: {f.fuelQuantity}L</span>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
