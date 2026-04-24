import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { getRecallAlerts, createRecallAlert, deleteRecallAlert } from '../services/api';
import { Modal, ConfirmDialog } from '../components/Modal';

function RecallAlertsPage() {
  const navigate = useNavigate();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [form, setForm] = useState({ vehicleMake: '', vehicleModel: '', vehicleYear: 2024, vin: '', component: '', riskLevel: 'moderate', summary: '' });

  const load = async () => {
    try { const res = await getRecallAlerts(); setItems(res.data); } catch { toast.error('Failed to load'); }
    setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    try { await createRecallAlert(form); toast.success('Created'); setShowModal(false); setForm({ vehicleMake: '', vehicleModel: '', vehicleYear: 2024, vin: '', component: '', riskLevel: 'moderate', summary: '' }); load(); } catch { toast.error('Failed'); }
  };

  const handleDelete = async () => {
    try { await deleteRecallAlert(deleteId); toast.success('Deleted'); setShowConfirm(false); load(); } catch { toast.error('Failed'); }
  };

  return (
    <div>
      <button className="back-btn" onClick={() => navigate('/')}>← Back to Dashboard</button>
      <div className="page-header">
        <h1>Recall Alerts</h1>
        <div className="header-actions">
          <button className="btn btn-primary" onClick={() => setShowModal(true)}>+ New Recall</button>
        </div>
      </div>

      <div className="data-table-wrapper">
        <table className="data-table">
          <thead><tr><th>Vehicle</th><th>Year</th><th>Component</th><th>Risk</th><th>Status</th><th>Recall #</th><th>Affected</th><th>Actions</th></tr></thead>
          <tbody>
            {loading ? (
              <tr><td colSpan="8" style={{ textAlign: 'center', padding: '40px' }}>Loading...</td></tr>
            ) : items.length === 0 ? (
              <tr><td colSpan="8" style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>No records found</td></tr>
            ) : items.map((item) => (
              <tr key={item.id} onClick={() => navigate(`/recall-alerts/${item.id}`)}>
                <td><strong>{item.vehicleMake} {item.vehicleModel}</strong></td>
                <td>{item.vehicleYear}</td>
                <td>{item.component}</td>
                <td><span className={`badge badge-${item.riskLevel}`}>{item.riskLevel}</span></td>
                <td><span className={`badge badge-${item.status === 'completed' ? 'pass' : item.status === 'open' ? 'fail' : 'conditional'}`}>{item.status?.replace('_', ' ')}</span></td>
                <td style={{ fontFamily: 'monospace', fontSize: '12px' }}>{item.recallNumber || '—'}</td>
                <td>{item.affectedUnits?.toLocaleString() || '—'}</td>
                <td><button className="btn btn-danger btn-sm" onClick={(e) => { e.stopPropagation(); setDeleteId(item.id); setShowConfirm(true); }}>Delete</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="New Recall Alert">
        <form onSubmit={handleCreate}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div className="form-group"><label>Make</label><input value={form.vehicleMake} onChange={(e) => setForm({ ...form, vehicleMake: e.target.value })} required /></div>
            <div className="form-group"><label>Model</label><input value={form.vehicleModel} onChange={(e) => setForm({ ...form, vehicleModel: e.target.value })} required /></div>
            <div className="form-group"><label>Year</label><input type="number" value={form.vehicleYear} onChange={(e) => setForm({ ...form, vehicleYear: parseInt(e.target.value) })} required /></div>
            <div className="form-group"><label>VIN</label><input value={form.vin} onChange={(e) => setForm({ ...form, vin: e.target.value })} /></div>
            <div className="form-group"><label>Component</label><input value={form.component} onChange={(e) => setForm({ ...form, component: e.target.value })} required placeholder="e.g., Airbag, Brakes" /></div>
            <div className="form-group">
              <label>Risk Level</label>
              <select value={form.riskLevel} onChange={(e) => setForm({ ...form, riskLevel: e.target.value })}>
                <option value="low">Low</option><option value="moderate">Moderate</option><option value="high">High</option><option value="critical">Critical</option>
              </select>
            </div>
          </div>
          <div className="form-group"><label>Summary</label><textarea rows="3" value={form.summary} onChange={(e) => setForm({ ...form, summary: e.target.value })} /></div>
          <div className="modal-actions">
            <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
            <button type="submit" className="btn btn-primary">Create</button>
          </div>
        </form>
      </Modal>
      <ConfirmDialog isOpen={showConfirm} onClose={() => setShowConfirm(false)} onConfirm={handleDelete} message="Delete this recall alert?" />
    </div>
  );
}

export default RecallAlertsPage;
