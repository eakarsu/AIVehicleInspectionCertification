import React, { useState } from 'react';
import { getInspections, visionAnalyzeInspection } from '../services/api';
import { toast } from 'react-toastify';

const SEVERITY_COLORS = { minor: 'green', moderate: 'yellow', severe: 'red', unknown: 'gray' };

export default function VisionDamageDetector() {
  const [inspectionId, setInspectionId] = useState('');
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleFileChange = (e) => {
    const f = e.target.files[0];
    if (!f) return;
    setFile(f);
    setPreview(URL.createObjectURL(f));
  };

  const handleAnalyze = async (e) => {
    e.preventDefault();
    if (!inspectionId) { toast.error('Enter an inspection ID'); return; }
    setLoading(true);
    try {
      const formData = new FormData();
      if (file) formData.append('image', file);
      const res = await visionAnalyzeInspection(inspectionId, formData);
      setResult(res.data);
      toast.success('Vision analysis complete');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Vision analysis failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-bold text-white mb-6">Vision Damage Detector</h1>
      <form onSubmit={handleAnalyze} className="bg-gray-800 rounded-lg p-6 mb-6">
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-gray-300 text-sm font-medium mb-2">Inspection ID</label>
            <input
              type="number"
              value={inspectionId}
              onChange={(e) => setInspectionId(e.target.value)}
              placeholder="Enter inspection ID"
              className="w-full bg-gray-700 text-white px-4 py-2 rounded-lg border border-gray-600 focus:border-blue-500 focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-gray-300 text-sm font-medium mb-2">Vehicle Photo (optional)</label>
            <input type="file" accept="image/*" onChange={handleFileChange} className="w-full text-gray-300 text-sm" />
          </div>
        </div>
        {preview && (
          <div className="mb-4">
            <img src={preview} alt="Preview" className="max-h-48 rounded-lg border border-gray-600" />
          </div>
        )}
        <button
          type="submit"
          disabled={loading}
          className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded-lg font-medium disabled:opacity-50 transition-colors"
        >
          {loading ? 'Analyzing...' : 'Analyze Damage'}
        </button>
      </form>

      {result && (
        <div className="bg-gray-800 rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-white">Damage Analysis Results</h2>
            <span className={`px-3 py-1 rounded-full text-sm font-medium bg-${SEVERITY_COLORS[result.overall_severity] || 'gray'}-900 text-${SEVERITY_COLORS[result.overall_severity] || 'gray'}-300 border border-${SEVERITY_COLORS[result.overall_severity] || 'gray'}-600`}>
              Overall: {result.overall_severity?.toUpperCase()}
            </span>
          </div>

          {result.damage_areas?.length > 0 ? (
            <div className="space-y-3 mb-4">
              {result.damage_areas.map((area, i) => (
                <div key={i} className="bg-gray-700 rounded-lg p-4">
                  <div className="flex justify-between items-start">
                    <span className="text-white font-medium">{area.location}</span>
                    <span className={`text-xs px-2 py-1 rounded bg-${SEVERITY_COLORS[area.severity] || 'gray'}-800 text-${SEVERITY_COLORS[area.severity] || 'gray'}-300`}>{area.severity}</span>
                  </div>
                  <p className="text-gray-400 text-sm mt-1">{area.description}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-400 mb-4">No specific damage areas identified</p>
          )}

          <div className="flex justify-between items-center bg-gray-700 rounded-lg p-4">
            <span className="text-gray-300">Estimated Repair Cost</span>
            <span className="text-green-400 font-bold text-xl">${result.repair_cost_estimate?.toLocaleString() || 0}</span>
          </div>

          {result.annotated_notes && (
            <div className="mt-4 bg-gray-700 rounded-lg p-4">
              <p className="text-gray-400 text-sm"><strong className="text-white">Notes:</strong> {result.annotated_notes}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
