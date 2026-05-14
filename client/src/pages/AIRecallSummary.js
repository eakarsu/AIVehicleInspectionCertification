import React, { useState } from 'react';
import { aiRecallSummary } from '../services/api';
import { toast } from 'react-toastify';
import ReactMarkdown from 'react-markdown';

export default function AIRecallSummary() {
  const [form, setForm] = useState({
    recall_id: '', make: '', model: '', year: '', description: ''
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
      const res = await aiRecallSummary(form);
      setResult(res.data);
      toast.success('Summary generated');
    } catch (err) {
      const msg = err.response?.data?.error || 'Failed to generate summary';
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-6">
      <h1 className="text-2xl font-bold text-white mb-6">Recall Summary (AI)</h1>
      <form onSubmit={handleSubmit} className="bg-gray-800 rounded-lg p-6 mb-6 space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-gray-300 text-sm font-medium mb-2">Recall ID</label>
            <input name="recall_id" value={form.recall_id} onChange={handleChange}
              className="w-full bg-gray-700 text-white px-4 py-2 rounded-lg border border-gray-600 focus:border-blue-500 focus:outline-none" />
          </div>
          <div>
            <label className="block text-gray-300 text-sm font-medium mb-2">Make</label>
            <input name="make" value={form.make} onChange={handleChange}
              className="w-full bg-gray-700 text-white px-4 py-2 rounded-lg border border-gray-600 focus:border-blue-500 focus:outline-none" />
          </div>
          <div>
            <label className="block text-gray-300 text-sm font-medium mb-2">Model</label>
            <input name="model" value={form.model} onChange={handleChange}
              className="w-full bg-gray-700 text-white px-4 py-2 rounded-lg border border-gray-600 focus:border-blue-500 focus:outline-none" />
          </div>
          <div>
            <label className="block text-gray-300 text-sm font-medium mb-2">Year</label>
            <input name="year" type="number" value={form.year} onChange={handleChange}
              className="w-full bg-gray-700 text-white px-4 py-2 rounded-lg border border-gray-600 focus:border-blue-500 focus:outline-none" />
          </div>
        </div>
        <div>
          <label className="block text-gray-300 text-sm font-medium mb-2">Recall Description</label>
          <textarea name="description" rows="6" value={form.description} onChange={handleChange} required
            className="w-full bg-gray-700 text-white px-4 py-2 rounded-lg border border-gray-600 focus:border-blue-500 focus:outline-none" />
        </div>
        <button type="submit" disabled={loading}
          className="bg-orange-600 hover:bg-orange-700 text-white px-6 py-2 rounded-lg font-medium disabled:opacity-50 transition-colors">
          {loading ? 'Summarizing…' : 'Generate Summary'}
        </button>
      </form>

      {error && (
        <div className="bg-red-900 border border-red-600 rounded-lg p-4 mb-4">
          <p className="text-red-200 text-sm">{error}</p>
        </div>
      )}

      {result && (
        <div className="bg-gray-800 rounded-lg p-6">
          <h2 className="text-xl font-semibold text-white mb-4">Summary</h2>
          <div className="prose prose-invert max-w-none text-gray-200">
            <ReactMarkdown>{result.summary || result.result || JSON.stringify(result, null, 2)}</ReactMarkdown>
          </div>
        </div>
      )}
    </div>
  );
}
