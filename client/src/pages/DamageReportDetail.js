import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { getDamageReport, updateDamageReport, deleteDamageReport, analyzeDamageReport } from '../services/api';
import { Modal, ConfirmDialog } from '../components/Modal';
import AIAnalysisDisplay from '../components/AIAnalysisDisplay';

function DamageReportDetail() {
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
      try { const res = await getDamageReport(id); setItem(res.data); setForm(res.data); } catch { toast.error('Failed'); navigate('/damage-reports'); }
      setLoading(false);
    })();
  }, [id]);

  const handleUpdate = async (e) => {
    e.preventDefault();
    try { const res = await updateDamageReport(id, form); setItem(res.data); setShowEdit(false); toast.success('Updated'); } catch { toast.error('Failed'); }
  };

  const handleDelete = async () => {
    try { await deleteDamageReport(id); toast.success('Deleted'); navigate('/damage-reports'); } catch { toast.error('Failed'); }
  };

  const handleAnalyze = async () => {
    setAiLoading(true);
    try { const res = await analyzeDamageReport(id); setItem(res.data); toast.success('AI analysis complete'); } catch { toast.error('AI analysis failed'); }
    setAiLoading(false);
  };

  if (loading) return <div style={{ padding: '40px', textAlign: 'center' }}>Loading...</div>;
  if (!item) return null;

  const fmt = (v) => v ? `$${v.toLocaleString()}` : '—';

  return (
    <div className="detail-page">
      <button className="back-btn" onClick={() => navigate('/damage-reports')}>← Back to Damage Reports</button>
      <div className="page-header"><h1>{item.vehicleYear} {item.vehicleMake} {item.vehicleModel}</h1></div>

      <div className="detail-card">
        <h2>Damage Report</h2>
        <div className="detail-grid">
          <div className="detail-field"><span className="label">Make</span><span className="value">{item.vehicleMake}</span></div>
          <div className="detail-field"><span className="label">Model</span><span className="value">{item.vehicleModel}</span></div>
          <div className="detail-field"><span className="label">Year</span><span className="value">{item.vehicleYear}</span></div>
          <div className="detail-field"><span className="label">VIN</span><span className="value" style={{ fontFamily: 'monospace' }}>{item.vin || '—'}</span></div>
          <div className="detail-field"><span className="label">Damage Type</span><span className="value">{item.damageType || '—'}</span></div>
          <div className="detail-field"><span className="label">Severity</span><span className="value"><span className={`badge badge-${item.severity}`}>{item.severity}</span></span></div>
          <div className="detail-field"><span className="label">Location</span><span className="value">{item.location || '—'}</span></div>
          <div className="detail-field"><span className="label">Est. Repair Cost</span><span className="value currency">{fmt(item.estimatedRepairCost)}</span></div>
        </div>
        {item.description && (
          <div style={{ marginTop: '20px' }}>
            <span className="label" style={{ fontSize: '12px', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.5px', color: '#64748b' }}>Description</span>
            <p style={{ marginTop: '6px', color: '#cbd5e1', lineHeight: 1.6 }}>{item.description}</p>
          </div>
        )}
        {item.repairRecommendation && (
          <div style={{ marginTop: '16px' }}>
            <span className="label" style={{ fontSize: '12px', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.5px', color: '#64748b' }}>Repair Recommendation</span>
            <p style={{ marginTop: '6px', color: '#cbd5e1', lineHeight: 1.6 }}>{item.repairRecommendation}</p>
          </div>
        )}
        <div className="detail-actions">
          <button className="btn btn-ai" onClick={handleAnalyze} disabled={aiLoading}>🤖 {aiLoading ? 'Analyzing...' : 'Run AI Analysis'}</button>
          <button className="btn btn-secondary" onClick={() => setShowEdit(true)}>Edit</button>
          <button className="btn btn-danger" onClick={() => setShowConfirm(true)}>Delete</button>
        </div>
      </div>

      <AIAnalysisDisplay analysis={item.aiAnalysis} loading={aiLoading} />

      <Modal isOpen={showEdit} onClose={() => setShowEdit(false)} title="Edit Damage Report">
        <form onSubmit={handleUpdate}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div className="form-group"><label>Make</label><input value={form.vehicleMake || ''} onChange={(e) => setForm({ ...form, vehicleMake: e.target.value })} required /></div>
            <div className="form-group"><label>Model</label><input value={form.vehicleModel || ''} onChange={(e) => setForm({ ...form, vehicleModel: e.target.value })} required /></div>
            <div className="form-group"><label>Year</label><input type="number" value={form.vehicleYear || ''} onChange={(e) => setForm({ ...form, vehicleYear: parseInt(e.target.value) })} required /></div>
            <div className="form-group"><label>VIN</label><input value={form.vin || ''} onChange={(e) => setForm({ ...form, vin: e.target.value })} /></div>
            <div className="form-group"><label>Damage Type</label><input value={form.damageType || ''} onChange={(e) => setForm({ ...form, damageType: e.target.value })} /></div>
            <div className="form-group">
              <label>Severity</label>
              <select value={form.severity || 'minor'} onChange={(e) => setForm({ ...form, severity: e.target.value })}>
                <option value="minor">Minor</option><option value="moderate">Moderate</option><option value="severe">Severe</option><option value="critical">Critical</option>
              </select>
            </div>
            <div className="form-group"><label>Location</label><input value={form.location || ''} onChange={(e) => setForm({ ...form, location: e.target.value })} /></div>
            <div className="form-group"><label>Est. Repair Cost</label><input type="number" value={form.estimatedRepairCost || ''} onChange={(e) => setForm({ ...form, estimatedRepairCost: parseFloat(e.target.value) })} /></div>
          </div>
          <div className="form-group"><label>Description</label><textarea rows="3" value={form.description || ''} onChange={(e) => setForm({ ...form, description: e.target.value })} /></div>
          <div className="form-group"><label>Repair Recommendation</label><textarea rows="2" value={form.repairRecommendation || ''} onChange={(e) => setForm({ ...form, repairRecommendation: e.target.value })} /></div>
          <div className="modal-actions">
            <button type="button" className="btn btn-secondary" onClick={() => setShowEdit(false)}>Cancel</button>
            <button type="submit" className="btn btn-primary">Save Changes</button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog isOpen={showConfirm} onClose={() => setShowConfirm(false)} onConfirm={handleDelete} message="Delete this damage report?" />
    </div>
  );
}

export default DamageReportDetail;
