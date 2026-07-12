'use client';

import { useEffect, useState } from 'react';
import { Users, Search, Plus, Edit2, Trash2, Shield, Calendar, Phone, CheckCircle2, AlertCircle } from 'lucide-react';

export default function DriversPage() {
  const [drivers, setDrivers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    licenseNumber: '',
    licenseCategory: '',
    licenseExpiryDate: '',
    contactNumber: '',
    safetyScore: 100,
    emergencyContact: '',
    status: 'Available',
  });

  const fetchDrivers = async () => {
    setLoading(true);
    try {
      const query = new URLSearchParams();
      if (search) query.append('search', search);
      if (statusFilter) query.append('status', statusFilter);

      const res = await fetch(`/api/drivers?${query.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setDrivers(data.data || []);
      }
    } catch (err) {
      setError('Failed to load drivers.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDrivers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, statusFilter]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    const url = editingId ? `/api/drivers/${editingId}` : '/api/drivers';
    const method = editingId ? 'PUT' : 'POST';

    try {
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (res.ok) {
        setSuccess(editingId ? 'Driver updated successfully!' : 'Driver registered successfully!');
        setFormData({
          name: '',
          licenseNumber: '',
          licenseCategory: '',
          licenseExpiryDate: '',
          contactNumber: '',
          safetyScore: 100,
          emergencyContact: '',
          status: 'Available',
        });
        setShowForm(false);
        setEditingId(null);
        fetchDrivers();
      } else {
        setError(data.error || 'Operation failed.');
      }
    } catch (err) {
      setError('Network error. Try again.');
    }
  };

  const startEdit = (driver) => {
    setEditingId(driver._id);
    setFormData({
      name: driver.name,
      licenseNumber: driver.licenseNumber,
      licenseCategory: driver.licenseCategory,
      licenseExpiryDate: driver.licenseExpiryDate.split('T')[0],
      contactNumber: driver.contactNumber,
      safetyScore: driver.safetyScore,
      emergencyContact: driver.emergencyContact,
      status: driver.status,
    });
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this driver?')) return;
    setError('');
    setSuccess('');

    try {
      const res = await fetch(`/api/drivers/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setSuccess('Driver record deleted.');
        fetchDrivers();
      } else {
        const data = await res.json();
        setError(data.error || 'Failed to delete driver.');
      }
    } catch (err) {
      setError('Could not connect to delete service.');
    }
  };

  const isLicenseExpired = (expiryDate) => {
    return new Date(expiryDate) < new Date();
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Available': return 'bg-success-bg text-success border-success';
      case 'On Trip': return 'bg-primary-subtle text-primary border-primary';
      case 'Off Duty': return 'bg-secondary-subtle text-secondary border-secondary';
      case 'Suspended': return 'bg-danger-bg text-danger border-danger';
      default: return 'bg-secondary text-white';
    }
  };

  const getSafetyColor = (score) => {
    if (score >= 90) return 'text-success';
    if (score >= 75) return 'text-warning';
    return 'text-danger';
  };

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="m-0 font-weight-bold">Driver Registry</h2>
          <p className="text-secondary m-0" style={{ fontSize: '0.9rem' }}>Administer driver status, licensing details, and safety scores.</p>
        </div>
        <button
          className="btn btn-grad d-flex align-items-center gap-2"
          onClick={() => {
            setShowForm(!showForm);
            setEditingId(null);
            if (showForm) {
              setFormData({
                name: '',
                licenseNumber: '',
                licenseCategory: '',
                licenseExpiryDate: '',
                contactNumber: '',
                safetyScore: 100,
                emergencyContact: '',
                status: 'Available',
              });
            }
          }}
        >
          <Plus size={16} />
          <span>{showForm ? 'Hide Form' : 'Register Driver'}</span>
        </button>
      </div>

      {error && <div className="alert alert-danger d-flex align-items-center gap-2 py-2 mb-3" style={{ fontSize: '0.85rem' }}><AlertCircle size={16} />{error}</div>}
      {success && <div className="alert alert-success d-flex align-items-center gap-2 py-2 mb-3" style={{ fontSize: '0.85rem' }}><CheckCircle2 size={16} />{success}</div>}

      {showForm && (
        <div className="glass-panel mb-4">
          <h5 className="font-weight-bold mb-3">{editingId ? 'Edit Driver Profile' : 'Register New Operator'}</h5>
          <form onSubmit={handleFormSubmit}>
            <div className="row g-3">
              <div className="col-12 col-md-4">
                <label className="form-label" style={{ fontSize: '0.8rem', fontWeight: 600 }}>Driver Full Name</label>
                <input type="text" className="form-control form-control-custom" name="name" value={formData.name} onChange={handleInputChange} placeholder="e.g. Robert Garcia" required />
              </div>
              <div className="col-12 col-md-4">
                <label className="form-label" style={{ fontSize: '0.8rem', fontWeight: 600 }}>License Number</label>
                <input type="text" className="form-control form-control-custom" name="licenseNumber" value={formData.licenseNumber} onChange={handleInputChange} placeholder="e.g. DL-1234567" required />
              </div>
              <div className="col-12 col-md-4">
                <label className="form-label" style={{ fontSize: '0.8rem', fontWeight: 600 }}>License Category</label>
                <input type="text" className="form-control form-control-custom" name="licenseCategory" value={formData.licenseCategory} onChange={handleInputChange} placeholder="e.g. Class A CDL" required />
              </div>

              <div className="col-12 col-md-3">
                <label className="form-label" style={{ fontSize: '0.8rem', fontWeight: 600 }}>License Expiry Date</label>
                <input type="date" className="form-control form-control-custom" name="licenseExpiryDate" value={formData.licenseExpiryDate} onChange={handleInputChange} required />
              </div>
              <div className="col-12 col-md-3">
                <label className="form-label" style={{ fontSize: '0.8rem', fontWeight: 600 }}>Contact Number</label>
                <input type="text" className="form-control form-control-custom" name="contactNumber" value={formData.contactNumber} onChange={handleInputChange} placeholder="e.g. +1-555-0100" required />
              </div>
              <div className="col-12 col-md-3">
                <label className="form-label" style={{ fontSize: '0.8rem', fontWeight: 600 }}>Safety Rating (0-100)</label>
                <input type="number" className="form-control form-control-custom" name="safetyScore" min="0" max="100" value={formData.safetyScore} onChange={handleInputChange} required />
              </div>
              <div className="col-12 col-md-3">
                <label className="form-label" style={{ fontSize: '0.8rem', fontWeight: 600 }}>Operator Status</label>
                <select className="form-select form-control-custom" name="status" value={formData.status} onChange={handleInputChange}>
                  <option value="Available">Available</option>
                  <option value="On Trip">On Trip</option>
                  <option value="Off Duty">Off Duty</option>
                  <option value="Suspended">Suspended</option>
                </select>
              </div>

              <div className="col-12">
                <label className="form-label" style={{ fontSize: '0.8rem', fontWeight: 600 }}>Emergency Contact Details</label>
                <input type="text" className="form-control form-control-custom" name="emergencyContact" value={formData.emergencyContact} onChange={handleInputChange} placeholder="e.g. Spouse Name (Phone #)" required />
              </div>
            </div>
            <div className="mt-3 text-end">
              <button type="submit" className="btn btn-grad">
                {editingId ? 'Save Profile' : 'Register Operator'}
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="glass-panel mb-4 p-3 d-flex flex-wrap gap-2 align-items-center justify-content-between">
        <div className="d-flex align-items-center gap-2 flex-grow-1" style={{ maxWidth: '400px' }}>
          <div className="input-group">
            <span className="input-group-text bg-transparent border-end-0" style={{ borderColor: 'var(--border-color)' }}><Search size={16} /></span>
            <input type="text" className="form-control form-control-custom border-start-0" placeholder="Search by name, license number..." value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
        </div>
        <div>
          <select className="form-select form-control-custom" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
            <option value="">All Statuses</option>
            <option value="Available">Available</option>
            <option value="On Trip">On Trip</option>
            <option value="Off Duty">Off Duty</option>
            <option value="Suspended">Suspended</option>
          </select>
        </div>
      </div>

      <div className="row g-3">
        {loading ? (
          <div className="col-12 text-center py-4"><div className="spinner-border text-primary" /></div>
        ) : drivers.length === 0 ? (
          <div className="col-12 text-center text-muted py-4">No driver records found.</div>
        ) : (
          drivers.map((d) => {
            const isExpired = isLicenseExpired(d.licenseExpiryDate);
            return (
              <div key={d._id} className="col-12 col-md-6 col-lg-4">
                <div className="glass-card d-flex flex-column justify-content-between h-100">
                  <div>
                    <div className="d-flex justify-content-between align-items-start mb-2">
                      <span className={`badge border badge-custom ${getStatusColor(d.status)}`}>
                        {d.status}
                      </span>
                      <div className="d-flex align-items-center gap-1">
                        <Shield size={14} className={getSafetyColor(d.safetyScore)} />
                        <span className={`font-weight-bold ${getSafetyColor(d.safetyScore)}`} style={{ fontSize: '0.85rem' }}>{d.safetyScore}</span>
                      </div>
                    </div>

                    <h5 className="m-0 font-weight-bold">{d.name}</h5>
                    <span className="text-muted" style={{ fontSize: '0.75rem' }}>Category: {d.licenseCategory}</span>

                    <div className="border-top pt-2 mt-3" style={{ borderColor: 'var(--border-color)', fontSize: '0.8rem' }}>
                      <div className="d-flex justify-content-between align-items-center mb-1">
                        <span className="text-secondary">License:</span>
                        <span className="font-weight-bold text-primary">{d.licenseNumber}</span>
                      </div>
                      <div className="d-flex justify-content-between align-items-center mb-1">
                        <span className="text-secondary">License Expiry:</span>
                        <span className={isExpired ? 'text-danger font-weight-bold' : ''}>
                          {new Date(d.licenseExpiryDate).toLocaleDateString()}
                          {isExpired && ' (Expired)'}
                        </span>
                      </div>
                      <div className="d-flex justify-content-between align-items-center mb-1">
                        <span className="text-secondary"><Phone size={12} className="me-1" />Contact:</span>
                        <span>{d.contactNumber}</span>
                      </div>
                    </div>

                    <div className="mt-2 p-2 rounded bg-light-dark" style={{ backgroundColor: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-color)', fontSize: '0.75rem' }}>
                      <span className="text-secondary d-block font-weight-bold">Emergency Contact:</span>
                      <span className="text-muted">{d.emergencyContact}</span>
                    </div>
                  </div>

                  <div className="d-flex justify-content-end gap-2 mt-3 pt-2 border-top" style={{ borderColor: 'var(--border-color)' }}>
                    <button className="btn btn-sm btn-outline-primary p-1.5" onClick={() => startEdit(d)} title="Edit Operator Profile"><Edit2 size={12} /></button>
                    <button className="btn btn-sm btn-outline-danger p-1.5" onClick={() => handleDelete(d._id)} title="Delete Operator"><Trash2 size={12} /></button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
