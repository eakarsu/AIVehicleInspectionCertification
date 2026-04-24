import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { getVehicleHistories, createVehicleHistory, deleteVehicleHistory } from '../services/api';
import { Modal, ConfirmDialog } from '../components/Modal';

function VehicleHistoryPage() {
  const navigate = useNavigate();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [form, setForm] = useState({ vehicleMake: '', vehicleModel: '', vehicleYear: 2024, vin: '', owners: 1, accidents: 0, serviceRecords: 0, titleStatus: 'clean' });

  const load = async () => {
    try { const res = await getVehicleHistories(); setItems(res.data); } catch { toast.error('Failed to load'); }
    setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    try { await createVehicleHistory(form); toast.success('Created'); setShowModal(false); load(); } catch { toast.error('Failed'); }
  };

  const handleDelete = async () => {
    try { await deleteVehicleHistory(deleteId); toast.success('Deleted'); setShowConfirm(false); load(); } catch { toast.error('Failed'); }
  };

  return (
    <div>
      <button className="back-btn" onClick={() => navigate('/')}>← Back to Dashboard</button>
      <div className="page-header">
        <h1>Vehicle History</h1>
        <div className="header-actions">
          <button className="btn btn-primary" onClick={() => setShowModal(true)}>+ New History</button>
        </div>
      </div>

      <div className="data-table-wrapper">
        <table className="data-table">
          <thead><tr><th>Vehicle</th><th>Year</th><th>VIN</th><th>Owners</th><th>Accidents</th><th>Service Records</th><th>Title</th><th>Actions</th></tr></thead>
          <tbody>
            {loading ? (
              <tr><td colSpan="8" style={{ textAlign: 'center', padding: '40px' }}>Loading...</td></tr>
            ) : items.length === 0 ? (
              <tr><td colSpan="8" style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>No records found</td></tr>
            ) : items.map((item) => (
              <tr key={item.id} onClick={() => navigate(`/vehicle-history/${item.id}`)}>
                <td><strong>{item.vehicleMake} {item.vehicleModel}</strong></td>
                <td>{item.vehicleYear}</td>
                <td style={{ fontFamily: 'monospace', fontSize: '12px' }}>{item.vin}</td>
                <td>{item.owners}</td>
                <td>{item.accidents === 0 ? <span style={{ color: '#34d399' }}>None</span> : <span style={{ color: '#f87171' }}>{item.accidents}</span>}</td>
                <td>{item.serviceRecords}</td>
                <td><span className={`badge badge-${item.titleStatus}`}>{item.titleStatus}</span></td>
                <td><button className="btn btn-danger btn-sm" onClick={(e) => { e.stopPropagation(); setDeleteId(item.id); setShowConfirm(true); }}>Delete</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="New Vehicle History">
        <form onSubmit={handleCreate}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div className="form-group"><label>Make</label><input value={form.vehicleMake} onChange={(e) => setForm({ ...form, vehicleMake: e.target.value })} required /></div>
            <div className="form-group"><label>Model</label><input value={form.vehicleModel} onChange={(e) => setForm({ ...form, vehicleModel: e.target.value })} required /></div>
            <div className="form-group"><label>Year</label><input type="number" value={form.vehicleYear} onChange={(e) => setForm({ ...form, vehicleYear: parseInt(e.target.value) })} required /></div>
            <div className="form-group"><label>VIN</label><input value={form.vin} onChange={(e) => setForm({ ...form, vin: e.target.value })} required /></div>
            <div className="form-group"><label>Owners</label><input type="number" value={form.owners} onChange={(e) => setForm({ ...form, owners: parseInt(e.target.value) })} /></div>
            <div className="form-group"><label>Accidents</label><input type="number" value={form.accidents} onChange={(e) => setForm({ ...form, accidents: parseInt(e.target.value) })} /></div>
            <div className="form-group"><label>Service Records</label><input type="number" value={form.serviceRecords} onChange={(e) => setForm({ ...form, serviceRecords: parseInt(e.target.value) })} /></div>
            <div className="form-group">
              <label>Title Status</label>
              <select value={form.titleStatus} onChange={(e) => setForm({ ...form, titleStatus: e.target.value })}>
                <option value="clean">Clean</option><option value="salvage">Salvage</option><option value="rebuilt">Rebuilt</option><option value="flood">Flood</option><option value="lemon">Lemon</option>
              </select>
            </div>
          </div>
          <div className="modal-actions">
            <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
            <button type="submit" className="btn btn-primary">Create</button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog isOpen={showConfirm} onClose={() => setShowConfirm(false)} onConfirm={handleDelete} message="Delete this vehicle history?" />
    </div>
  );
}

export default VehicleHistoryPage;
