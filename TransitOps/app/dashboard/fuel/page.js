'use client';

import { useEffect, useState } from 'react';
import { Fuel, Plus, Search, AlertCircle, CheckCircle2 } from 'lucide-react';

export default function FuelPage() {
  const [logs, setLogs] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    vehicle: '',
    driver: '',
    fuelQuantity: '',
    fuelCost: '',
    odometerReading: '',
    fuelStation: '',
    date: '',
  });

  const fetchData = async () => {
    setLoading(true);
    setError('');
    try {
      const logsRes = await fetch('/api/fuel');
      const vehiclesRes = await fetch('/api/vehicles');
      const driversRes = await fetch('/api/drivers');

      if (logsRes.ok && vehiclesRes.ok && driversRes.ok) {
        const logsData = await logsRes.json();
        const vehiclesData = await vehiclesRes.json();
        const driversData = await driversRes.json();

        setLogs(logsData.data || []);
        setVehicles((vehiclesData.data || []).filter(v => v.status !== 'Retired'));
        setDrivers((driversData.data || []).filter(d => d.status !== 'Suspended'));
      } else {
        setError('Failed to fetch fueling logs.');
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

    try {
      const res = await fetch('/api/fuel', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (res.ok) {
        setSuccess('Fuel purchase recorded successfully.');
        setFormData({
          vehicle: '',
          driver: '',
          fuelQuantity: '',
          fuelCost: '',
          odometerReading: '',
          fuelStation: '',
          date: '',
        });
        setShowForm(false);
        fetchData();
      } else {
        setError(data.error || 'Failed to submit fuel log.');
      }
    } catch (err) {
      setError('Connection error. Try again.');
    }
  };

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="m-0 font-weight-bold">Fuel Registry</h2>
          <p className="text-secondary m-0" style={{ fontSize: '0.9rem' }}>Log refuel events, track fuel efficiency, and monitor fuel stations.</p>
        </div>
        <button
          className="btn btn-grad d-flex align-items-center gap-2"
          onClick={() => setShowForm(!showForm)}
        >
          <Plus size={16} />
          <span>{showForm ? 'Hide Form' : 'Log Refueling'}</span>
        </button>
      </div>

      {error && <div className="alert alert-danger d-flex align-items-center gap-2 py-2 mb-3" style={{ fontSize: '0.85rem' }}><AlertCircle size={16} />{error}</div>}
      {success && <div className="alert alert-success d-flex align-items-center gap-2 py-2 mb-3" style={{ fontSize: '0.85rem' }}><CheckCircle2 size={16} />{success}</div>}

      {showForm && (
        <div className="glass-panel mb-4">
          <h5 className="font-weight-bold mb-3">Record Refuel Event</h5>
          <form onSubmit={handleFormSubmit}>
            <div className="row g-3">
              <div className="col-12 col-md-6">
                <label className="form-label" style={{ fontSize: '0.8rem', fontWeight: 600 }}>Select Vehicle</label>
                <select className="form-select form-control-custom" name="vehicle" value={formData.vehicle} onChange={handleInputChange} required>
                  <option value="">Choose a Vehicle...</option>
                  {vehicles.map((v) => (
                    <option key={v._id} value={v._id}>
                      {v.name} ({v.registrationNumber}) - Odo: {v.odometerReading} km
                    </option>
                  ))}
                </select>
              </div>
              <div className="col-12 col-md-6">
                <label className="form-label" style={{ fontSize: '0.8rem', fontWeight: 600 }}>Select Driver</label>
                <select className="form-select form-control-custom" name="driver" value={formData.driver} onChange={handleInputChange} required>
                  <option value="">Choose a Driver...</option>
                  {drivers.map((d) => (
                    <option key={d._id} value={d._id}>
                      {d.name} ({d.licenseCategory})
                    </option>
                  ))}
                </select>
              </div>

              <div className="col-12 col-md-4">
                <label className="form-label" style={{ fontSize: '0.8rem', fontWeight: 600 }}>Fuel Quantity (Liters)</label>
                <input type="number" step="0.01" className="form-control form-control-custom" name="fuelQuantity" value={formData.fuelQuantity} onChange={handleInputChange} placeholder="e.g. 150" required />
              </div>
              <div className="col-12 col-md-4">
                <label className="form-label" style={{ fontSize: '0.8rem', fontWeight: 600 }}>Total Fuel Cost ($)</label>
                <input type="number" step="0.01" className="form-control form-control-custom" name="fuelCost" value={formData.fuelCost} onChange={handleInputChange} placeholder="e.g. 245" required />
              </div>
              <div className="col-12 col-md-4">
                <label className="form-label" style={{ fontSize: '0.8rem', fontWeight: 600 }}>Odometer Reading (km)</label>
                <input type="number" className="form-control form-control-custom" name="odometerReading" value={formData.odometerReading} onChange={handleInputChange} placeholder="e.g. 82500" required />
              </div>

              <div className="col-12 col-md-8">
                <label className="form-label" style={{ fontSize: '0.8rem', fontWeight: 600 }}>Fuel Station / Vendor</label>
                <input type="text" className="form-control form-control-custom" name="fuelStation" value={formData.fuelStation} onChange={handleInputChange} placeholder="e.g. Love's Travel Stop #12" required />
              </div>
              <div className="col-12 col-md-4">
                <label className="form-label" style={{ fontSize: '0.8rem', fontWeight: 600 }}>Purchase Date</label>
                <input type="date" className="form-control form-control-custom" name="date" value={formData.date} onChange={handleInputChange} required />
              </div>
            </div>
            <div className="mt-3 text-end">
              <button type="submit" className="btn btn-grad">
                Record Refueling
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
                <th className="py-3">Driver</th>
                <th className="py-3">Refuel Date</th>
                <th className="py-3">Station</th>
                <th className="py-3 text-end">Quantity</th>
                <th className="py-3 text-end">Odometer</th>
                <th className="py-3 text-end">Cost</th>
                <th className="py-3 text-end px-4">Efficiency</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="8" className="text-center py-4"><div className="spinner-border text-primary" /></td></tr>
              ) : logs.length === 0 ? (
                <tr><td colSpan="8" className="text-center py-4 text-muted">No fuel transactions logged.</td></tr>
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
                      {log.driver ? (
                        <span className="font-weight-bold" style={{ fontSize: '0.85rem' }}>{log.driver.name}</span>
                      ) : (
                        <span className="text-danger" style={{ fontSize: '0.8rem' }}>Deleted Driver</span>
                      )}
                    </td>
                    <td><span style={{ fontSize: '0.85rem' }}>{new Date(log.date).toLocaleDateString()}</span></td>
                    <td><span style={{ fontSize: '0.85rem' }}>{log.fuelStation}</span></td>
                    <td className="text-end font-weight-bold" style={{ fontSize: '0.85rem' }}>{log.fuelQuantity.toFixed(1)} L</td>
                    <td className="text-end" style={{ fontSize: '0.85rem' }}>{log.odometerReading.toLocaleString()} km</td>
                    <td className="text-end font-weight-bold text-danger" style={{ fontSize: '0.85rem' }}>${log.fuelCost.toLocaleString()}</td>
                    <td className="text-end px-4">
                      {log.fuelEfficiency > 0 ? (
                        <span className="badge badge-custom bg-success-bg text-success border-success" title={`Travelled: ${log.distanceTravelled} km since last fill`}>
                          {log.fuelEfficiency} km/L
                        </span>
                      ) : (
                        <span className="text-muted" style={{ fontSize: '0.75rem' }}>Initial fill</span>
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
