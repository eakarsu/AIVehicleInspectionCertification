import React, { useState } from 'react';
import { aiPartsPriceMonitor } from '../services/api';
import { toast } from 'react-toastify';

export default function AIPartsPriceMonitor() {
  const [form, setForm] = useState({
    parts: 'brake pads, control arm, oxygen sensor',
    make: '', model: '', year: '',
    region: 'US', currency: 'USD',
  });
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResult(null);
    const partsList = (form.parts || '').split(',').map(s => s.trim()).filter(Boolean);
    if (partsList.length === 0) {
      setError('Provide at least one part');
      setLoading(false);
      return;
    }
    try {
      const res = await aiPartsPriceMonitor({
        parts: partsList,
        vehicle: { make: form.make, model: form.model, year: form.year ? parseInt(form.year, 10) : null },
        region: form.region,
        currency: form.currency,
      });
      setResult(res.data);
      toast.success('Pricing estimate generated');
    } catch (err) {
      const status = err.response?.status;
      if (status === 503) {
        const missing = err.response?.data?.missing || 'OPENROUTER_API_KEY';
        setError(`AI not configured. Missing: ${missing}`);
      } else {
        setError(err.response?.data?.error || 'Pricing failed');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-bold text-white mb-2">Parts Price Monitor (AI advisory)</h1>
      <p className="text-gray-400 text-sm mb-6">Advisory price ranges per part. Not a live supplier quote — set <code>PARTS_SUPPLIER_API_KEY</code> on the backend for future supplier integration.</p>
      <form onSubmit={handleSubmit} className="bg-gray-800 rounded-lg p-6 mb-6 space-y-4">
        <div>
          <label className="block text-gray-300 text-sm font-medium mb-2">Parts (comma-separated, max 30)</label>
          <input name="parts" value={form.parts} onChange={handleChange} className="w-full bg-gray-700 text-white px-4 py-2 rounded-lg border border-gray-600" />
        </div>
        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="block text-gray-300 text-sm font-medium mb-2">Make</label>
            <input name="make" value={form.make} onChange={handleChange} className="w-full bg-gray-700 text-white px-4 py-2 rounded-lg border border-gray-600" />
          </div>
          <div>
            <label className="block text-gray-300 text-sm font-medium mb-2">Model</label>
            <input name="model" value={form.model} onChange={handleChange} className="w-full bg-gray-700 text-white px-4 py-2 rounded-lg border border-gray-600" />
          </div>
          <div>
            <label className="block text-gray-300 text-sm font-medium mb-2">Year</label>
            <input name="year" type="number" value={form.year} onChange={handleChange} className="w-full bg-gray-700 text-white px-4 py-2 rounded-lg border border-gray-600" />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-gray-300 text-sm font-medium mb-2">Region</label>
            <input name="region" value={form.region} onChange={handleChange} className="w-full bg-gray-700 text-white px-4 py-2 rounded-lg border border-gray-600" />
          </div>
          <div>
            <label className="block text-gray-300 text-sm font-medium mb-2">Currency</label>
            <input name="currency" value={form.currency} onChange={handleChange} className="w-full bg-gray-700 text-white px-4 py-2 rounded-lg border border-gray-600" />
          </div>
        </div>
        <button type="submit" disabled={loading} className="bg-orange-600 hover:bg-orange-700 text-white px-6 py-2 rounded-lg font-medium disabled:opacity-50">
          {loading ? 'Estimating…' : 'Estimate Prices'}
        </button>
      </form>

      {error && <div className="bg-red-900 border border-red-600 rounded-lg p-4 mb-4"><p className="text-red-200 text-sm">{error}</p></div>}

      {result && (
        <div className="bg-gray-800 rounded-lg p-6">
          <div className="text-sm text-gray-300 mb-3">
            <strong>Supplier feed configured:</strong> {String(!!result.supplier_feed_configured)}
          </div>
          <pre className="bg-gray-900 text-gray-200 p-3 rounded text-xs overflow-auto max-h-96">{JSON.stringify(result.result, null, 2)}</pre>
        </div>
      )}
    </div>
  );
}
