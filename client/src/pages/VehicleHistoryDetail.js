import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { getVehicleHistory, updateVehicleHistory, deleteVehicleHistory, analyzeVehicleHistory } from '../services/api';
import { Modal, ConfirmDialog } from '../components/Modal';
import AIAnalysisDisplay from '../components/AIAnalysisDisplay';

function VehicleHistoryDetail() {
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
      try { const res = await getVehicleHistory(id); setItem(res.data); setForm(res.data); } catch { toast.error('Failed'); navigate('/vehicle-history'); }
      setLoading(false);
    })();
  }, [id]);

  const handleUpdate = async (e) => {
    e.preventDefault();
    try { const res = await updateVehicleHistory(id, form); setItem(res.data); setShowEdit(false); toast.success('Updated'); } catch { toast.error('Failed'); }
  };

  const handleDelete = async () => {
    try { await deleteVehicleHistory(id); toast.success('Deleted'); navigate('/vehicle-history'); } catch { toast.error('Failed'); }
  };

  const handleAnalyze = async () => {
    setAiLoading(true);
    try { const res = await analyzeVehicleHistory(id); setItem(res.data); toast.success('AI analysis complete'); } catch { toast.error('AI analysis failed'); }
    setAiLoading(false);
  };

  if (loading) return <div style={{ padding: '40px', textAlign: 'center' }}>Loading...</div>;
  if (!item) return null;

  return (
    <div className="detail-page">
      <button className="back-btn" onClick={() => navigate('/vehicle-history')}>← Back to Vehicle History</button>
      <div className="page-header"><h1>{item.vehicleYear} {item.vehicleMake} {item.vehicleModel}</h1></div>

      <div className="detail-card">
        <h2>Vehicle History Report</h2>
        <div className="detail-grid">
          <div className="detail-field"><span className="label">Make</span><span className="value">{item.vehicleMake}</span></div>
          <div className="detail-field"><span className="label">Model</span><span className="value">{item.vehicleModel}</span></div>
          <div className="detail-field"><span className="label">Year</span><span className="value">{item.vehicleYear}</span></div>
          <div className="detail-field"><span className="label">VIN</span><span className="value" style={{ fontFamily: 'monospace' }}>{item.vin}</span></div>
          <div className="detail-field"><span className="label">Owners</span><span className="value">{item.owners}</span></div>
          <div className="detail-field"><span className="label">Accidents</span><span className="value" style={{ color: item.accidents > 0 ? '#f87171' : '#34d399' }}>{item.accidents === 0 ? 'None reported' : item.accidents}</span></div>
          <div className="detail-field"><span className="label">Service Records</span><span className="value">{item.serviceRecords}</span></div>
          <div className="detail-field"><span className="label">Title Status</span><span className="value"><span className={`badge badge-${item.titleStatus}`}>{item.titleStatus}</span></span></div>
          <div className="detail-field"><span className="label">Last Service</span><span className="value">{item.lastServiceDate || '—'}</span></div>
        </div>

        {item.odometerReadings && item.odometerReadings.length > 0 && (
          <div style={{ marginTop: '24px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '12px', color: '#e2e8f0' }}>Odometer History</h3>
            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
              {item.odometerReadings.map((reading, i) => (
                <div key={i} style={{ background: 'rgba(59,130,246,0.05)', border: '1px solid rgba(59,130,246,0.2)', borderRadius: '10px', padding: '12px 16px', minWidth: '140px' }}>
                  <div style={{ fontSize: '12px', color: '#64748b' }}>{reading.date}</div>
                  <div style={{ fontSize: '16px', fontWeight: 700, color: '#e2e8f0' }}>{reading.miles?.toLocaleString()} mi</div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="detail-actions">
          <button className="btn btn-ai" onClick={handleAnalyze} disabled={aiLoading}>🤖 {aiLoading ? 'Analyzing...' : 'Run AI Analysis'}</button>
          <button className="btn btn-secondary" onClick={() => setShowEdit(true)}>Edit</button>
          <button className="btn btn-danger" onClick={() => setShowConfirm(true)}>Delete</button>
        </div>
      </div>

      <AIAnalysisDisplay analysis={item.aiAnalysis} loading={aiLoading} />

      <Modal isOpen={showEdit} onClose={() => setShowEdit(false)} title="Edit Vehicle History">
        <form onSubmit={handleUpdate}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div className="form-group"><label>Make</label><input value={form.vehicleMake || ''} onChange={(e) => setForm({ ...form, vehicleMake: e.target.value })} required /></div>
            <div className="form-group"><label>Model</label><input value={form.vehicleModel || ''} onChange={(e) => setForm({ ...form, vehicleModel: e.target.value })} required /></div>
            <div className="form-group"><label>Year</label><input type="number" value={form.vehicleYear || ''} onChange={(e) => setForm({ ...form, vehicleYear: parseInt(e.target.value) })} required /></div>
            <div className="form-group"><label>VIN</label><input value={form.vin || ''} onChange={(e) => setForm({ ...form, vin: e.target.value })} required /></div>
            <div className="form-group"><label>Owners</label><input type="number" value={form.owners || ''} onChange={(e) => setForm({ ...form, owners: parseInt(e.target.value) })} /></div>
            <div className="form-group"><label>Accidents</label><input type="number" value={form.accidents || 0} onChange={(e) => setForm({ ...form, accidents: parseInt(e.target.value) })} /></div>
            <div className="form-group"><label>Service Records</label><input type="number" value={form.serviceRecords || 0} onChange={(e) => setForm({ ...form, serviceRecords: parseInt(e.target.value) })} /></div>
            <div className="form-group">
              <label>Title Status</label>
              <select value={form.titleStatus || 'clean'} onChange={(e) => setForm({ ...form, titleStatus: e.target.value })}>
                <option value="clean">Clean</option><option value="salvage">Salvage</option><option value="rebuilt">Rebuilt</option><option value="flood">Flood</option><option value="lemon">Lemon</option>
              </select>
            </div>
          </div>
          <div className="modal-actions">
            <button type="button" className="btn btn-secondary" onClick={() => setShowEdit(false)}>Cancel</button>
            <button type="submit" className="btn btn-primary">Save Changes</button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog isOpen={showConfirm} onClose={() => setShowConfirm(false)} onConfirm={handleDelete} message="Delete this vehicle history?" />
    </div>
  );
}

export default VehicleHistoryDetail;
