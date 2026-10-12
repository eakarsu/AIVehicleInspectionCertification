import vehicleAIExamples from "../components/vehicleAIExamples";
import CompleteAIExamples, { AIRequiredButton } from "../components/CompleteAIExamples";
import React, { useState } from 'react';
import { aiRecallSummary } from '../services/api';
import { toast } from 'react-toastify';
import FormattedAIReport from '../components/FormattedAIReport';

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
      <CompleteAIExamples presets={vehicleAIExamples} busy={loading} context="Vehicle planning review"><form onSubmit={handleSubmit} className="bg-gray-800 rounded-lg p-6 mb-6 space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-gray-300 text-sm font-medium mb-2">Recall ID</label>
            <input data-ai-field="recall_id" name="recall_id" value={form.recall_id} onChange={handleChange}
              className="w-full bg-gray-700 text-white px-4 py-2 rounded-lg border border-gray-600 focus:border-blue-500 focus:outline-none" />
          </div>
          <div>
            <label className="block text-gray-300 text-sm font-medium mb-2">Make</label>
            <input data-ai-field="make" name="make" value={form.make} onChange={handleChange}
              className="w-full bg-gray-700 text-white px-4 py-2 rounded-lg border border-gray-600 focus:border-blue-500 focus:outline-none" />
          </div>
          <div>
            <label className="block text-gray-300 text-sm font-medium mb-2">Model</label>
            <input data-ai-field="model" name="model" value={form.model} onChange={handleChange}
              className="w-full bg-gray-700 text-white px-4 py-2 rounded-lg border border-gray-600 focus:border-blue-500 focus:outline-none" />
          </div>
          <div>
            <label className="block text-gray-300 text-sm font-medium mb-2">Year</label>
            <input data-ai-field="year" name="year" type="number" value={form.year} onChange={handleChange}
              className="w-full bg-gray-700 text-white px-4 py-2 rounded-lg border border-gray-600 focus:border-blue-500 focus:outline-none" />
          </div>
        </div>
        <div>
          <label className="block text-gray-300 text-sm font-medium mb-2">Recall Description</label>
          <textarea data-ai-field="description" name="description" rows="6" value={form.description} onChange={handleChange} required
            className="w-full bg-gray-700 text-white px-4 py-2 rounded-lg border border-gray-600 focus:border-blue-500 focus:outline-none" />
        </div>
        <AIRequiredButton data-ai-generate type="submit" disabled={loading}
          className="bg-orange-600 hover:bg-orange-700 text-white px-6 py-2 rounded-lg font-medium disabled:opacity-50 transition-colors">
          {loading ? 'Summarizing…' : 'Generate Summary'}
        </AIRequiredButton>
      </form></CompleteAIExamples>

      {error && (
        <div className="bg-red-900 border border-red-600 rounded-lg p-4 mb-4">
          <p className="text-red-200 text-sm">{error}</p>
        </div>
      )}

      {result && (
        <div className="bg-gray-800 rounded-lg p-6">
          <h2 className="text-xl font-semibold text-white mb-4">Summary</h2>
          <div className="prose prose-invert max-w-none text-gray-200">
            <FormattedAIReport response={result} title="Vehicle AI report" />
          </div>
        </div>
      )}
    </div>
  );
}
