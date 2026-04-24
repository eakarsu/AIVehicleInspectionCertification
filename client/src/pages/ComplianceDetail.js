import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { getCompliance, updateCompliance, deleteCompliance, analyzeCompliance } from '../services/api';
import { Modal, ConfirmDialog } from '../components/Modal';
import AIAnalysisDisplay from '../components/AIAnalysisDisplay';

function ComplianceDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [aiLoading, setAiLoading] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [form, setForm] = useState({});

  useEffect(() => {
    (async () => {
      try { const res = await getCompliance(id); setItem(res.data); setForm(res.data); } catch { toast.error('Failed'); navigate('/compliance'); }
      setLoading(false);
    })();
  }, [id]);

  const handleUpdate = async (e) => {
    e.preventDefault();
    try { const res = await updateCompliance(id, form); setItem(res.data); setShowEdit(false); toast.success('Updated'); } catch { toast.error('Failed'); }
  };

  const handleDelete = async () => {
    try { await deleteCompliance(id); toast.success('Deleted'); navigate('/compliance'); } catch { toast.error('Failed'); }
  };

  const handleAnalyze = async () => {
    setAiLoading(true);
    try { const res = await analyzeCompliance(id); setItem(res.data); toast.success('AI analysis complete'); } catch { toast.error('AI analysis failed'); }
    setAiLoading(false);
  };

  if (loading) return <div style={{ padding: '40px', textAlign: 'center' }}>Loading...</div>;
  if (!item) return null;

  return (
    <div className="detail-page">
      <button className="back-btn" onClick={() => navigate('/compliance')}>← Back to Compliance</button>
      <div className="page-header"><h1>{item.vehicleYear} {item.vehicleMake} {item.vehicleModel} — {item.state}</h1></div>

      <div className="detail-card">
        <h2>Compliance Details</h2>
        <div className="detail-grid">
          <div className="detail-field"><span className="label">Make</span><span className="value">{item.vehicleMake}</span></div>
          <div className="detail-field"><span className="label">Model</span><span className="value">{item.vehicleModel}</span></div>
          <div className="detail-field"><span className="label">Year</span><span className="value">{item.vehicleYear}</span></div>
          <div className="detail-field"><span className="label">State</span><span className="value">{item.state}</span></div>
          <div className="detail-field"><span className="label">VIN</span><span className="value" style={{ fontFamily: 'monospace' }}>{item.vin || '—'}</span></div>
          <div className="detail-field"><span className="label">Emissions</span><span className="value"><span className={`badge badge-${item.emissionsStatus}`}>{item.emissionsStatus?.replace('_', ' ')}</span></span></div>
          <div className="detail-field"><span className="label">Safety</span><span className="value"><span className={`badge badge-${item.safetyStatus}`}>{item.safetyStatus?.replace('_', ' ')}</span></span></div>
          <div className="detail-field"><span className="label">Last Checked</span><span className="value">{item.lastChecked || '—'}</span></div>
          <div className="detail-field"><span className="label">Expiration</span><span className="value">{item.expirationDate || '—'}</span></div>
        </div>
        <div className="detail-actions">
          <button className="btn btn-ai" onClick={handleAnalyze} disabled={aiLoading}>🤖 {aiLoading ? 'Analyzing...' : 'Run AI Analysis'}</button>
          <button className="btn btn-secondary" onClick={() => setShowEdit(true)}>Edit</button>
          <button className="btn btn-danger" onClick={() => setShowConfirm(true)}>Delete</button>
        </div>
      </div>

      <AIAnalysisDisplay analysis={item.aiAnalysis} loading={aiLoading} />

      <Modal isOpen={showEdit} onClose={() => setShowEdit(false)} title="Edit Compliance">
        <form onSubmit={handleUpdate}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div className="form-group"><label>Make</label><input value={form.vehicleMake || ''} onChange={(e) => setForm({ ...form, vehicleMake: e.target.value })} required /></div>
            <div className="form-group"><label>Model</label><input value={form.vehicleModel || ''} onChange={(e) => setForm({ ...form, vehicleModel: e.target.value })} required /></div>
            <div className="form-group"><label>Year</label><input type="number" value={form.vehicleYear || ''} onChange={(e) => setForm({ ...form, vehicleYear: parseInt(e.target.value) })} required /></div>
            <div className="form-group"><label>State</label><input value={form.state || ''} onChange={(e) => setForm({ ...form, state: e.target.value })} required /></div>
            <div className="form-group"><label>VIN</label><input value={form.vin || ''} onChange={(e) => setForm({ ...form, vin: e.target.value })} /></div>
            <div className="form-group">
              <label>Emissions Status</label>
              <select value={form.emissionsStatus || 'pending'} onChange={(e) => setForm({ ...form, emissionsStatus: e.target.value })}>
                <option value="compliant">Compliant</option>
                <option value="non_compliant">Non-Compliant</option>
                <option value="exempt">Exempt</option>
                <option value="pending">Pending</option>
              </select>
            </div>
            <div className="form-group">
              <label>Safety Status</label>
              <select value={form.safetyStatus || 'pending'} onChange={(e) => setForm({ ...form, safetyStatus: e.target.value })}>
                <option value="compliant">Compliant</option>
                <option value="non_compliant">Non-Compliant</option>
                <option value="pending">Pending</option>
              </select>
            </div>
          </div>
          <div className="modal-actions">
            <button type="button" className="btn btn-secondary" onClick={() => setShowEdit(false)}>Cancel</button>
            <button type="submit" className="btn btn-primary">Save Changes</button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog isOpen={showConfirm} onClose={() => setShowConfirm(false)} onConfirm={handleDelete} message="Delete this compliance record?" />
    </div>
  );
}

export default ComplianceDetail;
