import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { getInsuranceEstimates, createInsuranceEstimate, deleteInsuranceEstimate } from '../services/api';
import { Modal, ConfirmDialog } from '../components/Modal';

function InsuranceEstimatesPage() {
  const navigate = useNavigate();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [form, setForm] = useState({ vehicleMake: '', vehicleModel: '', vehicleYear: 2024, vin: '', driverAge: 30, driverState: 'California', coverageType: 'full', deductible: 500, annualMileage: 12000, drivingRecord: 'clean' });

  const load = async () => {
    try { const res = await getInsuranceEstimates(); setItems(res.data); } catch { toast.error('Failed to load'); }
    setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    try { await createInsuranceEstimate(form); toast.success('Created'); setShowModal(false); load(); } catch { toast.error('Failed'); }
  };

  const handleDelete = async () => {
    try { await deleteInsuranceEstimate(deleteId); toast.success('Deleted'); setShowConfirm(false); load(); } catch { toast.error('Failed'); }
  };

  const fmt = (v) => v ? `$${v.toLocaleString()}` : '—';

  return (
    <div>
      <button className="back-btn" onClick={() => navigate('/')}>← Back to Dashboard</button>
      <div className="page-header">
        <h1>Insurance Estimates</h1>
        <div className="header-actions">
          <button className="btn btn-primary" onClick={() => setShowModal(true)}>+ New Estimate</button>
        </div>
      </div>

      <div className="data-table-wrapper">
        <table className="data-table">
          <thead><tr><th>Vehicle</th><th>Year</th><th>Driver Age</th><th>State</th><th>Coverage</th><th>Monthly</th><th>Annual</th><th>Risk</th><th>Actions</th></tr></thead>
          <tbody>
            {loading ? (
              <tr><td colSpan="9" style={{ textAlign: 'center', padding: '40px' }}>Loading...</td></tr>
            ) : items.length === 0 ? (
              <tr><td colSpan="9" style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>No records found</td></tr>
            ) : items.map((item) => (
              <tr key={item.id} onClick={() => navigate(`/insurance-estimates/${item.id}`)}>
                <td><strong>{item.vehicleMake} {item.vehicleModel}</strong></td>
                <td>{item.vehicleYear}</td>
                <td>{item.driverAge || '—'}</td>
                <td>{item.driverState || '—'}</td>
                <td><span className="badge badge-stable">{item.coverageType}</span></td>
                <td><span className="currency">{fmt(item.estimatedMonthly)}</span></td>
                <td><span className="currency">{fmt(item.estimatedAnnual)}</span></td>
                <td>{item.riskScore ? <span style={{ color: item.riskScore > 60 ? '#f87171' : item.riskScore > 35 ? '#fbbf24' : '#34d399' }}>{item.riskScore}</span> : '—'}</td>
                <td><button className="btn btn-danger btn-sm" onClick={(e) => { e.stopPropagation(); setDeleteId(item.id); setShowConfirm(true); }}>Delete</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="New Insurance Estimate">
        <form onSubmit={handleCreate}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div className="form-group"><label>Make</label><input value={form.vehicleMake} onChange={(e) => setForm({ ...form, vehicleMake: e.target.value })} required /></div>
            <div className="form-group"><label>Model</label><input value={form.vehicleModel} onChange={(e) => setForm({ ...form, vehicleModel: e.target.value })} required /></div>
            <div className="form-group"><label>Year</label><input type="number" value={form.vehicleYear} onChange={(e) => setForm({ ...form, vehicleYear: parseInt(e.target.value) })} required /></div>
            <div className="form-group"><label>VIN</label><input value={form.vin} onChange={(e) => setForm({ ...form, vin: e.target.value })} /></div>
            <div className="form-group"><label>Driver Age</label><input type="number" value={form.driverAge} onChange={(e) => setForm({ ...form, driverAge: parseInt(e.target.value) })} /></div>
            <div className="form-group"><label>State</label><input value={form.driverState} onChange={(e) => setForm({ ...form, driverState: e.target.value })} /></div>
            <div className="form-group"><label>Coverage</label><select value={form.coverageType} onChange={(e) => setForm({ ...form, coverageType: e.target.value })}><option value="liability">Liability</option><option value="collision">Collision</option><option value="comprehensive">Comprehensive</option><option value="full">Full Coverage</option></select></div>
            <div className="form-group"><label>Deductible</label><input type="number" value={form.deductible} onChange={(e) => setForm({ ...form, deductible: parseFloat(e.target.value) })} /></div>
            <div className="form-group"><label>Annual Mileage</label><input type="number" value={form.annualMileage} onChange={(e) => setForm({ ...form, annualMileage: parseInt(e.target.value) })} /></div>
            <div className="form-group"><label>Driving Record</label><select value={form.drivingRecord} onChange={(e) => setForm({ ...form, drivingRecord: e.target.value })}><option value="clean">Clean</option><option value="minor_violations">Minor Violations</option><option value="major_violations">Major Violations</option><option value="accidents">Accidents</option></select></div>
          </div>
          <div className="modal-actions">
            <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
            <button type="submit" className="btn btn-primary">Create</button>
          </div>
        </form>
      </Modal>
      <ConfirmDialog isOpen={showConfirm} onClose={() => setShowConfirm(false)} onConfirm={handleDelete} message="Delete this insurance estimate?" />
    </div>
  );
}

export default InsuranceEstimatesPage;
