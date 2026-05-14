import React, { useState, useEffect } from 'react';
import { getInspections, getInspectionCertificatePDF, certifyInspection } from '../services/api';
import { toast } from 'react-toastify';

export default function CertificatePDF() {
  const [inspections, setInspections] = useState([]);
  const [selectedId, setSelectedId] = useState('');
  const [loading, setLoading] = useState(false);
  const [certifying, setCertifying] = useState(false);
  const [certResult, setCertResult] = useState(null);

  useEffect(() => {
    loadInspections();
  }, []);

  const loadInspections = async () => {
    try {
      const res = await getInspections();
      setInspections(res.data.data || res.data);
    } catch (err) {
      toast.error('Failed to load inspections');
    }
  };

  const handleDownloadPDF = async () => {
    if (!selectedId) { toast.error('Select an inspection'); return; }
    setLoading(true);
    try {
      const res = await getInspectionCertificatePDF(selectedId);
      const url = window.URL.createObjectURL(new Blob([res.data], { type: 'application/pdf' }));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `inspection-certificate-${selectedId}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      toast.success('Certificate downloaded');
    } catch (err) {
      toast.error('Failed to download certificate');
    } finally {
      setLoading(false);
    }
  };

  const handleCertify = async () => {
    if (!selectedId) { toast.error('Select an inspection'); return; }
    setCertifying(true);
    try {
      const res = await certifyInspection(selectedId);
      setCertResult(res.data);
      toast.success(`Status: ${res.data.status} - ${res.data.message}`);
    } catch (err) {
      toast.error(err.response?.data?.error || 'Certification failed');
    } finally {
      setCertifying(false);
    }
  };

  const WORKFLOW_STEPS = ['pending', 'inspected', 'compliance_checked', 'certified'];

  return (
    <div className="max-w-3xl mx-auto p-6">
      <h1 className="text-2xl font-bold text-white mb-6">Inspection Certificate & Certification</h1>

      <div className="bg-gray-800 rounded-lg p-6 mb-6">
        <label className="block text-gray-300 text-sm font-medium mb-2">Select Inspection</label>
        <select
          value={selectedId}
          onChange={(e) => { setSelectedId(e.target.value); setCertResult(null); }}
          className="w-full bg-gray-700 text-white px-4 py-2 rounded-lg border border-gray-600 focus:border-blue-500 focus:outline-none mb-4"
        >
          <option value="">-- Select an inspection --</option>
          {(Array.isArray(inspections) ? inspections : []).map((insp) => (
            <option key={insp.id} value={insp.id}>
              #{insp.id} - {insp.vehicleYear} {insp.vehicleMake} {insp.vehicleModel} ({insp.overallStatus})
            </option>
          ))}
        </select>

        <div className="flex gap-3">
          <button
            onClick={handleCertify}
            disabled={certifying || !selectedId}
            className="flex-1 bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-lg font-medium disabled:opacity-50 transition-colors"
          >
            {certifying ? 'Processing...' : 'Advance Certification Workflow'}
          </button>
          <button
            onClick={handleDownloadPDF}
            disabled={loading || !selectedId}
            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg font-medium disabled:opacity-50 transition-colors"
          >
            {loading ? 'Generating...' : 'Download PDF Certificate'}
          </button>
        </div>
      </div>

      {certResult && (
        <div className="bg-gray-800 rounded-lg p-6">
          <h2 className="text-xl font-semibold text-white mb-4">Certification Status</h2>

          {/* Workflow steps */}
          <div className="flex items-center justify-between mb-6">
            {WORKFLOW_STEPS.map((step, idx) => {
              const currentIdx = WORKFLOW_STEPS.indexOf(certResult.status);
              const isCompleted = idx <= currentIdx;
              const isCurrent = idx === currentIdx;
              return (
                <React.Fragment key={step}>
                  <div className="flex flex-col items-center">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${isCompleted ? 'bg-green-600 text-white' : 'bg-gray-700 text-gray-400'} ${isCurrent ? 'ring-2 ring-green-400' : ''}`}>
                      {idx + 1}
                    </div>
                    <p className="text-xs text-gray-400 mt-1 capitalize">{step.replace('_', ' ')}</p>
                  </div>
                  {idx < WORKFLOW_STEPS.length - 1 && (
                    <div className={`flex-1 h-0.5 mx-2 ${idx < currentIdx ? 'bg-green-600' : 'bg-gray-700'}`} />
                  )}
                </React.Fragment>
              );
            })}
          </div>

          <div className={`rounded-lg p-4 ${certResult.status === 'certified' ? 'bg-green-900 border border-green-600' : 'bg-blue-900 border border-blue-600'}`}>
            <p className={`font-semibold ${certResult.status === 'certified' ? 'text-green-300' : 'text-blue-300'}`}>
              {certResult.message}
            </p>
            {certResult.certificateUrl && (
              <button
                onClick={handleDownloadPDF}
                className="mt-2 text-blue-400 underline text-sm"
              >
                Download Certificate
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
