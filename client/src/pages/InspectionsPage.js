import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { getInspections, createInspection, deleteInspection } from '../services/api';
import { Modal, ConfirmDialog } from '../components/Modal';

function InspectionsPage() {
  const navigate = useNavigate();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [form, setForm] = useState({ vehicleMake: '', vehicleModel: '', vehicleYear: 2024, vin: '', mileage: 0, color: '', inspectorName: '', notes: '' });

  const load = async () => {
    try {
      const res = await getInspections();
      setItems(res.data);
    } catch { toast.error('Failed to load inspections'); }
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await createInspection(form);
      toast.success('Inspection created');
      setShowModal(false);
      setForm({ vehicleMake: '', vehicleModel: '', vehicleYear: 2024, vin: '', mileage: 0, color: '', inspectorName: '', notes: '' });
      load();
    } catch { toast.error('Failed to create inspection'); }
  };

  const handleDelete = async () => {
    try {
      await deleteInspection(deleteId);
      toast.success('Inspection deleted');
      setShowConfirm(false);
      load();
    } catch { toast.error('Failed to delete'); }
  };

  return (
    <div>
      <button className="back-btn" onClick={() => navigate('/')}>← Back to Dashboard</button>
      <div className="page-header">
        <h1>Vehicle Inspections</h1>
        <div className="header-actions">
          <button className="btn btn-primary" onClick={() => setShowModal(true)}>+ New Inspection</button>
        </div>
      </div>

      <div className="data-table-wrapper">
        <table className="data-table">
          <thead>
            <tr>
              <th>Vehicle</th>
              <th>Year</th>
              <th>VIN</th>
              <th>Mileage</th>
              <th>Inspector</th>
              <th>Status</th>
              <th>Date</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan="8" style={{ textAlign: 'center', padding: '40px' }}>Loading...</td></tr>
            ) : items.length === 0 ? (
              <tr><td colSpan="8" style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>No inspections found</td></tr>
            ) : items.map((item) => (
              <tr key={item.id} onClick={() => navigate(`/inspections/${item.id}`)}>
                <td><strong>{item.vehicleMake} {item.vehicleModel}</strong></td>
                <td>{item.vehicleYear}</td>
                <td style={{ fontFamily: 'monospace', fontSize: '12px' }}>{item.vin || '—'}</td>
                <td>{item.mileage?.toLocaleString() || '—'}</td>
                <td>{item.inspectorName || '—'}</td>
                <td><span className={`badge badge-${item.overallStatus}`}>{item.overallStatus}</span></td>
                <td>{item.inspectionDate || '—'}</td>
                <td>
                  <button className="btn btn-danger btn-sm" onClick={(e) => { e.stopPropagation(); setDeleteId(item.id); setShowConfirm(true); }}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="New Vehicle Inspection">
        <form onSubmit={handleCreate}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div className="form-group">
              <label>Make</label>
              <input value={form.vehicleMake} onChange={(e) => setForm({ ...form, vehicleMake: e.target.value })} required />
            </div>
            <div className="form-group">
              <label>Model</label>
              <input value={form.vehicleModel} onChange={(e) => setForm({ ...form, vehicleModel: e.target.value })} required />
            </div>
            <div className="form-group">
              <label>Year</label>
              <input type="number" value={form.vehicleYear} onChange={(e) => setForm({ ...form, vehicleYear: parseInt(e.target.value) })} required />
            </div>
            <div className="form-group">
              <label>VIN</label>
              <input value={form.vin} onChange={(e) => setForm({ ...form, vin: e.target.value })} />
            </div>
            <div className="form-group">
              <label>Mileage</label>
              <input type="number" value={form.mileage} onChange={(e) => setForm({ ...form, mileage: parseInt(e.target.value) })} />
            </div>
            <div className="form-group">
              <label>Color</label>
              <input value={form.color} onChange={(e) => setForm({ ...form, color: e.target.value })} />
            </div>
            <div className="form-group">
              <label>Inspector Name</label>
              <input value={form.inspectorName} onChange={(e) => setForm({ ...form, inspectorName: e.target.value })} />
            </div>
          </div>
          <div className="form-group">
            <label>Notes</label>
            <textarea rows="3" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
          </div>
          <div className="modal-actions">
            <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
            <button type="submit" className="btn btn-primary">Create Inspection</button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog isOpen={showConfirm} onClose={() => setShowConfirm(false)} onConfirm={handleDelete} message="Are you sure you want to delete this inspection?" />
    </div>
  );
}

export default InspectionsPage;
