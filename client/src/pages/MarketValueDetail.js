import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { getMarketValue, updateMarketValue, deleteMarketValue, analyzeMarketValue } from '../services/api';
import { Modal, ConfirmDialog } from '../components/Modal';
import AIAnalysisDisplay from '../components/AIAnalysisDisplay';

function MarketValueDetail() {
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
      try { const res = await getMarketValue(id); setItem(res.data); setForm(res.data); } catch { toast.error('Failed'); navigate('/market-values'); }
      setLoading(false);
    })();
  }, [id]);

  const handleUpdate = async (e) => {
    e.preventDefault();
    try { const res = await updateMarketValue(id, form); setItem(res.data); setShowEdit(false); toast.success('Updated'); } catch { toast.error('Failed'); }
  };

  const handleDelete = async () => {
    try { await deleteMarketValue(id); toast.success('Deleted'); navigate('/market-values'); } catch { toast.error('Failed'); }
  };

  const handleAnalyze = async () => {
    setAiLoading(true);
    try { const res = await analyzeMarketValue(id); setItem(res.data); toast.success('AI analysis complete'); } catch { toast.error('AI analysis failed'); }
    setAiLoading(false);
  };

  if (loading) return <div style={{ padding: '40px', textAlign: 'center' }}>Loading...</div>;
  if (!item) return null;

  const fmt = (v) => v ? `$${v.toLocaleString()}` : '—';

  return (
    <div className="detail-page">
      <button className="back-btn" onClick={() => navigate('/market-values')}>← Back to Market Values</button>
      <div className="page-header"><h1>{item.vehicleYear} {item.vehicleMake} {item.vehicleModel}</h1></div>

      <div className="detail-card">
        <h2>Vehicle Information</h2>
        <div className="detail-grid">
          <div className="detail-field"><span className="label">Make</span><span className="value">{item.vehicleMake}</span></div>
          <div className="detail-field"><span className="label">Model</span><span className="value">{item.vehicleModel}</span></div>
          <div className="detail-field"><span className="label">Year</span><span className="value">{item.vehicleYear}</span></div>
          <div className="detail-field"><span className="label">VIN</span><span className="value" style={{ fontFamily: 'monospace' }}>{item.vin || '—'}</span></div>
          <div className="detail-field"><span className="label">Mileage</span><span className="value">{item.mileage?.toLocaleString() || '—'}</span></div>
          <div className="detail-field"><span className="label">Condition</span><span className="value">{item.condition || '—'}</span></div>
          <div className="detail-field"><span className="label">Location</span><span className="value">{item.location || '—'}</span></div>
          <div className="detail-field"><span className="label">Market Trend</span><span className="value"><span className={`badge badge-${item.marketTrend}`}>{item.marketTrend}</span></span></div>
        </div>
      </div>

      <div className="detail-card">
        <h2>Valuation</h2>
        <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap' }}>
          <div style={{ textAlign: 'center', padding: '20px', flex: '1', background: 'rgba(16,185,129,0.05)', borderRadius: '12px', border: '1px solid rgba(16,185,129,0.2)' }}>
            <div style={{ fontSize: '36px', fontWeight: 800, color: '#34d399' }}>{fmt(item.estimatedValue)}</div>
            <div style={{ fontSize: '13px', color: '#64748b', marginTop: '4px' }}>Estimated Value</div>
          </div>
          <div style={{ textAlign: 'center', padding: '20px', flex: '1', background: 'rgba(59,130,246,0.05)', borderRadius: '12px', border: '1px solid rgba(59,130,246,0.2)' }}>
            <div style={{ fontSize: '24px', fontWeight: 700, color: '#60a5fa' }}>{fmt(item.lowEstimate)}</div>
            <div style={{ fontSize: '13px', color: '#64748b', marginTop: '4px' }}>Low Estimate</div>
          </div>
          <div style={{ textAlign: 'center', padding: '20px', flex: '1', background: 'rgba(139,92,246,0.05)', borderRadius: '12px', border: '1px solid rgba(139,92,246,0.2)' }}>
            <div style={{ fontSize: '24px', fontWeight: 700, color: '#a78bfa' }}>{fmt(item.highEstimate)}</div>
            <div style={{ fontSize: '13px', color: '#64748b', marginTop: '4px' }}>High Estimate</div>
          </div>
        </div>
        <div className="detail-actions">
          <button className="btn btn-ai" onClick={handleAnalyze} disabled={aiLoading}>🤖 {aiLoading ? 'Analyzing...' : 'Run AI Analysis'}</button>
          <button className="btn btn-secondary" onClick={() => setShowEdit(true)}>Edit</button>
          <button className="btn btn-danger" onClick={() => setShowConfirm(true)}>Delete</button>
        </div>
      </div>

      <AIAnalysisDisplay analysis={item.aiAnalysis} loading={aiLoading} />

      <Modal isOpen={showEdit} onClose={() => setShowEdit(false)} title="Edit Market Value">
        <form onSubmit={handleUpdate}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div className="form-group"><label>Make</label><input value={form.vehicleMake || ''} onChange={(e) => setForm({ ...form, vehicleMake: e.target.value })} required /></div>
            <div className="form-group"><label>Model</label><input value={form.vehicleModel || ''} onChange={(e) => setForm({ ...form, vehicleModel: e.target.value })} required /></div>
            <div className="form-group"><label>Year</label><input type="number" value={form.vehicleYear || ''} onChange={(e) => setForm({ ...form, vehicleYear: parseInt(e.target.value) })} required /></div>
            <div className="form-group"><label>VIN</label><input value={form.vin || ''} onChange={(e) => setForm({ ...form, vin: e.target.value })} /></div>
            <div className="form-group"><label>Mileage</label><input type="number" value={form.mileage || ''} onChange={(e) => setForm({ ...form, mileage: parseInt(e.target.value) })} /></div>
            <div className="form-group">
              <label>Condition</label>
              <select value={form.condition || 'Good'} onChange={(e) => setForm({ ...form, condition: e.target.value })}>
                <option>Excellent</option><option>Very Good</option><option>Good</option><option>Fair</option><option>Poor</option>
              </select>
            </div>
            <div className="form-group"><label>Location</label><input value={form.location || ''} onChange={(e) => setForm({ ...form, location: e.target.value })} /></div>
            <div className="form-group"><label>Estimated Value</label><input type="number" value={form.estimatedValue || ''} onChange={(e) => setForm({ ...form, estimatedValue: parseFloat(e.target.value) })} /></div>
            <div className="form-group"><label>Low Estimate</label><input type="number" value={form.lowEstimate || ''} onChange={(e) => setForm({ ...form, lowEstimate: parseFloat(e.target.value) })} /></div>
            <div className="form-group"><label>High Estimate</label><input type="number" value={form.highEstimate || ''} onChange={(e) => setForm({ ...form, highEstimate: parseFloat(e.target.value) })} /></div>
            <div className="form-group">
              <label>Market Trend</label>
              <select value={form.marketTrend || 'stable'} onChange={(e) => setForm({ ...form, marketTrend: e.target.value })}>
                <option value="rising">Rising</option><option value="stable">Stable</option><option value="declining">Declining</option>
              </select>
            </div>
          </div>
          <div className="modal-actions">
            <button type="button" className="btn btn-secondary" onClick={() => setShowEdit(false)}>Cancel</button>
            <button type="submit" className="btn btn-primary">Save Changes</button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog isOpen={showConfirm} onClose={() => setShowConfirm(false)} onConfirm={handleDelete} message="Delete this valuation?" />
    </div>
  );
}

export default MarketValueDetail;
