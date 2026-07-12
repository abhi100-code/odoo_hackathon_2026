'use client';

import { useEffect, useState } from 'react';
import { BarChart3, Download, Printer, AlertTriangle, TrendingUp, TrendingDown } from 'lucide-react';

export default function AnalyticsPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('roi');

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
        <span className="text-secondary">Compiling analytical metrics...</span>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="alert alert-danger d-flex align-items-center gap-2 p-3" role="alert">
        <AlertTriangle size={20} />
        <div>
          <h5 className="alert-heading m-0">Failed to load Reports</h5>
          <p className="m-0 mt-1" style={{ fontSize: '0.9rem' }}>{error}</p>
        </div>
      </div>
    );
  }

  const { reports, charts } = data;

  const exportToCSV = (reportType) => {
    let csvContent = "data:text/csv;charset=utf-8,";
    let filename = "";

    if (reportType === 'roi') {
      csvContent += "Registration Number,Vehicle Name,Acquisition Cost,Total Revenue,Maintenance Cost,Fuel Cost,Net Profit,ROI (%)\n";
      reports.vehicleROI.forEach(row => {
        csvContent += `"${row.registrationNumber}","${row.name}",${row.acquisitionCost},${row.totalRevenue},${row.totalMaintCost},${row.totalFuelCost},${row.netProfit},${row.roi}%\n`;
      });
      filename = "Vehicle_ROI_Report.csv";
    } else if (reportType === 'drivers') {
      csvContent += "Driver Name,Safety Score,Completed Trips\n";
      charts.driverPerformance.forEach(row => {
        csvContent += `"${row.name}",${row.safetyScore},${row.tripsCount}\n`;
      });
      filename = "Driver_Performance_Report.csv";
    } else if (reportType === 'expenses') {
      csvContent += "Category,Total Expense ($)\n";
      Object.entries(charts.expensesByCategory).forEach(([key, val]) => {
        csvContent += `"${key}",${val}\n`;
      });
      filename = "Expense_Report.csv";
    }

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const printReport = () => {
    window.print();
  };

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4 printable-header">
        <div>
          <h2 className="m-0 font-weight-bold d-flex align-items-center gap-2">
            <BarChart3 size={24} className="text-primary" />
            <span>Reports & Operations Analytics</span>
          </h2>
          <p className="text-secondary m-0" style={{ fontSize: '0.9rem' }}>Generate vehicle ROI calculations, driver safety summaries, and audit ledgers.</p>
        </div>
        <div className="d-flex gap-2">
          <button className="btn btn-outline-secondary d-flex align-items-center gap-2" onClick={() => exportToCSV(activeTab)} style={{ borderRadius: '10px' }}>
            <Download size={14} />
            <span>Export CSV</span>
          </button>
          <button className="btn btn-grad d-flex align-items-center gap-2" onClick={printReport}>
            <Printer size={14} />
            <span>Print Report (PDF)</span>
          </button>
        </div>
      </div>

      <ul className="nav nav-pills mb-4 gap-2 border-bottom pb-3 printable-tabs" style={{ borderColor: 'var(--border-color)' }}>
        <li className="nav-item">
          <button className={`nav-link font-weight-bold ${activeTab === 'roi' ? 'active btn-grad' : 'text-secondary'}`} onClick={() => setActiveTab('roi')} style={{ borderRadius: '10px' }}>
            Vehicle ROI Summary
          </button>
        </li>
        <li className="nav-item">
          <button className={`nav-link font-weight-bold ${activeTab === 'drivers' ? 'active btn-grad' : 'text-secondary'}`} onClick={() => setActiveTab('drivers')} style={{ borderRadius: '10px' }}>
            Driver Performance
          </button>
        </li>
        <li className="nav-item">
          <button className={`nav-link font-weight-bold ${activeTab === 'expenses' ? 'active btn-grad' : 'text-secondary'}`} onClick={() => setActiveTab('expenses')} style={{ borderRadius: '10px' }}>
            Expense Audit
          </button>
        </li>
      </ul>

      <div className="glass-panel p-0 overflow-hidden printable-area">
        {activeTab === 'roi' && (
          <div>
            <div className="p-3 border-bottom d-flex align-items-center justify-content-between" style={{ borderColor: 'var(--border-color)' }}>
              <h5 className="m-0 font-weight-bold">Vehicle ROI Report</h5>
              <span className="text-muted" style={{ fontSize: '0.8rem' }}>Calculation: (Revenue - Expenses) / Acquisition Cost</span>
            </div>
            <div className="table-responsive">
              <table className="table table-hover align-middle mb-0" style={{ color: 'var(--text-primary)' }}>
                <thead style={{ backgroundColor: 'rgba(255,255,255,0.02)' }}>
                  <tr>
                    <th className="px-4 py-3">Vehicle details</th>
                    <th className="py-3 text-end">Acquisition Cost</th>
                    <th className="py-3 text-end">Trip revenue</th>
                    <th className="py-3 text-end">Fuel Cost</th>
                    <th className="py-3 text-end">Maintenance</th>
                    <th className="py-3 text-end">Net Profit</th>
                    <th className="py-3 text-end px-4">ROI %</th>
                  </tr>
                </thead>
                <tbody>
                  {reports.vehicleROI.map((row, i) => (
                    <tr key={i} style={{ borderBottom: '1px solid var(--border-color)' }}>
                      <td className="px-4 py-3">
                        <div className="font-weight-bold" style={{ fontSize: '0.85rem' }}>{row.name}</div>
                        <span className="text-primary font-weight-bold" style={{ fontSize: '0.75rem' }}>{row.registrationNumber}</span>
                      </td>
                      <td className="text-end" style={{ fontSize: '0.85rem' }}>${row.acquisitionCost.toLocaleString()}</td>
                      <td className="text-end text-success font-weight-bold" style={{ fontSize: '0.85rem' }}>${row.totalRevenue.toLocaleString()}</td>
                      <td className="text-end text-danger" style={{ fontSize: '0.85rem' }}>-${row.totalFuelCost.toLocaleString()}</td>
                      <td className="text-end text-danger" style={{ fontSize: '0.85rem' }}>-${row.totalMaintCost.toLocaleString()}</td>
                      <td className={`text-end font-weight-bold ${row.netProfit >= 0 ? 'text-success' : 'text-danger'}`} style={{ fontSize: '0.85rem' }}>
                        ${row.netProfit.toLocaleString()}
                      </td>
                      <td className="text-end px-4 font-weight-bold" style={{ fontSize: '0.85rem' }}>
                        <span className={`d-inline-flex align-items-center gap-1 badge badge-custom ${row.roi >= 0 ? 'bg-success-bg text-success border-success' : 'bg-danger-bg text-danger border-danger'}`}>
                          {row.roi >= 0 ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                          <span>{row.roi}%</span>
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'drivers' && (
          <div>
            <div className="p-3 border-bottom" style={{ borderColor: 'var(--border-color)' }}>
              <h5 className="m-0 font-weight-bold">Driver Performance Report</h5>
            </div>
            <div className="table-responsive">
              <table className="table table-hover align-middle mb-0" style={{ color: 'var(--text-primary)' }}>
                <thead style={{ backgroundColor: 'rgba(255,255,255,0.02)' }}>
                  <tr>
                    <th className="px-4 py-3">Driver Name</th>
                    <th className="py-3 text-end">Safety Score</th>
                    <th className="py-3 text-end px-4">Completed Trips</th>
                  </tr>
                </thead>
                <tbody>
                  {charts.driverPerformance.map((row, i) => (
                    <tr key={i} style={{ borderBottom: '1px solid var(--border-color)' }}>
                      <td className="px-4 py-3 font-weight-bold" style={{ fontSize: '0.85rem' }}>{row.name}</td>
                      <td className="text-end font-weight-bold" style={{ fontSize: '0.85rem' }}>
                        <span className={`badge border badge-custom ${row.safetyScore >= 90 ? 'bg-success-bg text-success border-success' : row.safetyScore >= 75 ? 'bg-warning-bg text-warning border-warning' : 'bg-danger-bg text-danger border-danger'}`}>
                          {row.safetyScore} / 100
                        </span>
                      </td>
                      <td className="text-end px-4 font-weight-bold" style={{ fontSize: '0.85rem' }}>{row.tripsCount} trips</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'expenses' && (
          <div>
            <div className="p-3 border-bottom" style={{ borderColor: 'var(--border-color)' }}>
              <h5 className="m-0 font-weight-bold">Expense Audit Summary</h5>
            </div>
            <div className="table-responsive">
              <table className="table table-hover align-middle mb-0" style={{ color: 'var(--text-primary)' }}>
                <thead style={{ backgroundColor: 'rgba(255,255,255,0.02)' }}>
                  <tr>
                    <th className="px-4 py-3">Expense Category</th>
                    <th className="py-3 text-end px-4">Total Aggregated Spend</th>
                  </tr>
                </thead>
                <tbody>
                  {Object.entries(charts.expensesByCategory).map(([key, val], i) => (
                    <tr key={i} style={{ borderBottom: '1px solid var(--border-color)' }}>
                      <td className="px-4 py-3 font-weight-bold" style={{ fontSize: '0.85rem' }}>{key}</td>
                      <td className="text-end px-4 font-weight-bold text-danger" style={{ fontSize: '0.85rem' }}>
                        ${val.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      <style jsx global>{`
        @media print {
          body {
            background: white !important;
            color: black !important;
          }
          .sidebar-wrapper, .printable-header, .printable-tabs, header {
            display: none !important;
          }
          .main-content {
            margin-left: 0 !important;
            padding: 0 !important;
          }
          .printable-area {
            border: none !important;
            box-shadow: none !important;
            background: transparent !important;
          }
          table {
            color: black !important;
            border-color: #ccc !important;
          }
        }
      `}</style>
    </div>
  );
}
