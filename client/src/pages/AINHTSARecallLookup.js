import React, { useState } from 'react';
import { aiNhtsaRecallLookup } from '../services/api';
import { toast } from 'react-toastify';

export default function AINHTSARecallLookup() {
  const [form, setForm] = useState({ make: '', model: '', year: '', vin: '' });
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const body = {};
      if (form.vin) body.vin = form.vin;
      if (form.make) body.make = form.make;
      if (form.model) body.model = form.model;
      if (form.year) body.year = parseInt(form.year, 10);
      const res = await aiNhtsaRecallLookup(body);
      setResult(res.data);
      toast.success(`NHTSA: ${res.data?.recall_count ?? 0} recall(s)`);
    } catch (err) {
      const status = err.response?.status;
      if (status === 503) {
        const missing = err.response?.data?.missing || 'OPENROUTER_API_KEY';
        setError(`AI not configured. Missing: ${missing}`);
      } else {
        setError(err.response?.data?.error || 'NHTSA lookup failed');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-bold text-white mb-2">NHTSA Recall Lookup (AI)</h1>
      <p className="text-gray-400 text-sm mb-6">Pulls recalls from NHTSA's public API and summarizes them via AI. Provide a VIN OR (make + model + year).</p>
      <form onSubmit={handleSubmit} className="bg-gray-800 rounded-lg p-6 mb-6 space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-gray-300 text-sm font-medium mb-2">VIN</label>
            <input name="vin" value={form.vin} onChange={handleChange} className="w-full bg-gray-700 text-white px-4 py-2 rounded-lg border border-gray-600" />
          </div>
          <div>
            <label className="block text-gray-300 text-sm font-medium mb-2">Year</label>
            <input name="year" type="number" value={form.year} onChange={handleChange} className="w-full bg-gray-700 text-white px-4 py-2 rounded-lg border border-gray-600" />
          </div>
          <div>
            <label className="block text-gray-300 text-sm font-medium mb-2">Make</label>
            <input name="make" value={form.make} onChange={handleChange} className="w-full bg-gray-700 text-white px-4 py-2 rounded-lg border border-gray-600" />
          </div>
          <div>
            <label className="block text-gray-300 text-sm font-medium mb-2">Model</label>
            <input name="model" value={form.model} onChange={handleChange} className="w-full bg-gray-700 text-white px-4 py-2 rounded-lg border border-gray-600" />
          </div>
        </div>
        <button type="submit" disabled={loading} className="bg-orange-600 hover:bg-orange-700 text-white px-6 py-2 rounded-lg font-medium disabled:opacity-50">
          {loading ? 'Looking up…' : 'Lookup Recalls'}
        </button>
      </form>

      {error && <div className="bg-red-900 border border-red-600 rounded-lg p-4 mb-4"><p className="text-red-200 text-sm">{error}</p></div>}

      {result && (
        <div className="bg-gray-800 rounded-lg p-6 space-y-4">
          <div className="text-sm text-gray-300">
            <strong>Recalls Returned:</strong> {result.recall_count ?? 0}
            {' · '}
            <strong>NHTSA API key configured:</strong> {String(!!result.nhtsa_api_key_configured)}
          </div>
          {result.ai_summary && (
            <div>
              <h3 className="text-lg font-semibold text-white mb-2">AI Summary</h3>
              <pre className="bg-gray-900 text-gray-200 p-3 rounded text-xs overflow-auto max-h-72">{JSON.stringify(result.ai_summary, null, 2)}</pre>
            </div>
          )}
          <div>
            <h3 className="text-lg font-semibold text-white mb-2">Raw Recalls</h3>
            <pre className="bg-gray-900 text-gray-200 p-3 rounded text-xs overflow-auto max-h-96">{JSON.stringify(result.recalls, null, 2)}</pre>
          </div>
        </div>
      )}
    </div>
  );
}
