import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { getInsuranceEstimate, updateInsuranceEstimate, deleteInsuranceEstimate, analyzeInsuranceEstimate } from '../services/api';
import { Modal, ConfirmDialog } from '../components/Modal';
import AIAnalysisDisplay from '../components/AIAnalysisDisplay';

function InsuranceEstimateDetail() {
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
      try { const res = await getInsuranceEstimate(id); setItem(res.data); setForm(res.data); } catch { toast.error('Failed'); navigate('/insurance-estimates'); }
      setLoading(false);
    })();
  }, [id]);

  const handleUpdate = async (e) => { e.preventDefault(); try { const res = await updateInsuranceEstimate(id, form); setItem(res.data); setShowEdit(false); toast.success('Updated'); } catch { toast.error('Failed'); } };
  const handleDelete = async () => { try { await deleteInsuranceEstimate(id); toast.success('Deleted'); navigate('/insurance-estimates'); } catch { toast.error('Failed'); } };
  const handleAnalyze = async () => { setAiLoading(true); try { const res = await analyzeInsuranceEstimate(id); setItem(res.data); toast.success('AI analysis complete'); } catch { toast.error('AI analysis failed'); } setAiLoading(false); };

  if (loading) return <div style={{ padding: '40px', textAlign: 'center' }}>Loading...</div>;
  if (!item) return null;
  const fmt = (v) => v ? `$${v.toLocaleString()}` : '—';

  return (
    <div className="detail-page">
      <button className="back-btn" onClick={() => navigate('/insurance-estimates')}>← Back to Insurance Estimates</button>
      <div className="page-header"><h1>{item.vehicleYear} {item.vehicleMake} {item.vehicleModel}</h1></div>

      <div className="detail-card">
        <h2>Insurance Details</h2>
        <div className="detail-grid">
          <div className="detail-field"><span className="label">Make</span><span className="value">{item.vehicleMake}</span></div>
          <div className="detail-field"><span className="label">Model</span><span className="value">{item.vehicleModel}</span></div>
          <div className="detail-field"><span className="label">Year</span><span className="value">{item.vehicleYear}</span></div>
          <div className="detail-field"><span className="label">VIN</span><span className="value" style={{ fontFamily: 'monospace' }}>{item.vin || '—'}</span></div>
          <div className="detail-field"><span className="label">Driver Age</span><span className="value">{item.driverAge || '—'}</span></div>
          <div className="detail-field"><span className="label">State</span><span className="value">{item.driverState || '—'}</span></div>
          <div className="detail-field"><span className="label">Coverage</span><span className="value"><span className="badge badge-stable">{item.coverageType}</span></span></div>
          <div className="detail-field"><span className="label">Deductible</span><span className="value">{fmt(item.deductible)}</span></div>
          <div className="detail-field"><span className="label">Annual Mileage</span><span className="value">{item.annualMileage?.toLocaleString() || '—'}</span></div>
          <div className="detail-field"><span className="label">Driving Record</span><span className="value"><span className={`badge badge-${item.drivingRecord === 'clean' ? 'pass' : item.drivingRecord === 'accidents' ? 'fail' : 'conditional'}`}>{item.drivingRecord?.replace('_', ' ')}</span></span></div>
        </div>
      </div>

      <div className="detail-card">
        <h2>Premium Estimates</h2>
        <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap' }}>
          <div style={{ textAlign: 'center', padding: '20px', flex: '1', background: 'rgba(59,130,246,0.05)', borderRadius: '12px', border: '1px solid rgba(59,130,246,0.2)' }}>
            <div style={{ fontSize: '36px', fontWeight: 800, color: '#60a5fa' }}>{fmt(item.estimatedMonthly)}</div>
            <div style={{ fontSize: '13px', color: '#64748b', marginTop: '4px' }}>Monthly Premium</div>
          </div>
          <div style={{ textAlign: 'center', padding: '20px', flex: '1', background: 'rgba(16,185,129,0.05)', borderRadius: '12px', border: '1px solid rgba(16,185,129,0.2)' }}>
            <div style={{ fontSize: '36px', fontWeight: 800, color: '#34d399' }}>{fmt(item.estimatedAnnual)}</div>
            <div style={{ fontSize: '13px', color: '#64748b', marginTop: '4px' }}>Annual Premium</div>
          </div>
          <div style={{ textAlign: 'center', padding: '20px', flex: '1', background: item.riskScore > 60 ? 'rgba(239,68,68,0.05)' : item.riskScore > 35 ? 'rgba(251,191,36,0.05)' : 'rgba(16,185,129,0.05)', borderRadius: '12px', border: `1px solid ${item.riskScore > 60 ? 'rgba(239,68,68,0.2)' : item.riskScore > 35 ? 'rgba(251,191,36,0.2)' : 'rgba(16,185,129,0.2)'}` }}>
            <div style={{ fontSize: '36px', fontWeight: 800, color: item.riskScore > 60 ? '#f87171' : item.riskScore > 35 ? '#fbbf24' : '#34d399' }}>{item.riskScore || '—'}</div>
            <div style={{ fontSize: '13px', color: '#64748b', marginTop: '4px' }}>Risk Score</div>
          </div>
        </div>
        <div className="detail-actions">
          <button className="btn btn-ai" onClick={handleAnalyze} disabled={aiLoading}>🤖 {aiLoading ? 'Analyzing...' : 'Run AI Analysis'}</button>
          <button className="btn btn-secondary" onClick={() => setShowEdit(true)}>Edit</button>
          <button className="btn btn-danger" onClick={() => setShowConfirm(true)}>Delete</button>
        </div>
      </div>

      <AIAnalysisDisplay analysis={item.aiAnalysis} loading={aiLoading} />

      <Modal isOpen={showEdit} onClose={() => setShowEdit(false)} title="Edit Insurance Estimate">
        <form onSubmit={handleUpdate}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div className="form-group"><label>Make</label><input value={form.vehicleMake || ''} onChange={(e) => setForm({ ...form, vehicleMake: e.target.value })} required /></div>
            <div className="form-group"><label>Model</label><input value={form.vehicleModel || ''} onChange={(e) => setForm({ ...form, vehicleModel: e.target.value })} required /></div>
            <div className="form-group"><label>Year</label><input type="number" value={form.vehicleYear || ''} onChange={(e) => setForm({ ...form, vehicleYear: parseInt(e.target.value) })} required /></div>
            <div className="form-group"><label>Driver Age</label><input type="number" value={form.driverAge || ''} onChange={(e) => setForm({ ...form, driverAge: parseInt(e.target.value) })} /></div>
            <div className="form-group"><label>State</label><input value={form.driverState || ''} onChange={(e) => setForm({ ...form, driverState: e.target.value })} /></div>
            <div className="form-group"><label>Coverage</label><select value={form.coverageType || 'full'} onChange={(e) => setForm({ ...form, coverageType: e.target.value })}><option value="liability">Liability</option><option value="collision">Collision</option><option value="comprehensive">Comprehensive</option><option value="full">Full</option></select></div>
            <div className="form-group"><label>Deductible</label><input type="number" value={form.deductible || ''} onChange={(e) => setForm({ ...form, deductible: parseFloat(e.target.value) })} /></div>
            <div className="form-group"><label>Monthly Est.</label><input type="number" value={form.estimatedMonthly || ''} onChange={(e) => setForm({ ...form, estimatedMonthly: parseFloat(e.target.value) })} /></div>
            <div className="form-group"><label>Annual Est.</label><input type="number" value={form.estimatedAnnual || ''} onChange={(e) => setForm({ ...form, estimatedAnnual: parseFloat(e.target.value) })} /></div>
            <div className="form-group"><label>Risk Score</label><input type="number" value={form.riskScore || ''} onChange={(e) => setForm({ ...form, riskScore: parseFloat(e.target.value) })} /></div>
          </div>
          <div className="modal-actions">
            <button type="button" className="btn btn-secondary" onClick={() => setShowEdit(false)}>Cancel</button>
            <button type="submit" className="btn btn-primary">Save Changes</button>
          </div>
        </form>
      </Modal>
      <ConfirmDialog isOpen={showConfirm} onClose={() => setShowConfirm(false)} onConfirm={handleDelete} message="Delete this estimate?" />
    </div>
  );
}

export default InsuranceEstimateDetail;
