import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { getPartsPricings, createPartsPricing, deletePartsPricing } from '../services/api';
import { Modal, ConfirmDialog } from '../components/Modal';

function PartsPricingPage() {
  const navigate = useNavigate();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [form, setForm] = useState({ vehicleMake: '', vehicleModel: '', vehicleYear: 2024, partName: '', partNumber: '', category: '', oemPrice: 0, aftermarketPrice: 0, laborCost: 0, availability: 'in_stock' });

  const load = async () => {
    try { const res = await getPartsPricings(); setItems(res.data); } catch { toast.error('Failed to load'); }
    setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    try { await createPartsPricing(form); toast.success('Created'); setShowModal(false); load(); } catch { toast.error('Failed'); }
  };

  const handleDelete = async () => {
    try { await deletePartsPricing(deleteId); toast.success('Deleted'); setShowConfirm(false); load(); } catch { toast.error('Failed'); }
  };

  const fmt = (v) => v ? `$${v.toLocaleString()}` : '—';

  return (
    <div>
      <button className="back-btn" onClick={() => navigate('/')}>← Back to Dashboard</button>
      <div className="page-header">
        <h1>Parts Pricing</h1>
        <div className="header-actions">
          <button className="btn btn-primary" onClick={() => setShowModal(true)}>+ New Part</button>
        </div>
      </div>

      <div className="data-table-wrapper">
        <table className="data-table">
          <thead><tr><th>Vehicle</th><th>Part Name</th><th>Category</th><th>OEM</th><th>Aftermarket</th><th>Labor</th><th>Availability</th><th>Actions</th></tr></thead>
          <tbody>
            {loading ? (
              <tr><td colSpan="8" style={{ textAlign: 'center', padding: '40px' }}>Loading...</td></tr>
            ) : items.length === 0 ? (
              <tr><td colSpan="8" style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>No records found</td></tr>
            ) : items.map((item) => (
              <tr key={item.id} onClick={() => navigate(`/parts-pricing/${item.id}`)}>
                <td><strong>{item.vehicleMake} {item.vehicleModel}</strong> <span style={{ color: '#64748b', fontSize: '12px' }}>{item.vehicleYear}</span></td>
                <td>{item.partName}</td>
                <td>{item.category || '—'}</td>
                <td><span className="currency">{fmt(item.oemPrice)}</span></td>
                <td><span style={{ color: '#34d399', fontWeight: 700 }}>{fmt(item.aftermarketPrice)}</span></td>
                <td>{fmt(item.laborCost)}</td>
                <td><span className={`badge badge-${item.availability === 'in_stock' ? 'pass' : item.availability === 'discontinued' ? 'fail' : item.availability === 'backordered' ? 'declining' : 'conditional'}`}>{item.availability?.replace('_', ' ')}</span></td>
                <td><button className="btn btn-danger btn-sm" onClick={(e) => { e.stopPropagation(); setDeleteId(item.id); setShowConfirm(true); }}>Delete</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="New Part Pricing">
        <form onSubmit={handleCreate}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div className="form-group"><label>Make</label><input value={form.vehicleMake} onChange={(e) => setForm({ ...form, vehicleMake: e.target.value })} required /></div>
            <div className="form-group"><label>Model</label><input value={form.vehicleModel} onChange={(e) => setForm({ ...form, vehicleModel: e.target.value })} required /></div>
            <div className="form-group"><label>Year</label><input type="number" value={form.vehicleYear} onChange={(e) => setForm({ ...form, vehicleYear: parseInt(e.target.value) })} required /></div>
            <div className="form-group"><label>Part Name</label><input value={form.partName} onChange={(e) => setForm({ ...form, partName: e.target.value })} required placeholder="e.g., Brake Pads" /></div>
            <div className="form-group"><label>Part Number</label><input value={form.partNumber} onChange={(e) => setForm({ ...form, partNumber: e.target.value })} /></div>
            <div className="form-group"><label>Category</label><input value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} placeholder="e.g., Brakes, Engine" /></div>
            <div className="form-group"><label>OEM Price</label><input type="number" value={form.oemPrice} onChange={(e) => setForm({ ...form, oemPrice: parseFloat(e.target.value) })} /></div>
            <div className="form-group"><label>Aftermarket Price</label><input type="number" value={form.aftermarketPrice} onChange={(e) => setForm({ ...form, aftermarketPrice: parseFloat(e.target.value) })} /></div>
            <div className="form-group"><label>Labor Cost</label><input type="number" value={form.laborCost} onChange={(e) => setForm({ ...form, laborCost: parseFloat(e.target.value) })} /></div>
            <div className="form-group"><label>Availability</label><select value={form.availability} onChange={(e) => setForm({ ...form, availability: e.target.value })}><option value="in_stock">In Stock</option><option value="limited">Limited</option><option value="backordered">Backordered</option><option value="discontinued">Discontinued</option></select></div>
          </div>
          <div className="modal-actions">
            <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
            <button type="submit" className="btn btn-primary">Create</button>
          </div>
        </form>
      </Modal>
      <ConfirmDialog isOpen={showConfirm} onClose={() => setShowConfirm(false)} onConfirm={handleDelete} message="Delete this part pricing?" />
    </div>
  );
}

export default PartsPricingPage;
