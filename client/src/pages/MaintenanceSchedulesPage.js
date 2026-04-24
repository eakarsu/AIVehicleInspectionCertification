import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { getMaintenanceSchedules, createMaintenanceSchedule, deleteMaintenanceSchedule } from '../services/api';
import { Modal, ConfirmDialog } from '../components/Modal';

function MaintenanceSchedulesPage() {
  const navigate = useNavigate();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [form, setForm] = useState({ vehicleMake: '', vehicleModel: '', vehicleYear: 2024, vin: '', mileage: 0, serviceType: '', priority: 'medium', scheduledDate: '', estimatedCost: 0, notes: '' });

  const load = async () => {
    try { const res = await getMaintenanceSchedules(); setItems(res.data); } catch { toast.error('Failed to load'); }
    setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    try { await createMaintenanceSchedule(form); toast.success('Created'); setShowModal(false); load(); } catch { toast.error('Failed'); }
  };

  const handleDelete = async () => {
    try { await deleteMaintenanceSchedule(deleteId); toast.success('Deleted'); setShowConfirm(false); load(); } catch { toast.error('Failed'); }
  };

  const fmt = (v) => v ? `$${v.toLocaleString()}` : '—';

  return (
    <div>
      <button className="back-btn" onClick={() => navigate('/')}>← Back to Dashboard</button>
      <div className="page-header">
        <h1>Maintenance Schedule</h1>
        <div className="header-actions">
          <button className="btn btn-primary" onClick={() => setShowModal(true)}>+ New Service</button>
        </div>
      </div>

      <div className="data-table-wrapper">
        <table className="data-table">
          <thead><tr><th>Vehicle</th><th>Year</th><th>Service</th><th>Priority</th><th>Status</th><th>Scheduled</th><th>Est. Cost</th><th>Actions</th></tr></thead>
          <tbody>
            {loading ? (
              <tr><td colSpan="8" style={{ textAlign: 'center', padding: '40px' }}>Loading...</td></tr>
            ) : items.length === 0 ? (
              <tr><td colSpan="8" style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>No records found</td></tr>
            ) : items.map((item) => (
              <tr key={item.id} onClick={() => navigate(`/maintenance-schedules/${item.id}`)}>
                <td><strong>{item.vehicleMake} {item.vehicleModel}</strong></td>
                <td>{item.vehicleYear}</td>
                <td>{item.serviceType}</td>
                <td><span className={`badge badge-${item.priority === 'urgent' ? 'critical' : item.priority === 'high' ? 'severe' : item.priority === 'medium' ? 'conditional' : 'minor'}`}>{item.priority}</span></td>
                <td><span className={`badge badge-${item.status === 'completed' ? 'pass' : item.status === 'overdue' ? 'fail' : item.status === 'skipped' ? 'declining' : 'conditional'}`}>{item.status}</span></td>
                <td>{item.scheduledDate || '—'}</td>
                <td><span className="currency">{fmt(item.estimatedCost)}</span></td>
                <td><button className="btn btn-danger btn-sm" onClick={(e) => { e.stopPropagation(); setDeleteId(item.id); setShowConfirm(true); }}>Delete</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="New Maintenance Service">
        <form onSubmit={handleCreate}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div className="form-group"><label>Make</label><input value={form.vehicleMake} onChange={(e) => setForm({ ...form, vehicleMake: e.target.value })} required /></div>
            <div className="form-group"><label>Model</label><input value={form.vehicleModel} onChange={(e) => setForm({ ...form, vehicleModel: e.target.value })} required /></div>
            <div className="form-group"><label>Year</label><input type="number" value={form.vehicleYear} onChange={(e) => setForm({ ...form, vehicleYear: parseInt(e.target.value) })} required /></div>
            <div className="form-group"><label>VIN</label><input value={form.vin} onChange={(e) => setForm({ ...form, vin: e.target.value })} /></div>
            <div className="form-group"><label>Mileage</label><input type="number" value={form.mileage} onChange={(e) => setForm({ ...form, mileage: parseInt(e.target.value) })} /></div>
            <div className="form-group"><label>Service Type</label><input value={form.serviceType} onChange={(e) => setForm({ ...form, serviceType: e.target.value })} required placeholder="e.g., Oil Change, Brake Pads" /></div>
            <div className="form-group"><label>Priority</label><select value={form.priority} onChange={(e) => setForm({ ...form, priority: e.target.value })}><option value="low">Low</option><option value="medium">Medium</option><option value="high">High</option><option value="urgent">Urgent</option></select></div>
            <div className="form-group"><label>Scheduled Date</label><input type="date" value={form.scheduledDate} onChange={(e) => setForm({ ...form, scheduledDate: e.target.value })} /></div>
            <div className="form-group"><label>Est. Cost</label><input type="number" value={form.estimatedCost} onChange={(e) => setForm({ ...form, estimatedCost: parseFloat(e.target.value) })} /></div>
          </div>
          <div className="form-group"><label>Notes</label><textarea rows="2" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} /></div>
          <div className="modal-actions">
            <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
            <button type="submit" className="btn btn-primary">Create</button>
          </div>
        </form>
      </Modal>
      <ConfirmDialog isOpen={showConfirm} onClose={() => setShowConfirm(false)} onConfirm={handleDelete} message="Delete this maintenance item?" />
    </div>
  );
}

export default MaintenanceSchedulesPage;
