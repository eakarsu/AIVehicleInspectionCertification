import React, { useState } from 'react';
import { aiInsuranceEstimate } from '../services/api';
import { toast } from 'react-toastify';
import ReactMarkdown from 'react-markdown';

export default function AIInsuranceEstimate() {
  const [form, setForm] = useState({
    vehicle: '', damage_description: '', severity: 'moderate'
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
    try {
      const res = await aiInsuranceEstimate(form);
      setResult(res.data);
      toast.success('Estimate generated');
    } catch (err) {
      const msg = err.response?.data?.error || 'Failed to generate estimate';
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-6">
      <h1 className="text-2xl font-bold text-white mb-6">Insurance Estimate (AI)</h1>
      <form onSubmit={handleSubmit} className="bg-gray-800 rounded-lg p-6 mb-6 space-y-4">
        <div>
          <label className="block text-gray-300 text-sm font-medium mb-2">Vehicle (e.g. 2018 Toyota Camry)</label>
          <input name="vehicle" value={form.vehicle} onChange={handleChange} required
            className="w-full bg-gray-700 text-white px-4 py-2 rounded-lg border border-gray-600 focus:border-blue-500 focus:outline-none" />
        </div>
        <div>
          <label className="block text-gray-300 text-sm font-medium mb-2">Damage Description</label>
          <textarea name="damage_description" rows="5" value={form.damage_description} onChange={handleChange} required
            className="w-full bg-gray-700 text-white px-4 py-2 rounded-lg border border-gray-600 focus:border-blue-500 focus:outline-none" />
        </div>
        <div>
          <label className="block text-gray-300 text-sm font-medium mb-2">Severity</label>
          <select name="severity" value={form.severity} onChange={handleChange}
            className="w-full bg-gray-700 text-white px-4 py-2 rounded-lg border border-gray-600 focus:border-blue-500 focus:outline-none">
            <option value="minor">Minor</option>
            <option value="moderate">Moderate</option>
            <option value="major">Major</option>
            <option value="totaled">Totaled</option>
          </select>
        </div>
        <button type="submit" disabled={loading}
          className="bg-teal-600 hover:bg-teal-700 text-white px-6 py-2 rounded-lg font-medium disabled:opacity-50 transition-colors">
          {loading ? 'Estimating…' : 'Generate Estimate'}
        </button>
      </form>

      {error && (
        <div className="bg-red-900 border border-red-600 rounded-lg p-4 mb-4">
          <p className="text-red-200 text-sm">{error}</p>
        </div>
      )}

      {result && (
        <div className="bg-gray-800 rounded-lg p-6">
          <h2 className="text-xl font-semibold text-white mb-4">Estimate</h2>
          <div className="prose prose-invert max-w-none text-gray-200">
            <ReactMarkdown>{result.estimate || result.result || JSON.stringify(result, null, 2)}</ReactMarkdown>
          </div>
        </div>
      )}
    </div>
  );
}
