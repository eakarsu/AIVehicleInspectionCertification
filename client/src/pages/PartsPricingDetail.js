import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { getPartsPricing, updatePartsPricing, deletePartsPricing, analyzePartsPricing } from '../services/api';
import { Modal, ConfirmDialog } from '../components/Modal';
import AIAnalysisDisplay from '../components/AIAnalysisDisplay';

function PartsPricingDetail() {
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
      try { const res = await getPartsPricing(id); setItem(res.data); setForm(res.data); } catch { toast.error('Failed'); navigate('/parts-pricing'); }
      setLoading(false);
    })();
  }, [id]);

  const handleUpdate = async (e) => { e.preventDefault(); try { const res = await updatePartsPricing(id, form); setItem(res.data); setShowEdit(false); toast.success('Updated'); } catch { toast.error('Failed'); } };
  const handleDelete = async () => { try { await deletePartsPricing(id); toast.success('Deleted'); navigate('/parts-pricing'); } catch { toast.error('Failed'); } };
  const handleAnalyze = async () => { setAiLoading(true); try { const res = await analyzePartsPricing(id); setItem(res.data); toast.success('AI analysis complete'); } catch { toast.error('AI analysis failed'); } setAiLoading(false); };

  if (loading) return <div style={{ padding: '40px', textAlign: 'center' }}>Loading...</div>;
  if (!item) return null;
  const fmt = (v) => v != null ? `$${v.toLocaleString()}` : '—';
  const savings = item.oemPrice && item.aftermarketPrice ? Math.round(((item.oemPrice - item.aftermarketPrice) / item.oemPrice) * 100) : null;

  return (
    <div className="detail-page">
      <button className="back-btn" onClick={() => navigate('/parts-pricing')}>← Back to Parts Pricing</button>
      <div className="page-header"><h1>{item.partName} — {item.vehicleYear} {item.vehicleMake} {item.vehicleModel}</h1></div>

      <div className="detail-card">
        <h2>Part Information</h2>
        <div className="detail-grid">
          <div className="detail-field"><span className="label">Vehicle</span><span className="value">{item.vehicleYear} {item.vehicleMake} {item.vehicleModel}</span></div>
          <div className="detail-field"><span className="label">Part Name</span><span className="value" style={{ fontWeight: 600 }}>{item.partName}</span></div>
          <div className="detail-field"><span className="label">Part Number</span><span className="value" style={{ fontFamily: 'monospace' }}>{item.partNumber || '—'}</span></div>
          <div className="detail-field"><span className="label">Category</span><span className="value">{item.category || '—'}</span></div>
          <div className="detail-field"><span className="label">Supplier</span><span className="value">{item.supplier || '—'}</span></div>
          <div className="detail-field"><span className="label">Availability</span><span className="value"><span className={`badge badge-${item.availability === 'in_stock' ? 'pass' : item.availability === 'discontinued' ? 'fail' : 'conditional'}`}>{item.availability?.replace('_', ' ')}</span></span></div>
        </div>
      </div>

      <div className="detail-card">
        <h2>Pricing Comparison</h2>
        <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
          <div style={{ textAlign: 'center', padding: '20px', flex: '1', background: 'rgba(59,130,246,0.05)', borderRadius: '12px', border: '1px solid rgba(59,130,246,0.2)' }}>
            <div style={{ fontSize: '28px', fontWeight: 800, color: '#60a5fa' }}>{fmt(item.oemPrice)}</div>
            <div style={{ fontSize: '13px', color: '#64748b', marginTop: '4px' }}>OEM Price</div>
          </div>
          <div style={{ textAlign: 'center', padding: '20px', flex: '1', background: 'rgba(16,185,129,0.05)', borderRadius: '12px', border: '1px solid rgba(16,185,129,0.2)' }}>
            <div style={{ fontSize: '28px', fontWeight: 800, color: '#34d399' }}>{fmt(item.aftermarketPrice)}</div>
            <div style={{ fontSize: '13px', color: '#64748b', marginTop: '4px' }}>Aftermarket</div>
            {savings && <div style={{ fontSize: '12px', color: '#34d399', marginTop: '4px' }}>Save {savings}%</div>}
          </div>
          <div style={{ textAlign: 'center', padding: '20px', flex: '1', background: 'rgba(251,191,36,0.05)', borderRadius: '12px', border: '1px solid rgba(251,191,36,0.2)' }}>
            <div style={{ fontSize: '28px', fontWeight: 800, color: '#fbbf24' }}>{fmt(item.usedPrice)}</div>
            <div style={{ fontSize: '13px', color: '#64748b', marginTop: '4px' }}>Used/Recycled</div>
          </div>
          <div style={{ textAlign: 'center', padding: '20px', flex: '1', background: 'rgba(139,92,246,0.05)', borderRadius: '12px', border: '1px solid rgba(139,92,246,0.2)' }}>
            <div style={{ fontSize: '28px', fontWeight: 800, color: '#a78bfa' }}>{fmt(item.laborCost)}</div>
            <div style={{ fontSize: '13px', color: '#64748b', marginTop: '4px' }}>Labor Cost</div>
          </div>
        </div>
        {item.notes && <div style={{ marginTop: '20px' }}><span className="label" style={{ fontSize: '12px', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.5px', color: '#64748b' }}>Notes</span><p style={{ marginTop: '6px', color: '#cbd5e1', lineHeight: 1.6 }}>{item.notes}</p></div>}
        <div className="detail-actions">
          <button className="btn btn-ai" onClick={handleAnalyze} disabled={aiLoading}>🤖 {aiLoading ? 'Analyzing...' : 'Run AI Analysis'}</button>
          <button className="btn btn-secondary" onClick={() => setShowEdit(true)}>Edit</button>
          <button className="btn btn-danger" onClick={() => setShowConfirm(true)}>Delete</button>
        </div>
      </div>

      <AIAnalysisDisplay analysis={item.aiAnalysis} loading={aiLoading} />

      <Modal isOpen={showEdit} onClose={() => setShowEdit(false)} title="Edit Part Pricing">
        <form onSubmit={handleUpdate}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div className="form-group"><label>Make</label><input value={form.vehicleMake || ''} onChange={(e) => setForm({ ...form, vehicleMake: e.target.value })} required /></div>
            <div className="form-group"><label>Model</label><input value={form.vehicleModel || ''} onChange={(e) => setForm({ ...form, vehicleModel: e.target.value })} required /></div>
            <div className="form-group"><label>Year</label><input type="number" value={form.vehicleYear || ''} onChange={(e) => setForm({ ...form, vehicleYear: parseInt(e.target.value) })} required /></div>
            <div className="form-group"><label>Part Name</label><input value={form.partName || ''} onChange={(e) => setForm({ ...form, partName: e.target.value })} required /></div>
            <div className="form-group"><label>Part Number</label><input value={form.partNumber || ''} onChange={(e) => setForm({ ...form, partNumber: e.target.value })} /></div>
            <div className="form-group"><label>Category</label><input value={form.category || ''} onChange={(e) => setForm({ ...form, category: e.target.value })} /></div>
            <div className="form-group"><label>OEM Price</label><input type="number" value={form.oemPrice || ''} onChange={(e) => setForm({ ...form, oemPrice: parseFloat(e.target.value) })} /></div>
            <div className="form-group"><label>Aftermarket</label><input type="number" value={form.aftermarketPrice || ''} onChange={(e) => setForm({ ...form, aftermarketPrice: parseFloat(e.target.value) })} /></div>
            <div className="form-group"><label>Used Price</label><input type="number" value={form.usedPrice || ''} onChange={(e) => setForm({ ...form, usedPrice: parseFloat(e.target.value) })} /></div>
            <div className="form-group"><label>Labor Cost</label><input type="number" value={form.laborCost || ''} onChange={(e) => setForm({ ...form, laborCost: parseFloat(e.target.value) })} /></div>
            <div className="form-group"><label>Supplier</label><input value={form.supplier || ''} onChange={(e) => setForm({ ...form, supplier: e.target.value })} /></div>
            <div className="form-group"><label>Availability</label><select value={form.availability || 'in_stock'} onChange={(e) => setForm({ ...form, availability: e.target.value })}><option value="in_stock">In Stock</option><option value="limited">Limited</option><option value="backordered">Backordered</option><option value="discontinued">Discontinued</option></select></div>
          </div>
          <div className="form-group"><label>Notes</label><textarea rows="2" value={form.notes || ''} onChange={(e) => setForm({ ...form, notes: e.target.value })} /></div>
          <div className="modal-actions">
            <button type="button" className="btn btn-secondary" onClick={() => setShowEdit(false)}>Cancel</button>
            <button type="submit" className="btn btn-primary">Save Changes</button>
          </div>
        </form>
      </Modal>
      <ConfirmDialog isOpen={showConfirm} onClose={() => setShowConfirm(false)} onConfirm={handleDelete} message="Delete this part pricing?" />
    </div>
  );
}

export default PartsPricingDetail;
