import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { getRecallAlert, updateRecallAlert, deleteRecallAlert, analyzeRecallAlert } from '../services/api';
import { Modal, ConfirmDialog } from '../components/Modal';
import AIAnalysisDisplay from '../components/AIAnalysisDisplay';

function RecallAlertDetail() {
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
      try { const res = await getRecallAlert(id); setItem(res.data); setForm(res.data); } catch { toast.error('Failed'); navigate('/recall-alerts'); }
      setLoading(false);
    })();
  }, [id]);

  const handleUpdate = async (e) => {
    e.preventDefault();
    try { const res = await updateRecallAlert(id, form); setItem(res.data); setShowEdit(false); toast.success('Updated'); } catch { toast.error('Failed'); }
  };

  const handleDelete = async () => {
    try { await deleteRecallAlert(id); toast.success('Deleted'); navigate('/recall-alerts'); } catch { toast.error('Failed'); }
  };

  const handleAnalyze = async () => {
    setAiLoading(true);
    try { const res = await analyzeRecallAlert(id); setItem(res.data); toast.success('AI analysis complete'); } catch { toast.error('AI analysis failed'); }
    setAiLoading(false);
  };

  if (loading) return <div style={{ padding: '40px', textAlign: 'center' }}>Loading...</div>;
  if (!item) return null;

  return (
    <div className="detail-page">
      <button className="back-btn" onClick={() => navigate('/recall-alerts')}>← Back to Recall Alerts</button>
      <div className="page-header"><h1>{item.vehicleYear} {item.vehicleMake} {item.vehicleModel} — {item.component}</h1></div>

      <div className="detail-card">
        <h2>Recall Details</h2>
        <div className="detail-grid">
          <div className="detail-field"><span className="label">Make</span><span className="value">{item.vehicleMake}</span></div>
          <div className="detail-field"><span className="label">Model</span><span className="value">{item.vehicleModel}</span></div>
          <div className="detail-field"><span className="label">Year</span><span className="value">{item.vehicleYear}</span></div>
          <div className="detail-field"><span className="label">VIN</span><span className="value" style={{ fontFamily: 'monospace' }}>{item.vin || '—'}</span></div>
          <div className="detail-field"><span className="label">Recall Number</span><span className="value" style={{ fontFamily: 'monospace' }}>{item.recallNumber || '—'}</span></div>
          <div className="detail-field"><span className="label">Component</span><span className="value">{item.component}</span></div>
          <div className="detail-field"><span className="label">Risk Level</span><span className="value"><span className={`badge badge-${item.riskLevel}`}>{item.riskLevel}</span></span></div>
          <div className="detail-field"><span className="label">Status</span><span className="value"><span className={`badge badge-${item.status === 'completed' ? 'pass' : item.status === 'open' ? 'fail' : 'conditional'}`}>{item.status?.replace('_', ' ')}</span></span></div>
          <div className="detail-field"><span className="label">Recall Date</span><span className="value">{item.recallDate || '—'}</span></div>
          <div className="detail-field"><span className="label">Affected Units</span><span className="value">{item.affectedUnits?.toLocaleString() || '—'}</span></div>
        </div>
        {item.summary && <div style={{ marginTop: '20px' }}><span className="label" style={{ fontSize: '12px', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.5px', color: '#64748b' }}>Summary</span><p style={{ marginTop: '6px', color: '#cbd5e1', lineHeight: 1.6 }}>{item.summary}</p></div>}
        {item.remedy && <div style={{ marginTop: '16px' }}><span className="label" style={{ fontSize: '12px', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.5px', color: '#64748b' }}>Remedy</span><p style={{ marginTop: '6px', color: '#cbd5e1', lineHeight: 1.6 }}>{item.remedy}</p></div>}
        <div className="detail-actions">
          <button className="btn btn-ai" onClick={handleAnalyze} disabled={aiLoading}>🤖 {aiLoading ? 'Analyzing...' : 'Run AI Analysis'}</button>
          <button className="btn btn-secondary" onClick={() => setShowEdit(true)}>Edit</button>
          <button className="btn btn-danger" onClick={() => setShowConfirm(true)}>Delete</button>
        </div>
      </div>

      <AIAnalysisDisplay analysis={item.aiAnalysis} loading={aiLoading} />

      <Modal isOpen={showEdit} onClose={() => setShowEdit(false)} title="Edit Recall Alert">
        <form onSubmit={handleUpdate}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div className="form-group"><label>Make</label><input value={form.vehicleMake || ''} onChange={(e) => setForm({ ...form, vehicleMake: e.target.value })} required /></div>
            <div className="form-group"><label>Model</label><input value={form.vehicleModel || ''} onChange={(e) => setForm({ ...form, vehicleModel: e.target.value })} required /></div>
            <div className="form-group"><label>Year</label><input type="number" value={form.vehicleYear || ''} onChange={(e) => setForm({ ...form, vehicleYear: parseInt(e.target.value) })} required /></div>
            <div className="form-group"><label>VIN</label><input value={form.vin || ''} onChange={(e) => setForm({ ...form, vin: e.target.value })} /></div>
            <div className="form-group"><label>Component</label><input value={form.component || ''} onChange={(e) => setForm({ ...form, component: e.target.value })} required /></div>
            <div className="form-group"><label>Recall Number</label><input value={form.recallNumber || ''} onChange={(e) => setForm({ ...form, recallNumber: e.target.value })} /></div>
            <div className="form-group"><label>Risk Level</label><select value={form.riskLevel || 'moderate'} onChange={(e) => setForm({ ...form, riskLevel: e.target.value })}><option value="low">Low</option><option value="moderate">Moderate</option><option value="high">High</option><option value="critical">Critical</option></select></div>
            <div className="form-group"><label>Status</label><select value={form.status || 'open'} onChange={(e) => setForm({ ...form, status: e.target.value })}><option value="open">Open</option><option value="completed">Completed</option><option value="pending_parts">Pending Parts</option><option value="scheduled">Scheduled</option></select></div>
            <div className="form-group"><label>Affected Units</label><input type="number" value={form.affectedUnits || ''} onChange={(e) => setForm({ ...form, affectedUnits: parseInt(e.target.value) })} /></div>
          </div>
          <div className="form-group"><label>Summary</label><textarea rows="3" value={form.summary || ''} onChange={(e) => setForm({ ...form, summary: e.target.value })} /></div>
          <div className="form-group"><label>Remedy</label><textarea rows="2" value={form.remedy || ''} onChange={(e) => setForm({ ...form, remedy: e.target.value })} /></div>
          <div className="modal-actions">
            <button type="button" className="btn btn-secondary" onClick={() => setShowEdit(false)}>Cancel</button>
            <button type="submit" className="btn btn-primary">Save Changes</button>
          </div>
        </form>
      </Modal>
      <ConfirmDialog isOpen={showConfirm} onClose={() => setShowConfirm(false)} onConfirm={handleDelete} message="Delete this recall alert?" />
    </div>
  );
}

export default RecallAlertDetail;
