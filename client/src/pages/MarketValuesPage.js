import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { getMarketValues, createMarketValue, deleteMarketValue } from '../services/api';
import { Modal, ConfirmDialog } from '../components/Modal';

function MarketValuesPage() {
  const navigate = useNavigate();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [form, setForm] = useState({ vehicleMake: '', vehicleModel: '', vehicleYear: 2024, vin: '', mileage: 0, condition: 'Good', location: '' });

  const load = async () => {
    try { const res = await getMarketValues(); setItems(res.data); } catch { toast.error('Failed to load'); }
    setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    try { await createMarketValue(form); toast.success('Created'); setShowModal(false); load(); } catch { toast.error('Failed'); }
  };

  const handleDelete = async () => {
    try { await deleteMarketValue(deleteId); toast.success('Deleted'); setShowConfirm(false); load(); } catch { toast.error('Failed'); }
  };

  const fmt = (v) => v ? `$${v.toLocaleString()}` : '—';

  return (
    <div>
      <button className="back-btn" onClick={() => navigate('/')}>← Back to Dashboard</button>
      <div className="page-header">
        <h1>Market Valuation</h1>
        <div className="header-actions">
          <button className="btn btn-primary" onClick={() => setShowModal(true)}>+ New Valuation</button>
        </div>
      </div>

      <div className="data-table-wrapper">
        <table className="data-table">
          <thead><tr><th>Vehicle</th><th>Year</th><th>Mileage</th><th>Condition</th><th>Value</th><th>Range</th><th>Trend</th><th>Actions</th></tr></thead>
          <tbody>
            {loading ? (
              <tr><td colSpan="8" style={{ textAlign: 'center', padding: '40px' }}>Loading...</td></tr>
            ) : items.length === 0 ? (
              <tr><td colSpan="8" style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>No records found</td></tr>
            ) : items.map((item) => (
              <tr key={item.id} onClick={() => navigate(`/market-values/${item.id}`)}>
                <td><strong>{item.vehicleMake} {item.vehicleModel}</strong></td>
                <td>{item.vehicleYear}</td>
                <td>{item.mileage?.toLocaleString() || '—'}</td>
                <td>{item.condition || '—'}</td>
                <td><span className="currency">{fmt(item.estimatedValue)}</span></td>
                <td style={{ fontSize: '12px', color: '#94a3b8' }}>{fmt(item.lowEstimate)} - {fmt(item.highEstimate)}</td>
                <td><span className={`badge badge-${item.marketTrend}`}>{item.marketTrend}</span></td>
                <td><button className="btn btn-danger btn-sm" onClick={(e) => { e.stopPropagation(); setDeleteId(item.id); setShowConfirm(true); }}>Delete</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="New Market Valuation">
        <form onSubmit={handleCreate}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div className="form-group"><label>Make</label><input value={form.vehicleMake} onChange={(e) => setForm({ ...form, vehicleMake: e.target.value })} required /></div>
            <div className="form-group"><label>Model</label><input value={form.vehicleModel} onChange={(e) => setForm({ ...form, vehicleModel: e.target.value })} required /></div>
            <div className="form-group"><label>Year</label><input type="number" value={form.vehicleYear} onChange={(e) => setForm({ ...form, vehicleYear: parseInt(e.target.value) })} required /></div>
            <div className="form-group"><label>VIN</label><input value={form.vin} onChange={(e) => setForm({ ...form, vin: e.target.value })} /></div>
            <div className="form-group"><label>Mileage</label><input type="number" value={form.mileage} onChange={(e) => setForm({ ...form, mileage: parseInt(e.target.value) })} /></div>
            <div className="form-group">
              <label>Condition</label>
              <select value={form.condition} onChange={(e) => setForm({ ...form, condition: e.target.value })}>
                <option>Excellent</option><option>Very Good</option><option>Good</option><option>Fair</option><option>Poor</option>
              </select>
            </div>
            <div className="form-group"><label>Location</label><input value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} /></div>
          </div>
          <div className="modal-actions">
            <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
            <button type="submit" className="btn btn-primary">Create</button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog isOpen={showConfirm} onClose={() => setShowConfirm(false)} onConfirm={handleDelete} message="Delete this valuation?" />
    </div>
  );
}

export default MarketValuesPage;
