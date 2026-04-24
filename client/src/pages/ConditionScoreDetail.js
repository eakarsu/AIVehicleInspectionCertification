import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { getConditionScore, updateConditionScore, deleteConditionScore, analyzeConditionScore } from '../services/api';
import { Modal, ConfirmDialog } from '../components/Modal';
import AIAnalysisDisplay from '../components/AIAnalysisDisplay';

function ScoreBar({ label, score, color }) {
  const pct = ((score || 0) / 10) * 100;
  return (
    <div style={{ marginBottom: '12px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
        <span style={{ fontSize: '13px', color: '#94a3b8' }}>{label}</span>
        <span style={{ fontSize: '14px', fontWeight: 700 }}>{score?.toFixed(1) || '—'}/10</span>
      </div>
      <div className="score-bar">
        <div className="score-bar-fill" style={{ width: `${pct}%`, background: color || '#3b82f6' }}></div>
      </div>
    </div>
  );
}

function ConditionScoreDetail() {
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
      try { const res = await getConditionScore(id); setItem(res.data); setForm(res.data); } catch { toast.error('Failed'); navigate('/condition-scores'); }
      setLoading(false);
    })();
  }, [id]);

  const handleUpdate = async (e) => {
    e.preventDefault();
    try { const res = await updateConditionScore(id, form); setItem(res.data); setShowEdit(false); toast.success('Updated'); } catch { toast.error('Failed'); }
  };

  const handleDelete = async () => {
    try { await deleteConditionScore(id); toast.success('Deleted'); navigate('/condition-scores'); } catch { toast.error('Failed'); }
  };

  const handleAnalyze = async () => {
    setAiLoading(true);
    try { const res = await analyzeConditionScore(id); setItem(res.data); toast.success('AI analysis complete'); } catch { toast.error('AI analysis failed'); }
    setAiLoading(false);
  };

  if (loading) return <div style={{ padding: '40px', textAlign: 'center' }}>Loading...</div>;
  if (!item) return null;

  const getGradeClass = (g) => g ? `grade-${g.charAt(0).toLowerCase()}` : 'grade-c';

  return (
    <div className="detail-page">
      <button className="back-btn" onClick={() => navigate('/condition-scores')}>← Back to Condition Scores</button>
      <div className="page-header"><h1>{item.vehicleYear} {item.vehicleMake} {item.vehicleModel}</h1></div>

      <div className="detail-card">
        <h2>Vehicle Information</h2>
        <div className="detail-grid">
          <div className="detail-field"><span className="label">Make</span><span className="value">{item.vehicleMake}</span></div>
          <div className="detail-field"><span className="label">Model</span><span className="value">{item.vehicleModel}</span></div>
          <div className="detail-field"><span className="label">Year</span><span className="value">{item.vehicleYear}</span></div>
          <div className="detail-field"><span className="label">VIN</span><span className="value" style={{ fontFamily: 'monospace' }}>{item.vin || '—'}</span></div>
          <div className="detail-field"><span className="label">Mileage</span><span className="value">{item.mileage?.toLocaleString() || '—'}</span></div>
          <div className="detail-field"><span className="label">Grade</span><span className="value"><span className={`grade-badge ${getGradeClass(item.grade)}`}>{item.grade || '—'}</span></span></div>
        </div>
      </div>

      <div className="detail-card">
        <h2>Condition Scores</h2>
        <div style={{ display: 'flex', alignItems: 'center', gap: '24px', marginBottom: '24px' }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '48px', fontWeight: 800, color: '#3b82f6' }}>{item.overallScore?.toFixed(1) || '—'}</div>
            <div style={{ fontSize: '13px', color: '#64748b' }}>Overall Score</div>
          </div>
          <div style={{ flex: 1 }}>
            <ScoreBar label="Exterior" score={item.exteriorScore} color="#3b82f6" />
            <ScoreBar label="Interior" score={item.interiorScore} color="#8b5cf6" />
            <ScoreBar label="Mechanical" score={item.mechanicalScore} color="#10b981" />
            <ScoreBar label="Electrical" score={item.electricalScore} color="#f59e0b" />
          </div>
        </div>
        {item.details && <p style={{ color: '#cbd5e1', lineHeight: 1.6, borderTop: '1px solid rgba(71,85,105,0.3)', paddingTop: '16px' }}>{item.details}</p>}
        <div className="detail-actions">
          <button className="btn btn-ai" onClick={handleAnalyze} disabled={aiLoading}>🤖 {aiLoading ? 'Analyzing...' : 'Run AI Analysis'}</button>
          <button className="btn btn-secondary" onClick={() => setShowEdit(true)}>Edit</button>
          <button className="btn btn-danger" onClick={() => setShowConfirm(true)}>Delete</button>
        </div>
      </div>

      <AIAnalysisDisplay analysis={item.aiAnalysis} loading={aiLoading} />

      <Modal isOpen={showEdit} onClose={() => setShowEdit(false)} title="Edit Condition Score">
        <form onSubmit={handleUpdate}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div className="form-group"><label>Make</label><input value={form.vehicleMake || ''} onChange={(e) => setForm({ ...form, vehicleMake: e.target.value })} required /></div>
            <div className="form-group"><label>Model</label><input value={form.vehicleModel || ''} onChange={(e) => setForm({ ...form, vehicleModel: e.target.value })} required /></div>
            <div className="form-group"><label>Year</label><input type="number" value={form.vehicleYear || ''} onChange={(e) => setForm({ ...form, vehicleYear: parseInt(e.target.value) })} required /></div>
            <div className="form-group"><label>VIN</label><input value={form.vin || ''} onChange={(e) => setForm({ ...form, vin: e.target.value })} /></div>
            <div className="form-group"><label>Mileage</label><input type="number" value={form.mileage || ''} onChange={(e) => setForm({ ...form, mileage: parseInt(e.target.value) })} /></div>
            <div className="form-group"><label>Exterior Score</label><input type="number" step="0.1" min="0" max="10" value={form.exteriorScore || ''} onChange={(e) => setForm({ ...form, exteriorScore: parseFloat(e.target.value) })} /></div>
            <div className="form-group"><label>Interior Score</label><input type="number" step="0.1" min="0" max="10" value={form.interiorScore || ''} onChange={(e) => setForm({ ...form, interiorScore: parseFloat(e.target.value) })} /></div>
            <div className="form-group"><label>Mechanical Score</label><input type="number" step="0.1" min="0" max="10" value={form.mechanicalScore || ''} onChange={(e) => setForm({ ...form, mechanicalScore: parseFloat(e.target.value) })} /></div>
            <div className="form-group"><label>Electrical Score</label><input type="number" step="0.1" min="0" max="10" value={form.electricalScore || ''} onChange={(e) => setForm({ ...form, electricalScore: parseFloat(e.target.value) })} /></div>
            <div className="form-group"><label>Grade</label><input value={form.grade || ''} onChange={(e) => setForm({ ...form, grade: e.target.value })} /></div>
          </div>
          <div className="form-group"><label>Details</label><textarea rows="3" value={form.details || ''} onChange={(e) => setForm({ ...form, details: e.target.value })} /></div>
          <div className="modal-actions">
            <button type="button" className="btn btn-secondary" onClick={() => setShowEdit(false)}>Cancel</button>
            <button type="submit" className="btn btn-primary">Save Changes</button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog isOpen={showConfirm} onClose={() => setShowConfirm(false)} onConfirm={handleDelete} message="Delete this condition score?" />
    </div>
  );
}

export default ConditionScoreDetail;
