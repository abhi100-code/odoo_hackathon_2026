'use client';

import { useEffect, useState } from 'react';
import { Landmark, Plus, Search, Calendar, AlertCircle, CheckCircle2 } from 'lucide-react';

export default function ExpensesPage() {
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [categoryFilter, setCategoryFilter] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    category: 'Toll',
    amount: '',
    date: '',
    description: '',
  });

  const fetchExpenses = async () => {
    setLoading(true);
    setError('');
    try {
      const query = new URLSearchParams();
      if (categoryFilter) query.append('category', categoryFilter);
      if (startDate) query.append('startDate', startDate);
      if (endDate) query.append('endDate', endDate);

      const res = await fetch(`/api/expenses?${query.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setExpenses(data.data || []);
      } else {
        setError('Failed to fetch expenses ledger.');
      }
    } catch (err) {
      setError('Connection failed.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExpenses();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [categoryFilter, startDate, endDate]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      const res = await fetch('/api/expenses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (res.ok) {
        setSuccess('Expense logged successfully.');
        setFormData({
          category: 'Toll',
          amount: '',
          date: '',
          description: '',
        });
        setShowForm(false);
        fetchExpenses();
      } else {
        setError(data.error || 'Failed to submit expense.');
      }
    } catch (err) {
      setError('Network communication failed.');
    }
  };

  const totalCost = expenses.reduce((sum, item) => sum + item.amount, 0);
  const fuelCost = expenses.filter(item => item.category === 'Fuel').reduce((sum, item) => sum + item.amount, 0);
  const maintCost = expenses.filter(item => item.category === 'Maintenance').reduce((sum, item) => sum + item.amount, 0);
  const otherCost = totalCost - (fuelCost + maintCost);

  const getCategoryBadge = (category) => {
    switch (category) {
      case 'Fuel': return 'bg-primary-subtle text-primary border-primary';
      case 'Maintenance': return 'bg-warning-bg text-warning border-warning';
      case 'Toll': return 'bg-info-subtle text-info border-info';
      case 'Parking': return 'bg-success-bg text-success border-success';
      case 'Insurance': return 'bg-secondary-subtle text-secondary border-secondary';
      default: return 'bg-light-dark text-muted';
    }
  };

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="m-0 font-weight-bold">Operational Expense Ledger</h2>
          <p className="text-secondary m-0" style={{ fontSize: '0.9rem' }}>Track fuel, toll charges, parking fees, insurance premiums, and repairs.</p>
        </div>
        <button
          className="btn btn-grad d-flex align-items-center gap-2"
          onClick={() => setShowForm(!showForm)}
        >
          <Plus size={16} />
          <span>{showForm ? 'Hide Form' : 'Log Expense'}</span>
        </button>
      </div>

      {error && <div className="alert alert-danger d-flex align-items-center gap-2 py-2 mb-3" style={{ fontSize: '0.85rem' }}><AlertCircle size={16} />{error}</div>}
      {success && <div className="alert alert-success d-flex align-items-center gap-2 py-2 mb-3" style={{ fontSize: '0.85rem' }}><CheckCircle2 size={16} />{success}</div>}

      <div className="row g-3 mb-4">
        <div className="col-12 col-md-3">
          <div className="glass-card">
            <span className="text-muted" style={{ fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase' }}>Operational Cost</span>
            <h3 className="m-0 mt-1 font-weight-bold text-danger">${totalCost.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</h3>
            <span className="text-muted" style={{ fontSize: '0.7rem' }}>Total aggregated spend</span>
          </div>
        </div>
        <div className="col-6 col-md-3">
          <div className="glass-card">
            <span className="text-muted" style={{ fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase' }}>Fuel Costs</span>
            <h4 className="m-0 mt-1 font-weight-bold">${fuelCost.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</h4>
            <span className="text-muted" style={{ fontSize: '0.7rem' }}>Refuels and gas cost</span>
          </div>
        </div>
        <div className="col-6 col-md-3">
          <div className="glass-card">
            <span className="text-muted" style={{ fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase' }}>Maintenance</span>
            <h4 className="m-0 mt-1 font-weight-bold">${maintCost.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</h4>
            <span className="text-muted" style={{ fontSize: '0.7rem' }}>Repairs and shop cost</span>
          </div>
        </div>
        <div className="col-12 col-md-3">
          <div className="glass-card">
            <span className="text-muted" style={{ fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase' }}>Other Expenses</span>
            <h4 className="m-0 mt-1 font-weight-bold">${otherCost.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</h4>
            <span className="text-muted" style={{ fontSize: '0.7rem' }}>Tolls, Parking, Insurance, Misc</span>
          </div>
        </div>
      </div>

      {showForm && (
        <div className="glass-panel mb-4">
          <h5 className="font-weight-bold mb-3">Log Operational Expense</h5>
          <form onSubmit={handleFormSubmit}>
            <div className="row g-3">
              <div className="col-12 col-md-4">
                <label className="form-label" style={{ fontSize: '0.8rem', fontWeight: 600 }}>Expense Category</label>
                <select className="form-select form-control-custom" name="category" value={formData.category} onChange={handleInputChange}>
                  <option value="Toll">Toll</option>
                  <option value="Parking">Parking</option>
                  <option value="Insurance">Insurance</option>
                  <option value="Miscellaneous">Miscellaneous</option>
                </select>
              </div>
              <div className="col-12 col-md-4">
                <label className="form-label" style={{ fontSize: '0.8rem', fontWeight: 600 }}>Amount ($)</label>
                <input type="number" step="0.01" className="form-control form-control-custom" name="amount" value={formData.amount} onChange={handleInputChange} placeholder="e.g. 50.00" required />
              </div>
              <div className="col-12 col-md-4">
                <label className="form-label" style={{ fontSize: '0.8rem', fontWeight: 600 }}>Expense Date</label>
                <input type="date" className="form-control form-control-custom" name="date" value={formData.date} onChange={handleInputChange} required />
              </div>

              <div className="col-12">
                <label className="form-label" style={{ fontSize: '0.8rem', fontWeight: 600 }}>Description</label>
                <textarea className="form-control form-control-custom" name="description" rows="2" value={formData.description} onChange={handleInputChange} placeholder="Specify billing references or notes..." required></textarea>
              </div>
            </div>
            <div className="mt-3 text-end">
              <button type="submit" className="btn btn-grad">
                Record Expense
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="glass-panel mb-4 p-3 d-flex flex-wrap gap-3 align-items-center justify-content-between">
        <div className="d-flex align-items-center gap-2">
          <select className="form-select form-control-custom" value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)}>
            <option value="">All Categories</option>
            <option value="Fuel">Fuel</option>
            <option value="Maintenance">Maintenance</option>
            <option value="Toll">Toll</option>
            <option value="Parking">Parking</option>
            <option value="Insurance">Insurance</option>
            <option value="Miscellaneous">Miscellaneous</option>
          </select>
        </div>
        <div className="d-flex align-items-center gap-2">
          <span className="text-secondary" style={{ fontSize: '0.85rem' }}>From</span>
          <input type="date" className="form-control form-control-custom py-1" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
          <span className="text-secondary" style={{ fontSize: '0.85rem' }}>to</span>
          <input type="date" className="form-control form-control-custom py-1" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
        </div>
      </div>

      <div className="glass-panel p-0 overflow-hidden">
        <div className="table-responsive">
          <table className="table table-hover align-middle mb-0" style={{ color: 'var(--text-primary)' }}>
            <thead style={{ backgroundColor: 'rgba(255,255,255,0.02)' }}>
              <tr>
                <th className="px-4 py-3">Expense Date</th>
                <th className="py-3">Category</th>
                <th className="py-3">Description</th>
                <th className="py-3 text-end px-4">Amount</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="4" className="text-center py-4"><div className="spinner-border text-primary" /></td></tr>
              ) : expenses.length === 0 ? (
                <tr><td colSpan="4" className="text-center py-4 text-muted">No expenses recorded for this selection.</td></tr>
              ) : (
                expenses.map((item) => (
                  <tr key={item._id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                    <td className="px-4 py-3"><span style={{ fontSize: '0.85rem' }}>{new Date(item.date).toLocaleDateString()}</span></td>
                    <td>
                      <span className={`badge border badge-custom ${getCategoryBadge(item.category)}`}>
                        {item.category}
                      </span>
                    </td>
                    <td>
                      <span style={{ fontSize: '0.85rem', fontWeight: 500 }}>{item.description}</span>
                    </td>
                    <td className="text-end font-weight-bold px-4" style={{ fontSize: '0.85rem' }}>
                      ${item.amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
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
