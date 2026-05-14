import React, { useState } from 'react';
import { aiPredictiveMaintenance } from '../services/api';
import { toast } from 'react-toastify';
import ReactMarkdown from 'react-markdown';

export default function AIPredictiveMaintenance() {
  const [form, setForm] = useState({
    make: '', model: '', year: '', mileage: '', age: '', condition_score: ''
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
      const res = await aiPredictiveMaintenance(form);
      setResult(res.data);
      toast.success('Maintenance plan generated');
    } catch (err) {
      const msg = err.response?.data?.error || 'Failed to generate plan';
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-6">
      <h1 className="text-2xl font-bold text-white mb-6">Predictive Maintenance (AI)</h1>
      <form onSubmit={handleSubmit} className="bg-gray-800 rounded-lg p-6 mb-6 space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-gray-300 text-sm font-medium mb-2">Make</label>
            <input name="make" value={form.make} onChange={handleChange} required
              className="w-full bg-gray-700 text-white px-4 py-2 rounded-lg border border-gray-600 focus:border-blue-500 focus:outline-none" />
          </div>
          <div>
            <label className="block text-gray-300 text-sm font-medium mb-2">Model</label>
            <input name="model" value={form.model} onChange={handleChange} required
              className="w-full bg-gray-700 text-white px-4 py-2 rounded-lg border border-gray-600 focus:border-blue-500 focus:outline-none" />
          </div>
          <div>
            <label className="block text-gray-300 text-sm font-medium mb-2">Year</label>
            <input name="year" type="number" value={form.year} onChange={handleChange}
              className="w-full bg-gray-700 text-white px-4 py-2 rounded-lg border border-gray-600 focus:border-blue-500 focus:outline-none" />
          </div>
          <div>
            <label className="block text-gray-300 text-sm font-medium mb-2">Mileage</label>
            <input name="mileage" type="number" value={form.mileage} onChange={handleChange}
              className="w-full bg-gray-700 text-white px-4 py-2 rounded-lg border border-gray-600 focus:border-blue-500 focus:outline-none" />
          </div>
          <div>
            <label className="block text-gray-300 text-sm font-medium mb-2">Age (years)</label>
            <input name="age" type="number" value={form.age} onChange={handleChange}
              className="w-full bg-gray-700 text-white px-4 py-2 rounded-lg border border-gray-600 focus:border-blue-500 focus:outline-none" />
          </div>
          <div>
            <label className="block text-gray-300 text-sm font-medium mb-2">Condition Score (0-100)</label>
            <input name="condition_score" type="number" value={form.condition_score} onChange={handleChange}
              className="w-full bg-gray-700 text-white px-4 py-2 rounded-lg border border-gray-600 focus:border-blue-500 focus:outline-none" />
          </div>
        </div>
        <button type="submit" disabled={loading}
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium disabled:opacity-50 transition-colors">
          {loading ? 'Analyzing…' : 'Generate Plan'}
        </button>
      </form>

      {error && (
        <div className="bg-red-900 border border-red-600 rounded-lg p-4 mb-4">
          <p className="text-red-200 text-sm">{error}</p>
        </div>
      )}

      {result && (
        <div className="bg-gray-800 rounded-lg p-6">
          <h2 className="text-xl font-semibold text-white mb-4">Maintenance Plan</h2>
          <div className="prose prose-invert max-w-none text-gray-200">
            <ReactMarkdown>{result.plan || result.result || JSON.stringify(result, null, 2)}</ReactMarkdown>
          </div>
        </div>
      )}
    </div>
  );
}
