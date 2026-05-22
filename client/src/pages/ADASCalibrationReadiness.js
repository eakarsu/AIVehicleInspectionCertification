import React, { useEffect, useState } from 'react';
import api from '../services/api';

const emptyForm = { vin: '', system: '', glassReplaced: false, targetBoard: '', calibrationBay: '', status: 'ready' };

export default function ADASCalibrationReadiness() {
  const [readiness, setReadiness] = useState([]);
  const [summary, setSummary] = useState({ total: 0, ready: 0, blocked: 0 });
  const [form, setForm] = useState(emptyForm);

  const load = async () => {
    const res = await api.get('/adas-calibration-readiness');
    setReadiness(res.data.readiness || []);
    setSummary(res.data.summary || { total: 0, ready: 0, blocked: 0 });
  };

  useEffect(() => { load(); }, []);

  const submit = async (event) => {
    event.preventDefault();
    await api.post('/adas-calibration-readiness', form);
    setForm(emptyForm);
    load();
  };

  return (
    <div className="page">
      <div className="page-header">
        <h1>ADAS Calibration Readiness</h1>
        <p>Validate camera/radar calibration requirements before certificate release.</p>
      </div>
      <div className="stats-grid">
        {['total', 'ready', 'blocked'].map(key => <div className="stat-card" key={key}><h3>{key}</h3><div className="stat-value">{summary[key]}</div></div>)}
      </div>
      <form className="card" onSubmit={submit} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 12, marginBottom: 24 }}>
        {['vin', 'system', 'targetBoard', 'calibrationBay'].map(field => <input key={field} placeholder={field} value={form[field]} onChange={e => setForm({ ...form, [field]: e.target.value })} />)}
        <label><input type="checkbox" checked={form.glassReplaced} onChange={e => setForm({ ...form, glassReplaced: e.target.checked })} /> Glass replaced</label>
        <select value={form.status} onChange={e => setForm({ ...form, status: e.target.value })}><option>ready</option><option>blocked</option><option>parts hold</option></select>
        <button className="btn btn-primary" type="submit">Add Calibration</button>
      </form>
      <table className="data-table">
        <thead><tr>{['VIN', 'System', 'Glass', 'Target', 'Bay', 'Status'].map(h => <th key={h}>{h}</th>)}</tr></thead>
        <tbody>{readiness.map(row => <tr key={row.id}><td>{row.vin}</td><td>{row.system}</td><td>{row.glassReplaced ? 'yes' : 'no'}</td><td>{row.targetBoard}</td><td>{row.calibrationBay}</td><td>{row.status}</td></tr>)}</tbody>
      </table>
    </div>
  );
}
