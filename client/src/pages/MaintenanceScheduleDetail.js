import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { getMaintenanceSchedule, updateMaintenanceSchedule, deleteMaintenanceSchedule, analyzeMaintenanceSchedule } from '../services/api';
import { Modal, ConfirmDialog } from '../components/Modal';
import AIAnalysisDisplay from '../components/AIAnalysisDisplay';

function MaintenanceScheduleDetail() {
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
      try { const res = await getMaintenanceSchedule(id); setItem(res.data); setForm(res.data); } catch { toast.error('Failed'); navigate('/maintenance-schedules'); }
      setLoading(false);
    })();
  }, [id]);

  const handleUpdate = async (e) => { e.preventDefault(); try { const res = await updateMaintenanceSchedule(id, form); setItem(res.data); setShowEdit(false); toast.success('Updated'); } catch { toast.error('Failed'); } };
  const handleDelete = async () => { try { await deleteMaintenanceSchedule(id); toast.success('Deleted'); navigate('/maintenance-schedules'); } catch { toast.error('Failed'); } };
  const handleAnalyze = async () => { setAiLoading(true); try { const res = await analyzeMaintenanceSchedule(id); setItem(res.data); toast.success('AI analysis complete'); } catch { toast.error('AI analysis failed'); } setAiLoading(false); };

  if (loading) return <div style={{ padding: '40px', textAlign: 'center' }}>Loading...</div>;
  if (!item) return null;
  const fmt = (v) => v ? `$${v.toLocaleString()}` : '—';

  return (
    <div className="detail-page">
      <button className="back-btn" onClick={() => navigate('/maintenance-schedules')}>← Back to Maintenance</button>
      <div className="page-header"><h1>{item.vehicleYear} {item.vehicleMake} {item.vehicleModel} — {item.serviceType}</h1></div>

      <div className="detail-card">
        <h2>Maintenance Details</h2>
        <div className="detail-grid">
          <div className="detail-field"><span className="label">Make</span><span className="value">{item.vehicleMake}</span></div>
          <div className="detail-field"><span className="label">Model</span><span className="value">{item.vehicleModel}</span></div>
          <div className="detail-field"><span className="label">Year</span><span className="value">{item.vehicleYear}</span></div>
          <div className="detail-field"><span className="label">VIN</span><span className="value" style={{ fontFamily: 'monospace' }}>{item.vin || '—'}</span></div>
          <div className="detail-field"><span className="label">Mileage</span><span className="value">{item.mileage?.toLocaleString() || '—'}</span></div>
          <div className="detail-field"><span className="label">Service Type</span><span className="value" style={{ fontWeight: 600 }}>{item.serviceType}</span></div>
          <div className="detail-field"><span className="label">Priority</span><span className="value"><span className={`badge badge-${item.priority === 'urgent' ? 'critical' : item.priority === 'high' ? 'severe' : item.priority === 'medium' ? 'conditional' : 'minor'}`}>{item.priority}</span></span></div>
          <div className="detail-field"><span className="label">Status</span><span className="value"><span className={`badge badge-${item.status === 'completed' ? 'pass' : item.status === 'overdue' ? 'fail' : 'conditional'}`}>{item.status}</span></span></div>
          <div className="detail-field"><span className="label">Scheduled</span><span className="value">{item.scheduledDate || '—'}</span></div>
          <div className="detail-field"><span className="label">Completed</span><span className="value">{item.completedDate || '—'}</span></div>
          <div className="detail-field"><span className="label">Est. Cost</span><span className="value currency">{fmt(item.estimatedCost)}</span></div>
          <div className="detail-field"><span className="label">Interval</span><span className="value">{item.intervalMiles ? `Every ${item.intervalMiles.toLocaleString()} miles` : '—'}</span></div>
        </div>
        {item.notes && <div style={{ marginTop: '20px' }}><span className="label" style={{ fontSize: '12px', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.5px', color: '#64748b' }}>Notes</span><p style={{ marginTop: '6px', color: '#cbd5e1', lineHeight: 1.6 }}>{item.notes}</p></div>}
        <div className="detail-actions">
          <button className="btn btn-ai" onClick={handleAnalyze} disabled={aiLoading}>🤖 {aiLoading ? 'Analyzing...' : 'Run AI Analysis'}</button>
          <button className="btn btn-secondary" onClick={() => setShowEdit(true)}>Edit</button>
          <button className="btn btn-danger" onClick={() => setShowConfirm(true)}>Delete</button>
        </div>
      </div>

      <AIAnalysisDisplay analysis={item.aiAnalysis} loading={aiLoading} />

      <Modal isOpen={showEdit} onClose={() => setShowEdit(false)} title="Edit Maintenance">
        <form onSubmit={handleUpdate}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div className="form-group"><label>Make</label><input value={form.vehicleMake || ''} onChange={(e) => setForm({ ...form, vehicleMake: e.target.value })} required /></div>
            <div className="form-group"><label>Model</label><input value={form.vehicleModel || ''} onChange={(e) => setForm({ ...form, vehicleModel: e.target.value })} required /></div>
            <div className="form-group"><label>Year</label><input type="number" value={form.vehicleYear || ''} onChange={(e) => setForm({ ...form, vehicleYear: parseInt(e.target.value) })} required /></div>
            <div className="form-group"><label>Service Type</label><input value={form.serviceType || ''} onChange={(e) => setForm({ ...form, serviceType: e.target.value })} required /></div>
            <div className="form-group"><label>Priority</label><select value={form.priority || 'medium'} onChange={(e) => setForm({ ...form, priority: e.target.value })}><option value="low">Low</option><option value="medium">Medium</option><option value="high">High</option><option value="urgent">Urgent</option></select></div>
            <div className="form-group"><label>Status</label><select value={form.status || 'upcoming'} onChange={(e) => setForm({ ...form, status: e.target.value })}><option value="upcoming">Upcoming</option><option value="overdue">Overdue</option><option value="completed">Completed</option><option value="skipped">Skipped</option></select></div>
            <div className="form-group"><label>Est. Cost</label><input type="number" value={form.estimatedCost || ''} onChange={(e) => setForm({ ...form, estimatedCost: parseFloat(e.target.value) })} /></div>
            <div className="form-group"><label>Mileage</label><input type="number" value={form.mileage || ''} onChange={(e) => setForm({ ...form, mileage: parseInt(e.target.value) })} /></div>
          </div>
          <div className="form-group"><label>Notes</label><textarea rows="2" value={form.notes || ''} onChange={(e) => setForm({ ...form, notes: e.target.value })} /></div>
          <div className="modal-actions">
            <button type="button" className="btn btn-secondary" onClick={() => setShowEdit(false)}>Cancel</button>
            <button type="submit" className="btn btn-primary">Save Changes</button>
          </div>
        </form>
      </Modal>
      <ConfirmDialog isOpen={showConfirm} onClose={() => setShowConfirm(false)} onConfirm={handleDelete} message="Delete this maintenance item?" />
    </div>
  );
}

export default MaintenanceScheduleDetail;
