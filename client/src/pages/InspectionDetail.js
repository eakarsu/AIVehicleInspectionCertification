import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { getInspection, updateInspection, deleteInspection, analyzeInspection } from '../services/api';
import { Modal, ConfirmDialog } from '../components/Modal';
import AIAnalysisDisplay from '../components/AIAnalysisDisplay';

function InspectionDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [aiLoading, setAiLoading] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [form, setForm] = useState({});

  const load = async () => {
    try {
      const res = await getInspection(id);
      setItem(res.data);
      setForm(res.data);
    } catch { toast.error('Failed to load inspection'); navigate('/inspections'); }
    setLoading(false);
  };

  useEffect(() => { load(); }, [id]);

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      const res = await updateInspection(id, form);
      setItem(res.data);
      setShowEdit(false);
      toast.success('Updated successfully');
    } catch { toast.error('Update failed'); }
  };

  const handleDelete = async () => {
    try {
      await deleteInspection(id);
      toast.success('Deleted');
      navigate('/inspections');
    } catch { toast.error('Delete failed'); }
  };

  const handleAnalyze = async () => {
    setAiLoading(true);
    try {
      const res = await analyzeInspection(id);
      setItem(res.data);
      toast.success('AI analysis complete');
    } catch { toast.error('AI analysis failed'); }
    setAiLoading(false);
  };

  if (loading) return <div style={{ padding: '40px', textAlign: 'center' }}>Loading...</div>;
  if (!item) return null;

  return (
    <div className="detail-page">
      <button className="back-btn" onClick={() => navigate('/inspections')}>← Back to Inspections</button>
      <div className="page-header">
        <h1>{item.vehicleYear} {item.vehicleMake} {item.vehicleModel}</h1>
      </div>

      <div className="detail-card">
        <h2>Inspection Details</h2>
        <div className="detail-grid">
          <div className="detail-field"><span className="label">Make</span><span className="value">{item.vehicleMake}</span></div>
          <div className="detail-field"><span className="label">Model</span><span className="value">{item.vehicleModel}</span></div>
          <div className="detail-field"><span className="label">Year</span><span className="value">{item.vehicleYear}</span></div>
          <div className="detail-field"><span className="label">VIN</span><span className="value" style={{ fontFamily: 'monospace' }}>{item.vin || '—'}</span></div>
          <div className="detail-field"><span className="label">Mileage</span><span className="value">{item.mileage?.toLocaleString() || '—'}</span></div>
          <div className="detail-field"><span className="label">Color</span><span className="value">{item.color || '—'}</span></div>
          <div className="detail-field"><span className="label">Inspector</span><span className="value">{item.inspectorName || '—'}</span></div>
          <div className="detail-field"><span className="label">Status</span><span className="value"><span className={`badge badge-${item.overallStatus}`}>{item.overallStatus}</span></span></div>
          <div className="detail-field"><span className="label">Date</span><span className="value">{item.inspectionDate || '—'}</span></div>
        </div>
        {item.notes && (
          <div style={{ marginTop: '20px' }}>
            <span className="label" style={{ fontSize: '12px', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.5px', color: '#64748b' }}>Notes</span>
            <p style={{ marginTop: '6px', color: '#cbd5e1', lineHeight: 1.6 }}>{item.notes}</p>
          </div>
        )}
        <div className="detail-actions">
          <button className="btn btn-ai" onClick={handleAnalyze} disabled={aiLoading}>
            🤖 {aiLoading ? 'Analyzing...' : 'Run AI Analysis'}
          </button>
          <button className="btn btn-secondary" onClick={() => setShowEdit(true)}>Edit</button>
          <button className="btn btn-danger" onClick={() => setShowConfirm(true)}>Delete</button>
        </div>
      </div>

      <AIAnalysisDisplay analysis={item.aiReport} loading={aiLoading} />

      <Modal isOpen={showEdit} onClose={() => setShowEdit(false)} title="Edit Inspection">
        <form onSubmit={handleUpdate}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div className="form-group">
              <label>Make</label>
              <input value={form.vehicleMake || ''} onChange={(e) => setForm({ ...form, vehicleMake: e.target.value })} required />
            </div>
            <div className="form-group">
              <label>Model</label>
              <input value={form.vehicleModel || ''} onChange={(e) => setForm({ ...form, vehicleModel: e.target.value })} required />
            </div>
            <div className="form-group">
              <label>Year</label>
              <input type="number" value={form.vehicleYear || ''} onChange={(e) => setForm({ ...form, vehicleYear: parseInt(e.target.value) })} required />
            </div>
            <div className="form-group">
              <label>VIN</label>
              <input value={form.vin || ''} onChange={(e) => setForm({ ...form, vin: e.target.value })} />
            </div>
            <div className="form-group">
              <label>Mileage</label>
              <input type="number" value={form.mileage || ''} onChange={(e) => setForm({ ...form, mileage: parseInt(e.target.value) })} />
            </div>
            <div className="form-group">
              <label>Color</label>
              <input value={form.color || ''} onChange={(e) => setForm({ ...form, color: e.target.value })} />
            </div>
            <div className="form-group">
              <label>Inspector</label>
              <input value={form.inspectorName || ''} onChange={(e) => setForm({ ...form, inspectorName: e.target.value })} />
            </div>
            <div className="form-group">
              <label>Status</label>
              <select value={form.overallStatus || 'conditional'} onChange={(e) => setForm({ ...form, overallStatus: e.target.value })}>
                <option value="pass">Pass</option>
                <option value="fail">Fail</option>
                <option value="conditional">Conditional</option>
              </select>
            </div>
          </div>
          <div className="form-group">
            <label>Notes</label>
            <textarea rows="3" value={form.notes || ''} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
          </div>
          <div className="modal-actions">
            <button type="button" className="btn btn-secondary" onClick={() => setShowEdit(false)}>Cancel</button>
            <button type="submit" className="btn btn-primary">Save Changes</button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog isOpen={showConfirm} onClose={() => setShowConfirm(false)} onConfirm={handleDelete} message="Are you sure you want to delete this inspection?" />
    </div>
  );
}

export default InspectionDetail;
